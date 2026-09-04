import { Router } from 'express'
import auth, { requireAdmin } from '../middleware/auth.js'
import { approveZone, listZones, registerZone, rejectZone, zoneMap } from '../controllers/zoneController.js'

const router = Router()

router.post('/register', registerZone)
router.get('/map', zoneMap)
router.get('/', auth, requireAdmin, listZones)
router.put('/:id/approve', auth, requireAdmin, approveZone)
router.delete('/:id', auth, requireAdmin, rejectZone)

export default router
