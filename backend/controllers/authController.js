import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import db from '../db.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
}

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // New signups are always residents. Admin accounts are created directly
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'resident')`,
      [name, email, phone, hashedPassword]
    )

    const user = { id: result.insertId, name, email, phone, role: 'resident' }
    const token = signToken(user)

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Unable to create account.' })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const user = users[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user)

    res.json({
      message: 'Login successful!',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Unable to login.' })
  }
}

// POST /api/auth/google
export async function googleAuth(req, res) {
  try {
    const { credential, access_token } = req.body

    let email, name

    if (credential) {
      // JWT ID token flow (Google's default rendered button / One Tap)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      email = payload.email
      name = payload.name
    } else if (access_token) {
      // Access token flow (custom Google button)
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      if (!profileRes.ok) {
        return res.status(401).json({ message: 'Invalid Google access token.' })
      }
      const profile = await profileRes.json()
      email = profile.email
      name = profile.name
    } else {
      return res.status(400).json({ message: 'Missing Google credential.' })
    }

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    let user

    if (existingUsers.length > 0) {
      user = existingUsers[0]
    } else {
      // No password comes from Google, so store a random unusable hash
      // to satisfy a NOT NULL password column, if one exists.
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)

      const [result] = await db.query(
        `INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'resident')`,
        [name, email, '', randomPassword]
      )
      user = { id: result.insertId, name, email, phone: '', role: 'resident' }
    }

    const token = signToken(user)

    res.json({
      message: 'Login successful!',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(401).json({ message: 'Google sign-in failed.' })
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' })
    }

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email])

    // Intentionally not revealing whether the email exists in the response
    // message — but if it does, generate a real, single-use reset token.
    let resetLink = null

    if (users.length > 0) {
      const userId = users[0].id
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      // Clear out any previous unused tokens for this user first.
      await db.query('DELETE FROM password_resets WHERE user_id = ?', [userId])

      await db.query(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      )

      // No email service is wired up yet, so the link is returned directly
      // in the response and shown in the UI instead of being emailed.
      const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
      resetLink = `${frontendOrigin}/reset-password?token=${token}`
    }

    res.json({
      message: 'If an account exists for this email, a reset link has been created.',
      resetLink, // null if the email wasn't found — frontend should only show it when present
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Unable to process your request.' })
  }
}

// ============================================================
// VERIFY RESET TOKEN - NEW FUNCTION
// ============================================================
export async function verifyResetToken(req, res) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Token is required.' })
    }

    // Query the database for the reset token with user information
    const [resets] = await db.query(
      `SELECT 
        pr.id as token_id,
        pr.token,
        pr.user_id,
        pr.expires_at,
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role
      FROM password_resets pr
      JOIN users u ON u.id = pr.user_id
      WHERE pr.token = ?`,
      [token]
    )

    if (resets.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token.' 
      })
    }

    const reset = resets[0]

    // Check if token has expired
    if (new Date(reset.expires_at) < new Date()) {
      // Clean up expired token
      await db.query('DELETE FROM password_resets WHERE id = ?', [reset.token_id])
      return res.status(400).json({ 
        message: 'This reset link has expired. Please request a new one.' 
      })
    }

    // Return user information (don't return sensitive data)
    return res.json({
      valid: true,
      user: {
        id: reset.id,
        name: reset.name,
        email: reset.email,
        phone: reset.phone,
        role: reset.role
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(500).json({ 
      message: 'Failed to verify token.' 
    })
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    }

    const [resets] = await db.query(
      'SELECT id, user_id, expires_at FROM password_resets WHERE token = ?',
      [token]
    )

    if (resets.length === 0) {
      return res.status(400).json({ message: 'This reset link is invalid or has already been used.' })
    }

    const reset = resets[0]

    if (new Date(reset.expires_at) < new Date()) {
      await db.query('DELETE FROM password_resets WHERE id = ?', [reset.id])
      return res.status(400).json({ message: 'This reset link has expired. Please request a new one.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, reset.user_id])

    // Token is single-use — remove it once it's been used.
    await db.query('DELETE FROM password_resets WHERE id = ?', [reset.id])

    res.json({ message: 'Your password has been reset successfully. You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Unable to reset your password.' })
  }
}

// GET /api/auth/me  (used to re-validate a stored token on app load)
export async function me(req, res) {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!users.length) return res.status(404).json({ message: 'User not found.' })
    res.json({ user: users[0] })
  } catch (error) {
    console.error('Me error:', error)
    res.status(500).json({ message: 'Unable to load user.' })
  }
}