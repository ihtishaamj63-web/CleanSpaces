// backend/routes/auth.js
//
// All public authentication endpoints. None of these require a token —
// that's the whole point of them.

import { Router } from 'express'
import {
  signup,
  login,
  googleAuth,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from '../controllers/authController.js'

const router = Router()

// Email + password
router.post('/signup', signup)
router.post('/login',  login)

// Google
router.post('/google', googleAuth)

// Password reset (three steps)
router.post('/forgot-password',    forgotPassword)  // step 1: request email
router.post('/verify-reset-token', verifyResetToken) // step 2: validate token
router.post('/reset-password',     resetPassword)   // step 3: set new password

export default router