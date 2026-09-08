import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createCleanupRequest, listMyCleanupRequests } from '../controllers/residentController.js'
import { PLAN_BASE } from '../config/plans.js'
import db from '../db.js'

const router = Router()

// Every /api/resident/* endpoint requires a valid JWT.
router.use(auth)

// GET /api/resident/dashboard — "paid" counts are scoped to the current
// calendar month because the subscription is monthly; a lifetime flag
// would never reset.
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
        paid: paid[0].c,                 // households paid THIS month
        threshold: Math.ceil(zone.households * 0.6),
        per_household_amount: Math.round(PLAN_BASE[zone.plan_type] / zone.households),
        myStatus: mine[0].c > 0 ? 'paid' : 'pending'   // this month, not lifetime
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/payments', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

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

router.post('/cleanup-requests', createCleanupRequest)
router.get('/cleanup-requests', listMyCleanupRequests)

export default router