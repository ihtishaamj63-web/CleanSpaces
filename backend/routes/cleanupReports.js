import { Router } from 'express'
import auth, { requireAdmin } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { createCleanupReport, listCleanupReports } from '../controllers/cleanupReportController.js'

const router = Router()

router.use(auth, requireAdmin)
router.get('/', listCleanupReports)
router.post('/', upload.fields([
  { name: 'before_photo', maxCount: 1 },
  { name: 'after_photo', maxCount: 1 }
]), createCleanupReport)

export default router
