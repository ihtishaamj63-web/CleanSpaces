// backend/routes/admin.js
import { Router } from 'express'
import pool from '../db.js'
import auth, { requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/admin/dashboard — operations snapshot for the Overview page.
// Each pool.query() resolves to [rows, fields], so Promise.all returns
// [[rows, fields], [rows, fields], ...]. We destructure one level deeper
// to pull out each query's FIRST ROW directly: reading properties off the
// rows *array* (the old bug) always yielded undefined — the Overview
// showed zeros forever, even with real data.
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const [[[zones]], [[crew]], [[income]], [[requests]]] = await Promise.all([
      pool.query("SELECT SUM(status = 'pending') AS pending_zones, SUM(status = 'active') AS active_zones FROM zones"),
      pool.query("SELECT COUNT(*) AS employees FROM employees WHERE status = 'active'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS monthly_income FROM payments WHERE status = 'completed' AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
      pool.query("SELECT COUNT(*) AS new_requests FROM cleanup_requests WHERE status = 'new'")
    ])
    res.json({
      pending_zones: Number(zones?.pending_zones || 0),
      active_zones: Number(zones?.active_zones || 0),
      employees: Number(crew?.employees || 0),
      monthly_income: Number(income?.monthly_income || 0),
      new_requests: Number(requests?.new_requests || 0)
    })
  } catch {
    res.status(500).json({ message: 'Unable to load dashboard statistics.' })
  }
})

// GET /api/admin/cleanup-requests — every resident request, most urgent first
router.get('/cleanup-requests', auth, requireAdmin, async (req, res) => {
  try {
    const [requests] = await pool.query("SELECT r.*, u.name AS resident_name, u.phone AS resident_phone, u.email AS resident_email FROM cleanup_requests r JOIN users u ON u.id = r.user_id ORDER BY FIELD(r.status, 'new', 'reviewing', 'scheduled', 'completed'), r.created_at DESC")
    res.json(requests)
  } catch {
    res.status(500).json({ message: 'Unable to load cleanup requests.' })
  }
})

// PUT /api/admin/cleanup-requests/:id — update a request's status
router.put('/cleanup-requests/:id', auth, requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!['new', 'reviewing', 'scheduled', 'completed'].includes(status)) return res.status(400).json({ message: 'Invalid request status.' })
  try {
    const [result] = await pool.execute('UPDATE cleanup_requests SET status = ? WHERE id = ?', [status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Cleanup request not found.' })
    res.json({ message: 'Request status updated.' })
  } catch {
    res.status(500).json({ message: 'Unable to update cleanup request.' })
  }
})

export default router