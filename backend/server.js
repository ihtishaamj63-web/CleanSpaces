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
import db from './db.js'

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

const PORT = process.env.PORT || 5001
app.listen(PORT, async () => {
	console.log(`CleanSpaces backend running on port ${PORT}`)

	try {
		await db.query('SELECT 1')
		console.log('Database connection ready')
	} catch (error) {
		console.error('Database connection failed:', error.message)
	}
})