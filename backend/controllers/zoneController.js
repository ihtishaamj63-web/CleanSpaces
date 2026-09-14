import pool from '../db.js'
import { perHouseholdAmount } from '../config/plans.js'

const plans = new Set(['small', 'medium', 'large'])

export async function registerZone(req, res) {
  const { name, neighborhood, households, plan_type, contact_name, contact_phone } = req.body
  const householdCount = Number(households)
  if (![name, neighborhood, plan_type, contact_name, contact_phone].every((value) => String(value || '').trim()) || !Number.isInteger(householdCount) || householdCount < 1 || !plans.has(plan_type)) {
    return res.status(400).json({ message: 'Please provide a zone name, suburb, household count, plan and contact details.' })
  }

  try {
    // contact details are stored so the admin can reach the committee
    const [result] = await pool.execute(
      "INSERT INTO zones (name, neighborhood, households, plan_type, contact_name, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
      [name.trim(), neighborhood.trim(), householdCount, plan_type, contact_name.trim(), contact_phone.trim()]
    )
    return res.status(201).json({ message: 'Your zone has been submitted for review.', zone: { id: result.insertId, name, neighborhood, households: householdCount, plan_type, status: 'pending', contact_name, contact_phone } })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register this zone right now.' })
  }
}

export async function listZones(req, res) {
  try {
    const [zones] = await pool.query("SELECT id, name, neighborhood, households, plan_type, contact_name, contact_phone, status, created_at FROM zones ORDER BY FIELD(status, 'pending', 'active'), created_at DESC")
    return res.json(zones)
  } catch {
    return res.status(500).json({ message: 'Unable to load zones.' })
  }
}

// Public: every zone + a service-status flag, used by the homepage map
// and the payment page's zone picker.
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
    // Per-household share from the single pricing source (config/plans.js) —
    // set so the zone is fully funded at the 60% activation threshold.
    for (const z of zones) z.per_household_amount = perHouseholdAmount(z.plan_type, z.households)
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