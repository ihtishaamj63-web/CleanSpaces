import pool from '../db.js'

const plans = new Set(['small', 'medium', 'large'])

export async function registerZone(req, res) {
  const { name, neighborhood, households, plan_type, contact_name, contact_phone } = req.body
  const householdCount = Number(households)
  if (![name, neighborhood, plan_type, contact_name, contact_phone].every((value) => String(value || '').trim()) || !Number.isInteger(householdCount) || householdCount < 1 || !plans.has(plan_type)) {
    return res.status(400).json({ message: 'Please provide a zone name, suburb, household count, plan and contact details.' })
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO zones (name, neighborhood, households, plan_type, status) VALUES (?, ?, ?, ?, \'pending\')',
      [name.trim(), neighborhood.trim(), householdCount, plan_type]
    )
    return res.status(201).json({ message: 'Your zone has been submitted for review.', zone: { id: result.insertId, name, neighborhood, households: householdCount, plan_type, status: 'pending', contact_name, contact_phone } })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register this zone right now.' })
  }
}

export async function listZones(req, res) {
  try {
    const [zones] = await pool.query("SELECT id, name, neighborhood, households, plan_type, status, created_at FROM zones ORDER BY FIELD(status, 'pending', 'active'), created_at DESC")
    return res.json(zones)
  } catch {
    return res.status(500).json({ message: 'Unable to load zones.' })
  }
}

export async function zoneMap(req, res) {
  try {
    const [zones] = await pool.query(`
      SELECT z.id, z.name, z.neighborhood, z.households, z.plan_type, z.status,
        CASE
          WHEN EXISTS (SELECT 1 FROM cleanup_reports cr WHERE cr.zone_id = z.id) THEN 'completed'
          WHEN EXISTS (SELECT 1 FROM cleanup_requests rq WHERE LOWER(rq.suburb) = LOWER(z.neighborhood) AND rq.status IN ('reviewing', 'scheduled')) THEN 'in_progress'
          WHEN z.status = 'active' THEN 'active'
          ELSE 'pending'
        END AS cleanup_status
      FROM zones z ORDER BY z.name
    `)
    return res.json(zones)
  } catch {
    return res.status(500).json({ message: 'Unable to load map areas.' })
  }
}

export async function approveZone(req, res) {
  try {
    const [result] = await pool.execute("UPDATE zones SET status = 'active' WHERE id = ? AND status = 'pending'", [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Pending zone not found.' })
    return res.json({ message: 'Zone approved and activated.' })
  } catch {
    return res.status(500).json({ message: 'Unable to approve this zone.' })
  }
}

export async function rejectZone(req, res) {
  try {
    const [result] = await pool.execute('DELETE FROM zones WHERE id = ? AND status = \'pending\'', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Pending zone not found.' })
    return res.json({ message: 'Zone registration rejected.' })
  } catch {
    return res.status(500).json({ message: 'Unable to reject this zone. It may already have members.' })
  }
}
