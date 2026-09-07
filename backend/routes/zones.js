import { Router } from 'express'
import {
  listZones,
  listZonesForMap,
  listPendingZones,
  getZone,
  addZone,
  editZone,
  removeZone,
} from '../controllers/zoneController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Public reads - the map on the homepage needs these without a login.
router.get('/', listZones)
router.get('/map', listZonesForMap)
router.get('/pending', requireAuth, requireAdmin, listPendingZones)  // ← NEW: Admin only
router.get('/:id', getZone)

// Writes are admin-only.
router.post('/', requireAuth, requireAdmin, addZone)
router.put('/:id', requireAuth, requireAdmin, editZone)
router.delete('/:id', requireAuth, requireAdmin, removeZone)

export default router