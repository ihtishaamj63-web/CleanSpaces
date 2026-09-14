// backend/server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes            from './routes/auth.js'
import statsRoutes           from './routes/stats.js'
import paymentRoutes         from './routes/payments.js'
import residentRoutes        from './routes/resident.js'
import testimonialRoutes     from './routes/testimonials.js'
import contactRoutes         from './routes/contact.js'
import zoneRoutes            from './routes/zones.js'
import employeeRoutes        from './routes/employees.js'
import payrollRoutes         from './routes/payroll.js'
import cleanupReportRoutes   from './routes/cleanupReports.js'
import reviewRoutes          from './routes/reviews.js'
import adminRoutes           from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Trust the proxy hop (ngrok / reverse proxy) so req.protocol and
// req.get('host') are correct when building PayFast return/notify URLs.
app.set('trust proxy', 1)

// CORS — allow the frontend dev origin. Falls back to * in dev if unset.
app.use(cors({
  origin: process.env.FRONTEND_URL || true,   // `true` = reflect request origin
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))   // PayFast ITN arrives as form data

// Uploaded photos (cleanup-request evidence), served publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth',            authRoutes)
app.use('/api/stats',           statsRoutes)
app.use('/api/payments',        paymentRoutes)
app.use('/api/resident',        residentRoutes)
app.use('/api/testimonials',    testimonialRoutes)
app.use('/api/contact',         contactRoutes)
app.use('/api/zones',           zoneRoutes)
app.use('/api/employees',       employeeRoutes)
app.use('/api/payroll',         payrollRoutes)
app.use('/api/cleanup-reports', cleanupReportRoutes)
app.use('/api/reviews',         reviewRoutes)
app.use('/api/admin',           adminRoutes)

// --- 404 handler for unmatched API routes (JSON, not Express's HTML page) ---
app.use('/api', (req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
})

// --- Global error handler (multer limits, thrown errors, etc.) ---
app.use((err, req, res, next) => {
  if (err) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'That photo is too large (max 5 MB).'
      : err.message || 'Upload failed.'
    return res.status(400).json({ message })
  }
  next()
})

const PORT = Number(process.env.PORT) || 5000
const server = app.listen(PORT, () => {
  console.log(`CleanSpaces backend running on port ${PORT}`)
  console.log(`   auth router:    /api/auth`)
  console.log(`   static uploads: /uploads`)
})

// Clean shutdown so `node --watch` and CTRL+C free the port immediately.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(`\n${sig} received — closing server.`)
    server.close(() => process.exit(0))
  })
}