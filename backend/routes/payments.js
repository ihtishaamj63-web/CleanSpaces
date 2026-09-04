import { Router } from 'express'
import { createPayment, paymentReturn, paymentNotify } from '../controllers/paymentController.js'

const router = Router()

// Auth middleware will be added once Krishendree's is merged:
// import auth from '../middleware/auth.js'
// router.use(auth)

router.post('/create', createPayment)
router.get('/return/:id', paymentReturn)
router.post('/notify', paymentNotify)

export default router