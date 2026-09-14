// backend/scripts/rehash-passwords.js
//
// Rehashes seed-account passwords with bcrypt (cost 12).
//
// Usage:
//   # Option A — pass credentials inline (recommended):
//   SEED_ADMIN_EMAIL=admin@cleanspaces.co.za \
//   SEED_ADMIN_PASSWORD='Admin@2026' \
//   SEED_RESIDENT_EMAIL=thandiwe@gmail.com \
//   SEED_RESIDENT_PASSWORD='Resident@2026' \
//   node scripts/rehash-passwords.js
//
//   # Option B — local dev only, uses the demo credentials below:
//   ALLOW_DEFAULT_SEEDS=true node scripts/rehash-passwords.js

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from '../db.js'

const ALLOW_DEFAULTS = process.env.ALLOW_DEFAULT_SEEDS === 'true'
const BCRYPT_ROUNDS  = 12

// These are only used if ALLOW_DEFAULT_SEEDS=true.
// They must never be relied on in production.
const DEFAULT_ACCOUNTS = [
  { email: 'admin@cleanspaces.co.za', password: 'Admin@2026' },
  { email: 'thandiwe@gmail.com',      password: 'Resident@2026' },
]

/**
 * Work out which accounts to rehash:
 *   1. Any pair of SEED_*_EMAIL / SEED_*_PASSWORD env vars
 *   2. Otherwise the built-in demo accounts, if ALLOW_DEFAULT_SEEDS=true
 *   3. Otherwise: error out so we don't silently do nothing.
 */
function resolveAccounts() {
  const adminEmail    = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const resEmail      = process.env.SEED_RESIDENT_EMAIL
  const resPassword   = process.env.SEED_RESIDENT_PASSWORD

  const fromEnv = [
    adminEmail && adminPassword ? { email: adminEmail, password: adminPassword } : null,
    resEmail   && resPassword   ? { email: resEmail,   password: resPassword   } : null,
  ].filter(Boolean)

  if (fromEnv.length > 0) return fromEnv

  if (!ALLOW_DEFAULTS) {
    console.error(
      '❌ No credentials provided.\n' +
      '   Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (and optionally SEED_RESIDENT_*),\n' +
      '   or pass ALLOW_DEFAULT_SEEDS=true to use the built-in demo accounts.'
    )
    process.exit(1)
  }

  console.warn('⚠️  Using DEFAULT demo credentials (ALLOW_DEFAULT_SEEDS=true).')
  console.warn('    Do not use this mode in production.')
  return DEFAULT_ACCOUNTS
}

async function run() {
  const accounts = resolveAccounts()

  console.log(`Rehashing ${accounts.length} account(s) with bcrypt cost ${BCRYPT_ROUNDS}...`)

  let failures = 0

  for (const { email, password } of accounts) {
    try {
      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
      const [result] = await pool.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, email]
      )

      if (result.affectedRows === 0) {
        console.warn(`⚠️  ${email}: no matching user — nothing updated.`)
        failures++
      } else {
        console.log(`✅ ${email}: password hash updated.`)
      }
    } catch (err) {
      console.error(`❌ ${email}: ${err.message}`)
      failures++
    }
  }

  // Close the pool so the process can exit. Wrapped because the pool
  // may never have opened if the DB connection failed early.
  try {
    await pool.end()
  } catch {
    // Nothing to do — the process is exiting anyway.
  }

  if (failures > 0) {
    console.error(`\n❌ Finished with ${failures} failure(s).`)
    process.exitCode = 1
  } else {
    console.log('\n✅ Done.')
  }
}

run().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exitCode = 1
})