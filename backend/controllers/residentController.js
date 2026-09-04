import pool from '../db.js'

export async function createCleanupRequest(req, res) {
  const { location_name, address, suburb, description, preferred_date = null } = req.body
  if (![location_name, address, suburb, description].every((value) => String(value || '').trim())) return res.status(400).json({ message: 'Please provide the place, address, suburb and cleanup details.' })
  try {
    const [result] = await pool.execute('INSERT INTO cleanup_requests (user_id, location_name, address, suburb, description, preferred_date) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, location_name.trim(), address.trim(), suburb.trim(), description.trim(), preferred_date || null])
    res.status(201).json({ id: result.insertId, message: 'Your cleanup request has been sent to the CleanSpaces team.' })
  } catch { res.status(500).json({ message: 'Unable to submit your cleanup request.' }) }
}

export async function listMyCleanupRequests(req, res) {
  try {
    const [requests] = await pool.execute('SELECT id, location_name, address, suburb, description, preferred_date, status, created_at FROM cleanup_requests WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
    res.json(requests)
  } catch { res.status(500).json({ message: 'Unable to load your cleanup requests.' }) }
}
