
import 'dotenv/config'
import pool from '../db.js'

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  )
  return rows[0].count > 0
}

async function run() {
  try {
    const hasResetToken = await columnExists('users', 'reset_token')
    const hasResetTokenExpires = await columnExists('users', 'reset_token_expires')

    if (!hasResetToken) {
      console.log("Adding 'reset_token' column...")
      await pool.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL')
    } else {
      console.log("'reset_token' already exists, skipping.")
    }

    if (!hasResetTokenExpires) {
      console.log("Adding 'reset_token_expires' column...")
      await pool.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL')
    } else {
      console.log("'reset_token_expires' already exists, skipping.")
    }

    if (!hasResetToken || !hasResetTokenExpires) {
      console.log("Adding index on reset_token for faster lookups...")
      try {
        await pool.query('ALTER TABLE users ADD INDEX idx_reset_token (reset_token)')
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index already exists, skipping.')
        } else {
          throw err
        }
      }
    }

    console.log('✅ Done. users table is up to date.')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()