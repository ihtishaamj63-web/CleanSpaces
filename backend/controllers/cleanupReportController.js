import pool from '../db.js'

export async function listCleanupReports(req, res) {
  try {
    const [reports] = await pool.query('SELECT r.*, z.name AS zone_name, e.name AS employee_name FROM cleanup_reports r JOIN zones z ON z.id = r.zone_id JOIN employees e ON e.id = r.employee_id ORDER BY r.date_cleaned DESC, r.id DESC')
    res.json(reports)
  } catch { res.status(500).json({ message: 'Unable to load cleanup reports.' }) }
}

export async function createCleanupReport(req, res) {
  const { zone_id, employee_id, before_url, after_url, notes, date_cleaned } = req.body
  if (!Number.isInteger(Number(zone_id)) || !Number.isInteger(Number(employee_id)) || ![before_url, after_url, notes, date_cleaned].every((value) => String(value || '').trim())) return res.status(400).json({ message: 'Please complete all cleanup-report fields.' })
  try {
    const [result] = await pool.execute('INSERT INTO cleanup_reports (zone_id, employee_id, before_url, after_url, notes, date_cleaned) VALUES (?, ?, ?, ?, ?, ?)', [Number(zone_id), Number(employee_id), before_url.trim(), after_url.trim(), notes.trim(), date_cleaned])
    res.status(201).json({ id: result.insertId, message: 'Cleanup report saved.' })
  } catch { res.status(500).json({ message: 'Unable to save cleanup report.' }) }
}
