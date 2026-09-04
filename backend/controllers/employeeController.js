import pool from '../db.js'

const ROLE_WAGES = {
  'Crew Member': 300.00,
  'Crew Lead': 350.00,
  'Operations Manager': 450.00
}

function validEmployee(body) {
  return [body.name, body.phone, body.role, body.hire_date].every((value) => String(value || '').trim()) && Number.isInteger(Number(body.zone_id)) && Object.keys(ROLE_WAGES).includes(body.role)
}

export async function listEmployees(req, res) {
  try {
    const [employees] = await pool.query('SELECT e.*, z.name AS zone_name FROM employees e JOIN zones z ON z.id = e.zone_id ORDER BY e.status, e.name')
    res.json(employees)
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to load employees.' }) }
}

export async function createEmployee(req, res) {
  if (!validEmployee(req.body)) return res.status(400).json({ message: 'Please complete every employee field and provide a valid role.' })
  const { name, phone, role, hire_date, zone_id } = req.body
  try {
    // daily_wage is derived in the database; do not accept client-provided wages
    const [result] = await pool.execute('INSERT INTO employees (name, phone, role, hire_date, zone_id) VALUES (?, ?, ?, ?, ?)', [name.trim(), phone.trim(), role, hire_date, Number(zone_id)])
    res.status(201).json({ id: result.insertId, message: 'Crew member added.' })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to add this crew member.' }) }
}

export async function updateEmployee(req, res) {
  if (!validEmployee(req.body)) return res.status(400).json({ message: 'Please complete every employee field and provide a valid role.' })
  const { name, phone, role, hire_date, zone_id, status = 'active' } = req.body
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid employment status.' })
  try {
    // daily_wage is derived from role in the DB; do not accept client-provided wages
    const [result] = await pool.execute('UPDATE employees SET name=?, phone=?, role=?, hire_date=?, zone_id=?, status=? WHERE id=?', [name.trim(), phone.trim(), role, hire_date, Number(zone_id), status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Employee not found.' })
    res.json({ message: 'Crew member updated.' })
  } catch (err) { console.error(err); res.status(500).json({ message: 'Unable to update this crew member.' }) }
}
