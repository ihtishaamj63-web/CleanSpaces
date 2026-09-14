import pool from '../db.js'

const ROLE_WAGES = {
  'Crew Member': 300.00,
  'Crew Lead': 350.00,
  'Operations Manager': 450.00
}

function validEmployee(body) {
  const nameParts = String(body.name || '').trim().split(/\s+/).filter(Boolean)
  return nameParts.length >= 2 && [body.phone, body.role, body.hire_date].every((value) => String(value || '').trim()) && !isPastDate(body.hire_date) && Number.isInteger(Number(body.zone_id)) && Object.keys(ROLE_WAGES).includes(body.role)
}

function isPastDate(value) {
  const date = String(value || '')
  const today = new Date().toLocaleDateString('en-CA')
  return !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today
}

export async function listEmployees(req, res) {
  try {
    const [employees] = await pool.query('SELECT e.*, z.name AS zone_name FROM employees e JOIN zones z ON z.id = e.zone_id ORDER BY e.status, e.name')
    res.json(employees)
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to load employees.' }) }
}

export async function createEmployee(req, res) {
  if (!validEmployee(req.body)) return res.status(400).json({ message: 'Provide every employee field, a first and last name, a valid role, and a hire date from today onward.' })
  const { name, phone, role, hire_date, zone_id } = req.body
  try {
    // daily_wage is derived in the database; do not accept client-provided wages
    const [result] = await pool.execute('INSERT INTO employees (name, phone, role, hire_date, zone_id) VALUES (?, ?, ?, ?, ?)', [name.trim(), phone.trim(), role, hire_date, Number(zone_id)])
    res.status(201).json({ id: result.insertId, message: 'Crew member added.' })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to add this crew member.' }) }
}

export async function updateEmployee(req, res) {
  if (!validEmployee(req.body)) return res.status(400).json({ message: 'Provide every employee field, a first and last name, a valid role, and a hire date from today onward.' })
  const { name, phone, role, hire_date, zone_id, status = 'active' } = req.body
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid employment status.' })
  try {
    // daily_wage is derived from role in the DB; do not accept client-provided wages
    const [result] = await pool.execute('UPDATE employees SET name=?, phone=?, role=?, hire_date=?, zone_id=?, status=? WHERE id=?', [name.trim(), phone.trim(), role, hire_date, Number(zone_id), status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' })
    res.json({ message: 'Crew member updated.' })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to update this crew member.' }) }
}
