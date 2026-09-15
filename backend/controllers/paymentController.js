import crypto from 'crypto'
import db from '../db.js'
import { perHouseholdAmount } from '../config/plans.js'

// Where the Vue app lives — PayFast redirects the browser here after payment
// (pointing it at the API would show raw JSON).
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim()

// POST /api/payments/create — starts a subscription payment for the logged-in resident
export async function createPayment(req, res) {
  try {
    const userId = req.user.id
    const { zone_id, method } = req.body

    if (!Number.isInteger(Number(zone_id)) || !['card', 'eft'].includes(method))
      return res.status(400).json({ message: 'Please choose a zone and a valid payment method.' })

    const [zones] = await db.query('SELECT * FROM zones WHERE id = ? AND status = ?', [zone_id, 'active'])
    if (zones.length === 0) return res.status(400).json({ message: 'Zone not found or not active.' })
    const zone = zones[0]

    // Per-household share from the single pricing source (config/plans.js) —
    // calculated so the zone is fully funded at the 60% activation threshold.
    const amount = perHouseholdAmount(zone.plan_type, zone.households)
    if (!amount) return res.status(400).json({ message: 'Unable to calculate the amount for this zone.' })

    // Ensure the user has a zone_members record
    const [membership] = await db.query(
      'SELECT id FROM zone_members WHERE user_id = ? AND zone_id = ?', [userId, zone_id])
    if (membership.length === 0) {
      await db.query(
        'INSERT INTO zone_members (zone_id, user_id, payment_status) VALUES (?, ?, ?)',
        [zone_id, userId, 'pending'])
    }

    // Insert pending payment
    const [result] = await db.query(
      'INSERT INTO payments (user_id, zone_id, amount, method, status) VALUES (?, ?, ?, ?, ?)',
      [userId, zone_id, amount, method, 'pending'])
    const paymentId = result.insertId

    // DEV BYPASS — complete the payment immediately, no gateway involved.
    // Lets you build/test the resident dashboard without touching PayFast.
    if (process.env.DEV_BYPASS === 'true') {
      await db.query('UPDATE payments SET status = ? WHERE id = ?', ['completed', paymentId])
      await db.query(
        'UPDATE zone_members SET payment_status = ? WHERE user_id = ? AND zone_id = ?',
        ['paid', userId, zone_id])
      const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId])
      return res.json({ bypass: true, payment: rows[0] })
    }

    // Real PayFast flow
    const params = buildPayfastParams(paymentId, amount, zone.name, req)
    res.json({ url: 'https://sandbox.payfast.co.za/eng/process', params })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create payment.' })
  }
}

// GET /api/payments/return/:id — the success page calls this to display the result.
// Scoped to the logged-in user so payment IDs can't be enumerated.
export async function paymentReturn(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Payment not found.' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ message: 'Server error.' })
  }
}

// POST /api/payments/notify — PayFast's ITN webhook, the source of truth.
// NOT JWT-authenticated (PayFast holds no token); secured by signature verification.
export async function paymentNotify(req, res) {
  try {
    const data = req.body
    const paymentId = data.m_payment_id

    if (!verifyPayfastSignature(data)) return res.status(400).json({ message: 'Invalid signature.' })

    if (data.payment_status === 'COMPLETE') {
      await db.query('UPDATE payments SET status = ? WHERE id = ?', ['completed', paymentId])
      const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId])
      if (payment.length > 0) {
        await db.query(
          'UPDATE zone_members SET payment_status = ? WHERE user_id = ? AND zone_id = ?',
          ['paid', payment[0].user_id, payment[0].zone_id])
      }
    }
    res.sendStatus(200)
  } catch {
    res.sendStatus(500)
  }
}

// --- PayFast helpers ---

// PHP-compatible URL encoding. PayFast's reference implementations use PHP's
// urlencode, which differs from JavaScript's encodeURIComponent for six
// characters — most importantly, spaces encode as + instead of %20.
function phpUrlEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

function buildPayfastParams(paymentId, amount, zoneName, req) {
  const params = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID?.trim(),
    merchant_key: process.env.PAYFAST_MERCHANT_KEY?.trim(),
    // Browser redirects go to the Vue app; only the webhook hits the backend.
    return_url: `${FRONTEND_URL}/payment/success/${paymentId}`,
    cancel_url: `${FRONTEND_URL}/payment`,
    notify_url: `${req.protocol}://${req.get('host')}/api/payments/notify`,
    name_first: 'CleanSpaces',
    email_address: process.env.MAIL_USER?.trim() || 'noreply@cleanspaces.co.za',
    m_payment_id: String(paymentId),
    amount: amount.toFixed(2),
    item_name: `CleanSpaces subscription - ${zoneName}`
  }
  params.signature = generateCheckoutSignature(params)
  return params
}

// CHECKOUT signature: the passphrase participates in the alphabetical sort
// (n < p < r), discovered through testing against the sandbox validator.
function generateCheckoutSignature(params) {
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() || ''

  // Merge the passphrase into the parameter set so it sorts naturally
  const allParams = { ...params }
  if (passphrase) allParams.passphrase = passphrase

  let data = Object.keys(allParams)
    .filter((k) => k !== 'signature' && allParams[k] !== '' && allParams[k] !== undefined && allParams[k] !== null)
    .sort()
    .map((k) => `${k}=${phpUrlEncode(allParams[k])}`)
    .join('&')

  return crypto.createHash('md5').update(data).digest('hex')
}

// ITN VERIFICATION signature: per PayFast's documented convention, the
// passphrase is APPENDED after the last sorted parameter — the opposite
// of the checkout signature. The two signature types genuinely differ.
function verifyPayfastSignature(data) {
  const { signature, ...rest } = data
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() || ''

  // Build the sorted string WITHOUT the passphrase in the set
  let dataStr = Object.keys(rest)
    .filter((k) => rest[k] !== '' && rest[k] !== undefined && rest[k] !== null)
    .sort()
    .map((k) => `${k}=${phpUrlEncode(rest[k])}`)
    .join('&')

  // Append the passphrase at the END (documented ITN convention)
  if (passphrase) dataStr += `&passphrase=${phpUrlEncode(passphrase)}`

  const computed = crypto.createHash('md5').update(dataStr).digest('hex')

  // TEMP DEBUG — proves whether the ITN convention matches
  console.log('[ITN Verify Debug] received:', signature, '| computed:', computed, '| match:', computed === signature)

  return computed === signature
}