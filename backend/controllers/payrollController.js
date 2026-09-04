import pool from '../db.js'

export async function listPayroll(req, res) {
  try {
    const [records] = await pool.query('SELECT p.*, e.name AS employee_name, e.role AS employee_role FROM payroll p JOIN employees e ON e.id = p.employee_id ORDER BY p.payment_date DESC, p.id DESC')
    res.json(records)
  } catch { res.status(500).json({ message: 'Unable to load payroll.' }) }
}

export async function createPayroll(req, res) {
  const { employee_id, amount, period, payment_date, status = 'paid' } = req.body
  if (!Number.isInteger(Number(employee_id)) || Number(amount) <= 0 || !String(period || '').trim() || !payment_date || !['pending', 'paid'].includes(status)) return res.status(400).json({ message: 'Please complete the payroll details.' })
  try {
    const [result] = await pool.execute('INSERT INTO payroll (employee_id, amount, period, status, payment_date) VALUES (?, ?, ?, ?, ?)', [Number(employee_id), Number(amount), period.trim(), status, payment_date])
    res.status(201).json({ id: result.insertId, message: 'Payroll payment recorded.' })
  } catch { res.status(500).json({ message: 'Unable to record payroll.' }) }
}
