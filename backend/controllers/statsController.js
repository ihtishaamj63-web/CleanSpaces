// controllers/statsController.js
import pool from '../db.js'

// GET /api/stats — feeds the homepage animated counters
export async function getStats(req, res) {
  try {
    const [[zones], [households], [cleanups]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS c FROM zones WHERE status = 'active'"),
      pool.query("SELECT COUNT(DISTINCT user_id) AS c FROM zone_members WHERE payment_status = 'paid'"),
      pool.query('SELECT COUNT(*) AS c FROM cleanup_reports')
    ])
    res.json({ active_zones: zones[0].c, households: households[0].c, cleanups: cleanups[0].c })
  } catch {
    res.status(500).json({ message: 'Unable to load stats.' })
  }
}