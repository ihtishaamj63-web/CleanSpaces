import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')

  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  })

  const dbName = process.env.DB_NAME || 'cleanspaces'
  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
  console.log(`Database '${dbName}' ready.`)

  await rootConnection.changeUser({ database: dbName })

  console.log('Running schema.sql ...')
  const [results] = await rootConnection.query(sql)

  // The last few statements in schema.sql are SELECT verification queries —
  const resultSets = Array.isArray(results) ? results : [results]
  const lastResultSet = resultSets[resultSets.length - 1]
  if (Array.isArray(lastResultSet)) {
    console.log('Verification query result:')
    console.table(lastResultSet)
  }

  console.log('✅ schema.sql applied successfully.')
  await rootConnection.end()
}

run().catch((error) => {
  console.error('❌ Failed to run schema.sql:', error.message)
  process.exit(1)
})