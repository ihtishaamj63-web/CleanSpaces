import { Router } from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { createCleanupRequest, listMyCleanupRequests } from '../controllers/residentController.js'
import { PLAN_BASE } from '../config/plans.js'
import db from '../db.js'

const router = Router()

// Every /api/resident/* endpoint requires a valid JWT.
router.use(auth)

// GET /api/resident/dashboard — the signed-in resident's zone snapshot.
// "Paid" counts are scoped to the current calendar month because the
// subscription is monthly; a lifetime flag would never reset.
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id
    const [member] = await db.query(
      `SELECT zm.*, z.name AS zone_name, z.plan_type, z.households, z.neighborhood
       FROM zone_members zm JOIN zones z ON z.id = zm.zone_id
       WHERE zm.user_id = ?`, [userId])
    if (member.length === 0) return res.json({ hasZone: false })

    const zone = member[0]
    const [[paid], [mine]] = await Promise.all([
      db.query(
        `SELECT COUNT(DISTINCT user_id) AS c FROM payments
          WHERE zone_id = ? AND status = 'completed'
            AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`, [zone.zone_id]),
      db.query(
        `SELECT COUNT(*) AS c FROM payments
          WHERE user_id = ? AND zone_id = ? AND status = 'completed'
            AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`, [userId, zone.zone_id])
    ])

    res.json({
      hasZone: true,
      zone: {
        name: zone.zone_name,
        neighborhood: zone.neighborhood,
        plan: zone.plan_type,
        households: zone.households,
        paid: paid[0].c,                    // households paid THIS month
        threshold: Math.ceil(zone.households * 0.6),
        per_household_amount: Math.round(PLAN_BASE[zone.plan_type] / zone.households),
        myStatus: mine[0].c > 0 ? 'paid' : 'pending'   // this month, not lifetime
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/resident/payments — this resident's payment history
router.get('/payments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/resident/cleanups — before/after reports for this resident's zone
router.get('/cleanups', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cr.* FROM cleanup_reports cr
       JOIN zone_members zm ON zm.zone_id = cr.zone_id
       WHERE zm.user_id = ? ORDER BY cr.date_cleaned DESC`, [req.user.id])
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/resident/crew — the active crew assigned to this resident's zone
router.get('/crew', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.name, e.role FROM employees e
        JOIN zone_members zm ON zm.zone_id = e.zone_id
       WHERE zm.user_id = ? AND e.status = 'active'
       ORDER BY e.role, e.name`, [req.user.id])
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST — multipart/form-data: text fields + optional photo ('photo' field).
// multer parses the body and leaves the file on req.file.
router.post('/cleanup-requests', upload.single('photo'), createCleanupRequest)
router.get('/cleanup-requests', listMyCleanupRequests)

export default router