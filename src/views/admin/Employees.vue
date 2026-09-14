<script setup>
import { ref } from 'vue'

const showForm = ref(false)
const form = ref({ name: '', phone: '', role: '', wage: '', hired: '', zone: '' })

const employees = ref([
  { id: 1, name: 'Joseph Nkosi', phone: '071 234 5678', role: 'Crew Lead', wage: 'R 320', hired: '2024-03-01', zone: 'Manenberg Zone A', status: 'active' },
  { id: 2, name: 'Fatima Petersen', phone: '072 345 6789', role: 'Ground Worker', wage: 'R 240', hired: '2024-03-01', zone: 'Rocklands', status: 'active' },
  { id: 3, name: 'Ayanda George', phone: '073 456 7890', role: 'Sanitation Officer', wage: 'R 260', hired: '2024-06-15', zone: 'Site C', status: 'active' },
  { id: 4, name: 'Pieter van der Merwe', phone: '074 567 8901', role: 'Ground Worker', wage: 'R 240', hired: '2023-11-20', zone: 'Manenberg Zone A', status: 'inactive' },
])

const zones = ['Manenberg Zone A', 'Rocklands', 'Site C', 'Khayelitsha Site B']

function addEmployee() {
  employees.value.push({
    id: Date.now(),
    name: form.value.name,
    phone: form.value.phone,
    role: form.value.role,
    wage: 'R ' + form.value.wage,
    hired: form.value.hired,
    zone: form.value.zone,
    status: 'active',
  })
  form.value = { name: '', phone: '', role: '', wage: '', hired: '', zone: zones[0] }
  showForm.value = false
}

function toggle(id) {
  const e = employees.value.find((x) => x.id === id)
  if (e) e.status = e.status === 'active' ? 'inactive' : 'active'
}
</script>

<template>
  <div>
    <div class="dash-top">
      <div>
        <h1>Employees</h1>
        <p>Manage your cleaning crew across all zones.</p>
      </div>
      <button class="btn btn-green" @click="showForm = !showForm">+ Add employee</button>
    </div>

    <div class="dash-panel">
      <form v-if="showForm" class="grid-form" @submit.prevent="addEmployee">
        <input v-model="form.name" placeholder="Full name" required />
        <input v-model="form.phone" placeholder="Phone" required />
        <input v-model="form.role" placeholder="Role" required />
        <input v-model="form.wage" type="number" placeholder="Daily wage (R)" required />
        <input v-model="form.hired" type="date" required />
        <select v-model="form.zone">
          <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
        </select>
        <button class="btn btn-lime" type="submit">Save</button>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Role</th><th>Daily wage</th><th>Hired</th><th>Zone</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="e in employees" :key="e.id">
              <td><strong>{{ e.name }}</strong></td>
              <td>{{ e.phone }}</td>
              <td>{{ e.role }}</td>
              <td>{{ e.wage }}</td>
              <td>{{ e.hired }}</td>
              <td>{{ e.zone }}</td>
              <td>
                <span class="tag" :class="'tag-' + e.status">{{ e.status }}</span>
                <button class="mini-btn" @click="toggle(e.id)">{{ e.status === 'active' ? 'Deactivate' : 'Activate' }}</button>
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
  grid-template-columns: repeat(3, 1fr) auto;
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
  margin-left: 8px;
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
