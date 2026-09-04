import crypto from 'crypto'
import db from '../db.js'

// POST /api/payments/create
export async function createPayment(req, res) {
  try {
    // In production: get user from auth middleware (req.user.id).
    // During development (no auth yet), default to the resident test account.
    const userId = req.user ? req.user.id : 2

    const { zone_id, method } = req.body

    const [zones] = await db.query('SELECT * FROM zones WHERE id = ? AND status = ?', [zone_id, 'active'])
    if (zones.length === 0) {
      return res.status(400).json({ error: 'Zone not found or not active' })
    }
    const zone = zones[0]

    // Per-household share: midpoint of the plan range / households
    const planBase = { small: 4000, medium: 7250, large: 11500 }[zone.plan_type]
    const amount = Math.round(planBase / zone.households)

    // Ensure the user has a zone_members record
    const [membership] = await db.query(
      'SELECT * FROM zone_members WHERE user_id = ? AND zone_id = ?',
      [userId, zone_id]
    )
    if (membership.length === 0) {
      await db.query(
        'INSERT INTO zone_members (zone_id, user_id, payment_status) VALUES (?, ?, ?)',
        [zone_id, userId, 'pending']
      )
    }

    // Insert pending payment
    const [result] = await db.query(
      'INSERT INTO payments (user_id, zone_id, amount, method, status) VALUES (?, ?, ?, ?, ?)',
      [userId, zone_id, amount, method, 'pending']
    )
    const paymentId = result.insertId

    // DEV BYPASS — complete the payment immediately, no gateway
    if (process.env.DEV_BYPASS === 'true') {
      await db.query('UPDATE payments SET status = ? WHERE id = ?', ['completed', paymentId])
      await db.query(
        'UPDATE zone_members SET payment_status = ? WHERE user_id = ? AND zone_id = ?',
        ['paid', userId, zone_id]
      )
      const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId])
      return res.json({ bypass: true, payment: rows[0] })
    }

    // Real PayFast flow
    const params = buildPayfastParams(paymentId, amount, zone.name, req)

    res.json({ url: 'https://sandbox.payfast.co.za/eng/process', params })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create payment' })
  }
}

// PayFast redirects the user back here — display result
export async function paymentReturn(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

// PayFast's ITN (Instant Transaction Notification) webhook — the source of truth
export async function paymentNotify(req, res) {
  try {
    const data = req.body
    const paymentId = data.m_payment_id

    if (!verifyPayfastSignature(data)) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    if (data.payment_status === 'COMPLETE') {
      await db.query('UPDATE payments SET status = ? WHERE id = ?', ['completed', paymentId])
      const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [paymentId])
      if (payment.length > 0) {
        await db.query(
          'UPDATE zone_members SET payment_status = ? WHERE user_id = ? AND zone_id = ?',
          ['paid', payment[0].user_id, payment[0].zone_id]
        )
      }
    }
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
}

// --- PayFast helpers ---

function buildPayfastParams(paymentId, amount, zoneName, req) {
  const host = `${req.protocol}://${req.get('host')}`
  const params = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${host}/api/payments/return/${paymentId}`,
    cancel_url: `${host}/api/payments/return/${paymentId}`,
    notify_url: `${host}/api/payments/notify`,
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
    .filter(k => params[k] !== '' && params[k] !== undefined)
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&')
  if (passphrase) data += `&passphrase=${encodeURIComponent(passphrase)}`
  return crypto.createHash('md5').update(data).digest('hex')
}

function verifyPayfastSignature(data) {
  const { signature, ...rest } = data
  return generateSignature(rest) === signature
}