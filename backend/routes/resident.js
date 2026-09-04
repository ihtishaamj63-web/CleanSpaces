import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createCleanupRequest, listMyCleanupRequests } from '../controllers/residentController.js'

const router = Router()

router.use(auth)
router.post('/cleanup-requests', createCleanupRequest)
router.get('/cleanup-requests', listMyCleanupRequests)

export default router
