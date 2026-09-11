// Single source of truth for zone pricing. The per-household share is set
// so the zone is FULLY FUNDED at the 60% activation threshold — pricing at
// 100% participation would leave every zone ~40% underwater at activation.
export const PLAN_BASE = { small: 4000, medium: 7250, large: 11500 }
export const ACTIVATION_THRESHOLD = 0.6

// Per-household monthly share for a zone of the given plan and size.
export const perHouseholdAmount = (planType, households) =>
  Math.round(PLAN_BASE[planType] / (ACTIVATION_THRESHOLD * households))