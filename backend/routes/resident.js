import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 2

    const [member] = await db.query(
      `SELECT zm.*, z.name AS zone_name, z.plan_type, z.households, z.neighborhood
       FROM zone_members zm JOIN zones z ON z.id = zm.zone_id
       WHERE zm.user_id = ?`, [userId])

    if (member.length === 0) return res.json({ hasZone: false })

    const zone = member[0]
    const [paid] = await db.query(
      "SELECT COUNT(*) AS c FROM zone_members WHERE zone_id = ? AND payment_status = 'paid'", [zone.zone_id])

    const threshold = Math.ceil(zone.households * 0.6)

    res.json({
      hasZone: true,
      zone: {
        name: zone.zone_name,
        neighborhood: zone.neighborhood,
        plan: zone.plan_type,
        households: zone.households,
        paid: paid[0].c,
        threshold,
        myStatus: zone.payment_status
      }
    })
  } catch (err) {
    console.error('DASHBOARD ERROR:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/payments', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 2
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/cleanups', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 2
    const [rows] = await db.query(
      `SELECT cr.* FROM cleanup_reports cr
       JOIN zone_members zm ON zm.zone_id = cr.zone_id
       WHERE zm.user_id = ? ORDER BY cr.date_cleaned DESC`, [userId])
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router