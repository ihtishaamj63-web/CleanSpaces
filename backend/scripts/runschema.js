// backend/scripts/runschema.js
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function run() {
  let schemaPath = path.join(__dirname, '..', '..', 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.join(__dirname, '..', 'schema.sql')
  }
  
  // Check if schema.sql exists
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ schema.sql not found at:', schemaPath)
    console.log('📝 Please create schema.sql in the project root directory')
    process.exit(1)
  }
  
  const sql = fs.readFileSync(schemaPath, 'utf-8')

  const rootConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  const dbName = process.env.DB_NAME || 'cleanspaces'
  
  try {
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    console.log(`✅ Database '${dbName}' ready.`)

    await rootConnection.changeUser({ database: dbName })

    console.log('🔄 Running schema.sql ...')
    await rootConnection.query(sql)

    console.log('✅ schema.sql applied successfully.')
  } catch (error) {
    console.error('❌ Failed to run schema.sql:', error.message)
    process.exit(1)
  } finally {
    await rootConnection.end()
  }
}

run()