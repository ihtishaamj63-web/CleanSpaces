import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import statsRoutes from './routes/stats.js'
import paymentRoutes from './routes/payments.js'
import residentRoutes from './routes/resident.js'
import testimonialRoutes from './routes/testimonials.js'
import contactRoutes from './routes/contact.js'
import zoneRoutes from './routes/zones.js'
import employeeRoutes from './routes/employees.js'
import payrollRoutes from './routes/payroll.js'
import cleanupReportRoutes from './routes/cleanupReports.js'
import reviewRoutes from './routes/reviews.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // PayFast ITN arrives as form data, not JSON

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/resident', residentRoutes)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/zones', zoneRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/payroll', payrollRoutes)
app.use('/api/cleanup-reports', cleanupReportRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`CleanSpaces backend running on port ${PORT}`))