import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createPayment, paymentReturn, paymentNotify } from '../controllers/paymentController.js'

const router = Router()

router.post('/create', auth, createPayment)
router.get('/return/:id', auth, paymentReturn)

// PayFast's ITN webhook — no JWT (PayFast holds no token);
// protected by the MD5 signature check inside paymentNotify.
router.post('/notify', paymentNotify)

export default router