import { Router } from 'express'
import auth, { requireAdmin } from '../middleware/auth.js'
import { createEmployee, listEmployees, updateEmployee } from '../controllers/employeeController.js'

const router = Router()

router.use(auth, requireAdmin)
router.get('/', listEmployees)
router.post('/', createEmployee)
router.put('/:id', updateEmployee)

export default router
