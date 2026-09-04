import { Router } from 'express'
import auth, { requireAdmin } from '../middleware/auth.js'
import { createCleanupReport, listCleanupReports } from '../controllers/cleanupReportController.js'

const router = Router()

router.use(auth, requireAdmin)
router.get('/', listCleanupReports)
router.post('/', createCleanupReport)

export default router
