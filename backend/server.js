import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import paymentRoutes from './routes/payments.js'
import residentRoutes from './routes/resident.js'
import db from './db.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // PayFast ITN arrives as form data, not JSON

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/payments', paymentRoutes)
app.use('/api/resident', residentRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`CleanSpaces backend running on port ${PORT}`))