import pool from '../db.js'

function isTodayOrLater(value) {
  const date = String(value || '')
  const today = new Date().toLocaleDateString('en-CA')
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today
}

export async function listPayroll(req, res) {
  try {
    const [records] = await pool.query('SELECT p.*, e.name AS employee_name, e.role AS employee_role FROM payroll p JOIN employees e ON e.id = p.employee_id ORDER BY p.payment_date DESC, p.id DESC')
    res.json(records)
  } catch { res.status(500).json({ message: 'Unable to load payroll.' }) }
}

export async function createPayroll(req, res) {
  const { employee_id, amount, period, payment_date, status = 'paid' } = req.body
  if (!Number.isInteger(Number(employee_id)) || Number(amount) <= 0 || !String(period || '').trim() || !isTodayOrLater(payment_date) || !['pending', 'paid'].includes(status)) return res.status(400).json({ message: 'Complete the payroll details and use a payment date from today onward.' })
  try {
    const [employees] = await pool.execute('SELECT daily_wage FROM employees WHERE id = ? AND status = ?', [Number(employee_id), 'active'])
    if (!employees.length) return res.status(400).json({ message: 'Select an active employee.' })
    if (Number(amount) !== Number(employees[0].daily_wage)) return res.status(400).json({ message: 'Payroll pay must match the employee’s fixed role rate.' })
    const [result] = await pool.execute('INSERT INTO payroll (employee_id, amount, period, status, payment_date) VALUES (?, ?, ?, ?, ?)', [Number(employee_id), Number(amount), period.trim(), status, payment_date])
    res.status(201).json({ id: result.insertId, message: 'Payroll payment recorded.' })
  } catch { res.status(500).json({ message: 'Unable to record payroll.' }) }
}
