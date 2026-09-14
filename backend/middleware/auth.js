// backend/middleware/auth.js
//
// Verifies the JWT that the client sends in the Authorization header.
// Attaches the decoded payload to req.user so route handlers can read
// req.user.id, req.user.role, etc.

import jwt from 'jsonwebtoken'

// These must match the constants in controllers/authController.js
// where the token is signed.
const JWT_ISSUER   = 'cleanspaces'
const JWT_AUDIENCE = 'cleanspaces-api'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production.')
    }
    return 'cleanspaces-development-secret'
  }
  return secret
}

/**
 * Express middleware. Verifies the Bearer token and sets req.user.
 * Responds 401 if the token is missing, invalid, or expired.
 */
export default function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token  = header.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return res.status(401).json({ message: 'Please log in to continue.' })
  }

  try {
    req.user = jwt.verify(token, getJwtSecret(), {
      issuer:   JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return next()
  } catch (err) {
    // Tell the frontend whether to prompt a re-login (expiry) or
    // treat it as a genuine failure. The distinction is useful for
    // silent token refresh later.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      })
    }
    return res.status(401).json({ message: 'Invalid session. Please log in again.' })
  }
}

/**
 * Alias so route files can `import { requireAuth }` instead of the default.
 */
export const requireAuth = auth

/**
 * Guards admin-only routes. Must run AFTER `auth` so req.user exists.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access is required.' })
  }
  return next()
}