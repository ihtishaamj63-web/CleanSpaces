// backend/scripts/rehash-passwords.js
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from '../db.js'

const accounts = [
  { email: 'admin@cleanspaces.co.za', password: 'Admin@2026' },
  { email: 'thandiwe@gmail.com', password: 'Resident@2026' },
]

async function run() {
  console.log('🔄 Rehashing passwords...')
  
  try {
    // Check if users exist first
    const [existing] = await pool.execute('SELECT email FROM users')
    console.log(`📊 Found ${existing.length} existing users`)
    
    for (const { email, password } of accounts) {
      try {
        const hash = await bcrypt.hash(password, 12)
        const [result] = await pool.execute(
          'UPDATE users SET password_hash = ? WHERE email = ?',
          [hash, email]
        )
        console.log(`${email}: ${result.affectedRows ? '✅ updated' : '❌ not found'}`)
      } catch (error) {
        console.error(`Error updating ${email}:`, error.message)
      }
    }
  } catch (error) {
    console.error('❌ Database error:', error.message)
    console.log('📝 Make sure the database exists and is accessible')
    console.log('   Run "npm run schema" first to create the database')
  }

  await pool.end()
  console.log('✅ Done.')
}

run()