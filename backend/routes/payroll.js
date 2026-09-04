import { Router } from 'express'
import auth, { requireAdmin } from '../middleware/auth.js'
import { createPayroll, listPayroll } from '../controllers/payrollController.js'

const router = Router()

router.use(auth, requireAdmin)
router.get('/', listPayroll)
router.post('/', createPayroll)

export default router
