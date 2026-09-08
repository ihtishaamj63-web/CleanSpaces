import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import pool from '../db.js'

const secret = () => process.env.JWT_SECRET || 'cleanspaces-development-secret'
const sign = (user) =>
  jwt.sign({ id: user.id, name: user.name, role: user.role }, secret(), { expiresIn: process.env.JWT_EXPIRES || '24h' })

// POST /api/auth/signup — every signup creates a resident (no role accepted from the client)
export async function signup(req, res) {
  const { name, email, phone, password } = req.body
  const normalisedEmail = String(email || '').trim().toLowerCase()
  if (![name, email, phone, password].every((v) => String(v || '').trim()))
    return res.status(400).json({ message: 'All fields are required.' })
  if (String(password).length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [normalisedEmail])
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' })

    const hash = await bcrypt.hash(String(password), 10)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), normalisedEmail, phone.trim(), hash, 'resident'])
    const user = { id: result.insertId, name: name.trim(), email: normalisedEmail, role: 'resident' }
    res.status(201).json({ token: sign(user), user })
  } catch {
    res.status(500).json({ message: 'Unable to create your account right now.' })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [String(email).trim().toLowerCase()])
    const user = users[0]
    const valid = user && (await bcrypt.compare(String(password), user.password_hash))
    if (!valid) return res.status(401).json({ message: 'Incorrect email or password.' })
    res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch {
    res.status(500).json({ message: 'Unable to log in right now.' })
  }
}