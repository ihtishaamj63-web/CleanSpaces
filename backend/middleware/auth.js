// backend/middleware/auth.js
import jwt from 'jsonwebtoken'

const secret = () => process.env.JWT_SECRET || 'cleanspaces-development-secret'

// Verifies the Bearer token on protected routes and attaches req.user
export default function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' })

  try {
    req.user = jwt.verify(token, secret())
    next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}

// Guards admin-only routes — use after auth
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' })
  next()
}