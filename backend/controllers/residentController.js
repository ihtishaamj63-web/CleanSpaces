import pool from '../db.js'

// POST /api/resident/cleanup-requests — multipart/form-data:
// text fields plus an optional photo (handled by the upload middleware,
// which leaves the file details on req.file and the fields on req.body).
export async function createCleanupRequest(req, res) {
  const { location_name, address, suburb, description, preferred_date = null } = req.body
  if (![location_name, address, suburb, description].every((value) => String(value || '').trim())) {
    return res.status(400).json({ message: 'Please provide the place, address, suburb and cleanup details.' })
  }
  // If a photo was uploaded, store its public path; otherwise null
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null
  try {
    const [result] = await pool.execute(
      'INSERT INTO cleanup_requests (user_id, location_name, address, suburb, description, preferred_date, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, location_name.trim(), address.trim(), suburb.trim(), description.trim(), preferred_date || null, photoUrl])
    res.status(201).json({ id: result.insertId, message: 'Your cleanup request has been sent to the CleanSpaces team.' })
  } catch {
    res.status(500).json({ message: 'Unable to submit your cleanup request.' })
  }
}

// GET /api/resident/cleanup-requests — this resident's requests,
// newest first, including photo evidence.
export async function listMyCleanupRequests(req, res) {
  try {
    const [requests] = await pool.execute(
      'SELECT id, location_name, address, suburb, description, preferred_date, photo_url, status, created_at FROM cleanup_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id])
    res.json(requests)
  } catch {
    res.status(500).json({ message: 'Unable to load your cleanup requests.' })
  }
}