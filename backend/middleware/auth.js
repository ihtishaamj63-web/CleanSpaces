import jwt from 'jsonwebtoken'

const secret = () => process.env.JWT_SECRET || 'cleanspaces-development-secret'

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

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' })
  next()
}
