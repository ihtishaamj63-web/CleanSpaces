// backend/controllers/authController.js
//
// Every authentication action lives here:
//   - signup / login (email + password)
//   - googleAuth    (Google ID token OR access token)
//   - forgotPassword / verifyResetToken / resetPassword
//
// Two rules of thumb used throughout:
//   1. Never reveal to the client whether an email address is registered
//      (login and forgot-password both answer the same way).
//   2. Always validate the password on the server, even though the UI
//      also validates it. The client can't be trusted.

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool from '../db.js'
import { OAuth2Client } from 'google-auth-library'
import { sendResetEmail } from '../services/emailService.js'

// ---------- JWT setup ----------

// These must match the values used in middleware/auth.js, or every
// protected request will fail with "jwt issuer invalid".
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
 * Sign a JWT for a user. The payload carries just enough for the
 * frontend to know who's logged in; sensitive fields stay in the DB.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES || '24h',
      issuer:    JWT_ISSUER,
      audience:  JWT_AUDIENCE,
    }
  )
}

// ---------- Password strength ----------

/**
 * Mirrors the rules the Signup / PasswordReset pages show in the UI.
 * Returns an error message, or null if the password is acceptable.
 */
function passwordStrengthError(password) {
  const value = String(password || '')
  if (value.length < 8)      return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(value))  return 'Password must include an uppercase letter.'
  if (!/[a-z]/.test(value))  return 'Password must include a lowercase letter.'
  if (!/[0-9]/.test(value))  return 'Password must include a number.'
  return null
}

// ---------- Google OAuth client ----------

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// ==================== EMAIL / PASSWORD ====================

// POST /api/auth/signup
export async function signup(req, res) {
  const { name, email, phone, password } = req.body
  const normalisedEmail = String(email || '').trim().toLowerCase()

  // 1. All fields present?
  if (![name, email, phone, password].every((v) => String(v || '').trim())) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  // 2. Password strong enough?
  const strengthError = passwordStrengthError(password)
  if (strengthError) {
    return res.status(400).json({ message: strengthError })
  }

  try {
    // 3. Email not already taken?
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalisedEmail]
    )
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // 4. Hash the password and create the user.
    const hash = await bcrypt.hash(String(password), 10)
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), normalisedEmail, phone.trim(), hash, 'resident']
    )

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalisedEmail,
      role: 'resident',
    }

    return res.status(201).json({ token: signToken(user), user })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ message: 'Unable to create your account right now.' })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [String(email).trim().toLowerCase()]
    )

    const user = users[0]

    // Same message for "no such user" and "wrong password" so attackers
    // can't tell which accounts exist.
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' })
    }

    // Google accounts have no password_hash — tell the user to use Google.
    if (!user.password_hash) {
      return res.status(401).json({
        message: 'This account was created with Google. Please use "Sign in with Google" instead.',
      })
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password_hash)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect email or password.' })
    }

    return res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Unable to log in right now.' })
  }
}

// GOOGLE

// POST /api/auth/google

// The frontend can send one of two payloads, depending on which Google
// flow it uses:
//   { credential }   — a signed ID token (JWT) from google.accounts.id
//   { access_token } — an OAuth2 access token from google.accounts.oauth2

// We accept both. Either way, the goal is the same:
//   1. Verify the token with Google
//   2. Extract the user's email + name + Google sub (unique user ID)
//   3. Find or create the matching row in `users`
//   4. Sign our own JWT and return it

export async function googleAuth(req, res) {
  try {
    const { credential, access_token } = req.body || {}

    if (!credential && !access_token) {
      return res.status(400).json({ message: 'No Google credential provided.' })
    }

    let email, name, googleId

    if (credential) {

      // ID token
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        email    = payload.email
        name     = payload.name
        googleId = payload.sub
      } catch (err) {
        console.warn('Google ID-token verification failed:', err.message)
        return res.status(401).json({ message: 'Invalid Google ID token.' })
      }
    } else {

      //access token
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (!response.ok) {
          throw new Error(`userinfo responded ${response.status}`)
        }
        const info = await response.json()
        email    = info.email
        name     = info.name
        googleId = info.sub
      } catch (err) {
        console.warn('Google access-token verification failed:', err.message)
        return res.status(401).json({ message: 'Invalid Google access token.' })
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google.' })
    }

    // Find or create the user
    const [existing] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [email]
    )

    let user
    if (existing.length > 0) {
      user = existing[0]

      // If they signed up with email/password before, then started using
      // Google, backfill their google_id so future lookups are faster.
      if (googleId) {
        await pool.execute(
          'UPDATE users SET google_id = COALESCE(google_id, ?) WHERE id = ?',
          [googleId, user.id]
        )
      }
    } else {
      const displayName = name || email.split('@')[0]

      // password_hash is deliberately the empty string for Google
      // accounts. login() treats a falsy password_hash as "use Google",
      // password-login a Google account.

      const [result] = await pool.execute(
        `INSERT INTO users (name, email, phone, password_hash, role, google_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [displayName, email, '', '', 'resident', googleId || null]
      )

      user = { id: result.insertId, name: displayName, email, role: 'resident' }
    }

    return res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Google auth error:', error)
    return res.status(500).json({ message: 'Unable to authenticate with Google.' })
  }
}

// PASSWORD RESET

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  // Same message regardless of whether the account exists
  // the endpoint from revealing which emails are registered.
  const genericResponse = {
    message: 'If an account exists for that email address, a reset link has been sent.',
  }

  try {
    const normalisedEmail = String(email).trim().toLowerCase()
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [normalisedEmail]
    )

    if (users.length === 0) {
      return res.json(genericResponse)
    }

    // Create a single-use reset token that expires in 1 hour.
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt  = new Date(Date.now() + 60 * 60 * 1000)

    // Only one active token per user
    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [users[0].id])
    await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [users[0].id, resetToken, expiresAt]
    )

    const base = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${base}/reset-password?token=${resetToken}`

    try {
      await sendResetEmail({
        name: users[0].name,
        email: users[0].email,
        resetLink,
      })
    } catch (mailError) {

      // Never leak delivery failures to the client.
      console.error('Failed to send reset email:', mailError)
    }

    return res.json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ message: 'Unable to process your request.' })
  }
}

// POST /api/auth/verify-reset-token
export async function verifyResetToken(req, res) {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' })
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role
         FROM password_resets pr
         JOIN users u ON u.id = pr.user_id
        WHERE pr.token = ? AND pr.expires_at > NOW()`,
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired token.' })
    }

    return res.json({
      valid: true,
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
      },
    })
  } catch (error) {
    console.error('Verify token error:', error)
    return res.status(500).json({ message: 'Unable to verify token.' })
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required.' })
  }

  const strengthError = passwordStrengthError(password)
  if (strengthError) {
    return res.status(400).json({ message: strengthError })
  }

  try {
    const [rows] = await pool.execute(
      'SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    )

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token.' })
    }

    const userId = rows[0].user_id
    const hash = await bcrypt.hash(String(password), 10)

    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId])

    // Consume the token so it can't be reused.
    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [userId])

    return res.json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ message: 'Unable to reset your password.' })
  }
}