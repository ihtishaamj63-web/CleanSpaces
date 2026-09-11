import crypto from 'crypto'
import db from '../db.js'
import { perHouseholdAmount } from '../config/plans.js'

// Where the Vue app lives — PayFast redirects the browser here after payment
// (pointing it at the API would show raw JSON).
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

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

function buildPayfastParams(paymentId, amount, zoneName, req) {
  const params = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    // Browser redirects go to the Vue app; only the webhook hits the backend.
    return_url: `${FRONTEND_URL}/payment/success/${paymentId}`,
    cancel_url: `${FRONTEND_URL}/payment`,
    notify_url: `${req.protocol}://${req.get('host')}/api/payments/notify`,
    name_first: 'CleanSpaces',
    email_address: process.env.MAIL_USER,
    m_payment_id: String(paymentId),
    amount: amount.toFixed(2),
    item_name: `CleanSpaces subscription - ${zoneName}`
  }
  params.signature = generateSignature(params)
  return params
}

function generateSignature(params) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || ''
  let data = Object.keys(params)
    .filter((k) => params[k] !== '' && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  if (passphrase) data += `&passphrase=${encodeURIComponent(passphrase)}`
  return crypto.createHash('md5').update(data).digest('hex')
}

function verifyPayfastSignature(data) {
  const { signature, ...rest } = data
  return generateSignature(rest) === signature
}