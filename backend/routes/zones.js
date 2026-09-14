import { Router } from 'express'
import {
  listZones, zoneMap, registerZone, approveZone, rejectZone
} from '../controllers/zoneController.js'
import auth, { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', listZones)
router.get('/map', zoneMap)                                   // was listZonesForMap
router.post('/', registerZone)                                // public: residents apply
router.put('/:id/approve', auth, requireAdmin, approveZone)
router.delete('/:id', auth, requireAdmin, rejectZone)

export default router