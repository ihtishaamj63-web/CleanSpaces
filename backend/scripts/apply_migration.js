import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cleanspaces',
    waitForConnections: true,
    connectionLimit: 5
  })

  try {
    console.log('Connected to database:', process.env.DB_NAME || 'cleanspaces')

    const [rolesRows] = await pool.query("SELECT DISTINCT role FROM employees")
    const existingRoles = rolesRows.map(r => r.role)
    console.log('Existing role values:', existingRoles)

    const mappings = [
      { to: 'Crew Member', from: ['crew_member','Crew member','Cleanup crew','cleanup crew','cleanup crew','chemical crew'] },
      { to: 'Crew Lead', from: ['crew_lead','Crew lead'] },
      { to: 'Operations Manager', from: ['operations_manager','Operations manager','ops manager','Ops Manager'] }
    ]

    for (const map of mappings) {
      const intersect = existingRoles.filter(r => map.from.includes(r))
      if (intersect.length) {
        console.log(`Updating ${intersect.length} rows -> ${map.to} (matches: ${intersect.join(', ')})`)
        const placeholders = map.from.map(() => '?').join(',')
        const sql = `UPDATE employees SET role = ? WHERE role IN (${placeholders})`
        await pool.execute(sql, [map.to, ...map.from])
      }
    }

    // Re-check roles
    const [afterRolesRows] = await pool.query("SELECT DISTINCT role FROM employees")
    console.log('Role values after canonicalisation:', afterRolesRows.map(r => r.role))

    // Ensure every role is one of the allowed labels before ALTER
    const allowed = ['Crew Member','Crew Lead','Operations Manager']
    const invalid = afterRolesRows.map(r => r.role).filter(r => !allowed.includes(r))
    if (invalid.length) {
      console.error('Found role values that are not allowed; please canonicalise these first:', invalid)
      process.exit(1)
    }

    console.log('Altering `role` column to ENUM(...)')
    await pool.execute("ALTER TABLE employees MODIFY COLUMN role ENUM('Crew Member','Crew Lead','Operations Manager') NOT NULL")

    // Check if daily_wage exists
    const [colRows] = await pool.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'employees' AND column_name = 'daily_wage'")
    const exists = colRows[0].cnt > 0
    if (exists) {
      console.log('Dropping existing `daily_wage` column')
      await pool.execute('ALTER TABLE employees DROP COLUMN daily_wage')
    }

    console.log('Adding generated `daily_wage` column')
    const addSql = `ALTER TABLE employees ADD COLUMN daily_wage DECIMAL(10,2) GENERATED ALWAYS AS (
      CASE role
        WHEN 'Crew Member' THEN 300.00
        WHEN 'Crew Lead' THEN 350.00
        WHEN 'Operations Manager' THEN 450.00
        ELSE 0.00
      END
    ) STORED`
    await pool.execute(addSql)

    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err.message || err)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()
