import { Router } from 'express'
import { 
  signup, 
  login, 
  forgotPassword, 
  verifyResetToken,
  resetPassword, 
  me, 
  googleAuth 
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// ============================================================
// PUBLIC ROUTES
// ============================================================

// User Registration
router.post('/signup', signup)

// User Login
router.post('/login', login)

// Google Authentication
router.post('/google', googleAuth)

// Forgot Password - Request reset link
router.post('/forgot-password', forgotPassword)

// Verify Reset Token - Check if token is valid
router.post('/verify-reset-token', verifyResetToken)

// Reset Password - Set new password
router.post('/reset-password', resetPassword)

// ============================================================
// PROTECTED ROUTES (require authentication)
// ============================================================

// Get current user profile
router.get('/me', requireAuth, me)

export default router