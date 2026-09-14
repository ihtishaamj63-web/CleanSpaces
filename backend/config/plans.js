// backend/config/plans.js
//
// Single source of truth for plan pricing.
// Every controller that needs a per-household amount calls `perHouseholdAmount`
// so the formula lives in exactly one place.

export const PLAN_BASE = {
  small:  1500,   // R per month for the whole zone
  medium: 3000,
  large:  4500,
}

export const PLAN_LABELS = {
  small:  'Small zone',
  medium: 'Medium zone',
  large:  'Large zone',
}

// Per-household monthly share. Rounds to the nearest rand.
// Throws on bad input so callers can turn it into a 400 instead of inserting NaN.
export function perHouseholdAmount(planType, households) {
  const base = PLAN_BASE[planType]
  if (!base) throw new Error(`Unknown plan type: ${planType}`)

  const n = Number(households)
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`Invalid household count: ${households}`)
  }

  return Math.round(base / n)
}
