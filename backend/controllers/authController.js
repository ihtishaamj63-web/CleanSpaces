import jwt from 'jsonwebtoken'
import pool from '../db.js'

const secret = () => process.env.JWT_SECRET || 'cleanspaces-development-secret'

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
  try {
    const [users] = await pool.execute('SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1', [String(email).trim().toLowerCase()])
    const user = users[0]
    if (!user || user.password_hash !== password) return res.status(401).json({ message: 'Incorrect email or password.' })
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, secret(), { expiresIn: process.env.JWT_EXPIRES || '24h' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch { res.status(500).json({ message: 'Unable to log in right now.' }) }
}
