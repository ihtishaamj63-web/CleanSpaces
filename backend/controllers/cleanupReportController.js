import pool from '../db.js'
import fs from 'fs/promises'

export async function listCleanupReports(req, res) {
  try {
    const [reports] = await pool.query('SELECT r.*, z.name AS zone_name, e.name AS employee_name FROM cleanup_reports r JOIN zones z ON z.id = r.zone_id JOIN employees e ON e.id = r.employee_id ORDER BY r.date_cleaned DESC, r.id DESC')
    res.json(reports)
  } catch { res.status(500).json({ message: 'Unable to load cleanup reports.' }) }
}

export async function createCleanupReport(req, res) {
  const { zone_id, employee_id, notes, date_cleaned } = req.body
  const beforePhoto = req.files?.before_photo?.[0]
  const afterPhoto = req.files?.after_photo?.[0]
  const uploadedFiles = [beforePhoto, afterPhoto].filter(Boolean)
  const removeUploads = async () => Promise.all(uploadedFiles.map((file) => fs.unlink(file.path).catch(() => {})))

  if (!Number.isInteger(Number(zone_id)) || !Number.isInteger(Number(employee_id)) || ![notes, date_cleaned].every((value) => String(value || '').trim()) || !beforePhoto || !afterPhoto) {
    await removeUploads()
    return res.status(400).json({ message: 'Complete every cleanup-report field and upload both before and after photos.' })
  }

  const beforeUrl = `/uploads/${beforePhoto.filename}`
  const afterUrl = `/uploads/${afterPhoto.filename}`
  try {
    const [result] = await pool.execute('INSERT INTO cleanup_reports (zone_id, employee_id, before_url, after_url, notes, date_cleaned) VALUES (?, ?, ?, ?, ?, ?)', [Number(zone_id), Number(employee_id), beforeUrl, afterUrl, notes.trim(), date_cleaned])
    res.status(201).json({ id: result.insertId, message: 'Cleanup report saved.' })
  } catch {
    await removeUploads()
    res.status(500).json({ message: 'Unable to save cleanup report.' })
  }
}
