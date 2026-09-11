import 'dotenv/config'
import pool from '../db.js'

async function tableExists(table) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  )
  return rows[0].count > 0
}

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
    // Create password_resets if it doesn't exist yet.
    const hasTable = await tableExists('password_resets')
    if (!hasTable) {
      console.log("Creating 'password_resets' table...")
      await pool.query(`
        CREATE TABLE password_resets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `)
    } else {
      console.log("'password_resets' already exists, skipping.")
    }

    // Drop the old reset_token / reset_token_expires columns on users,
    const hasOldResetToken = await columnExists('users', 'reset_token')
    const hasOldResetTokenExpires = await columnExists('users', 'reset_token_expires')

    if (hasOldResetToken) {
      console.log("Dropping old 'users.reset_token' column...")
      await pool.query('ALTER TABLE users DROP COLUMN reset_token')
    }
    if (hasOldResetTokenExpires) {
      console.log("Dropping old 'users.reset_token_expires' column...")
      await pool.query('ALTER TABLE users DROP COLUMN reset_token_expires')
    }
    if (!hasOldResetToken && !hasOldResetTokenExpires) {
      console.log('No old reset_token columns found on users, nothing to drop.')
    }

    console.log('✅ Done. Database now matches the new password_resets schema.')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()