import { Router } from 'express'
import pool from '../db.js'
import auth, { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const [[zones], [employees], [income]] = await Promise.all([
      pool.query("SELECT SUM(status = 'pending') AS pending_zones, SUM(status = 'active') AS active_zones FROM zones"),
      pool.query("SELECT COUNT(*) AS employees FROM employees WHERE status = 'active'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS monthly_income FROM payments WHERE status = 'completed' AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')")
    ])
    res.json({ pending_zones: Number(zones.pending_zones || 0), active_zones: Number(zones.active_zones || 0), employees: Number(employees.employees || 0), monthly_income: Number(income.monthly_income || 0) })
  } catch { res.status(500).json({ message: 'Unable to load dashboard statistics.' }) }
})

router.get('/cleanup-requests', auth, requireAdmin, async (req, res) => {
  try {
    const [requests] = await pool.query("SELECT r.*, u.name AS resident_name, u.phone AS resident_phone, u.email AS resident_email FROM cleanup_requests r JOIN users u ON u.id = r.user_id ORDER BY FIELD(r.status, 'new', 'reviewing', 'scheduled', 'completed'), r.created_at DESC")
    res.json(requests)
  } catch { res.status(500).json({ message: 'Unable to load cleanup requests.' }) }
})

router.put('/cleanup-requests/:id', auth, requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!['new', 'reviewing', 'scheduled', 'completed'].includes(status)) return res.status(400).json({ message: 'Invalid request status.' })
  try {
    const [result] = await pool.execute('UPDATE cleanup_requests SET status = ? WHERE id = ?', [status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Cleanup request not found.' })
    res.json({ message: 'Request status updated.' })
  } catch { res.status(500).json({ message: 'Unable to update cleanup request.' }) }
})

export default router
