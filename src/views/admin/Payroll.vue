<script setup>
import { ref } from 'vue'

const showForm = ref(false)
const form = ref({ employee: '', amount: '', period: '', date: '' })

const employees = [
  'Joseph Nkosi', 'Fatima Petersen', 'Ayanda George', 'Pieter van der Merwe',
]

const ledger = ref([
  { id: 1, employee: 'Joseph Nkosi', amount: 'R 6,400', period: 'August 2026', date: '2026-08-27', status: 'paid' },
  { id: 2, employee: 'Fatima Petersen', amount: 'R 4,800', period: 'August 2026', date: '2026-08-27', status: 'paid' },
  { id: 3, employee: 'Ayanda George', amount: 'R 5,200', period: 'August 2026', date: '2026-08-28', status: 'pending' },
  { id: 4, employee: 'Pieter van der Merwe', amount: 'R 4,800', period: 'July 2026', date: '2026-07-25', status: 'paid' },
])

function record() {
  ledger.value.unshift({
    id: Date.now(),
    employee: form.value.employee,
    amount: 'R ' + form.value.amount,
    period: form.value.period,
    date: form.value.date,
    status: 'pending',
  })
  form.value = { employee: employees[0], amount: '', period: '', date: '' }
  showForm.value = false
}

function pay(id) {
  const l = ledger.value.find((x) => x.id === id)
  if (l) l.status = 'paid'
}
</script>

<template>
  <div>
    <div class="dash-top">
      <div>
        <h1>Payroll</h1>
        <p>Record and track wage payments per employee.</p>
      </div>
      <button class="btn btn-green" @click="showForm = !showForm">+ Record payment</button>
    </div>

    <div class="dash-panel">
      <form v-if="showForm" class="grid-form" @submit.prevent="record">
        <select v-model="form.employee">
          <option v-for="e in employees" :key="e" :value="e">{{ e }}</option>
        </select>
        <input v-model="form.amount" type="number" placeholder="Amount (R)" required />
        <input v-model="form.period" placeholder="Period (e.g. September 2026)" required />
        <input v-model="form.date" type="date" required />
        <button class="btn btn-lime" type="submit">Save</button>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Employee</th><th>Amount</th><th>Period</th><th>Payment date</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="l in ledger" :key="l.id">
              <td><strong>{{ l.employee }}</strong></td>
              <td>{{ l.amount }}</td>
              <td>{{ l.period }}</td>
              <td>{{ l.date }}</td>
              <td><span class="tag" :class="'tag-' + l.status">{{ l.status }}</span></td>
              <td>
                <button v-if="l.status === 'pending'" class="mini-btn" @click="pay(l.id)">Mark paid</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../assets/dash.css';
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr auto;
  gap: 12px;
  margin-bottom: 20px;
}
.grid-form input, .grid-form select {
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid var(--brown-line);
  background: var(--white);
  font-size: 0.9rem;
  outline: none;
}
.mini-btn {
  background: none;
  color: var(--moss);
  border: 1px solid var(--brown-line);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
}
.mini-btn:hover { background: var(--green-chalk); }
@media (max-width: 900px) {
  .grid-form { grid-template-columns: 1fr 1fr; }
}
</style>
