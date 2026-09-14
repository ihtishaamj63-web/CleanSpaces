// backend/scripts/add-password-resets-table.js
//
// One-off migration that:
//   1. Creates the `password_resets` table if it doesn't exist.
//   2. Removes the old reset_token / reset_token_expires columns from
//      `users` if they're still around.
//
// Safe to re-run — every step checks first, then acts.

import 'dotenv/config'
import pool from '../db.js'

/** Does a table exist in the current database? */
async function tableExists(table) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
       FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  )
  return rows[0].count > 0
}

/** Does a column exist on a table? */
async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?`,
    [table, column]
  )
  return rows[0].count > 0
}

async function run() {
  try {
    // --- 1. password_resets table ---
    if (await tableExists('password_resets')) {
      console.log("'password_resets' already exists — skipping creation.")
    } else {
      console.log("Creating 'password_resets' table...")
      await pool.query(`
        CREATE TABLE password_resets (
          id         INT AUTO_INCREMENT PRIMARY KEY,
          user_id    INT NOT NULL,
          token      VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_password_resets_token (token)
        )
      `)
      console.log("'password_resets' created.")
    }

    // --- 2. Drop the old reset_token columns from users, if any ---
    const oldColumns = ['reset_token', 'reset_token_expires']
    let dropped = 0

    for (const column of oldColumns) {
      if (await columnExists('users', column)) {
        console.log(`Dropping old 'users.${column}' column...`)
        try {
          await pool.query(`ALTER TABLE users DROP COLUMN ${column}`)
          dropped++
        } catch (err) {
          // A foreign key or index on the column would block the drop.
          // Log clearly instead of a raw MySQL error.
          console.warn(`Could not drop 'users.${column}': ${err.message}`)
          console.warn(`  → Drop any indexes / constraints on it first, then re-run.`)
        }
      } else {
        console.log(`No 'users.${column}' column — nothing to drop.`)
      }
    }

    if (dropped > 0) {
      console.log(`Dropped ${dropped} old column(s).`)
    }

    console.log('✅ Done. Database matches the password_resets schema.')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()