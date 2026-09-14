<script setup>
import { ref } from 'vue'

const zones = ref([
  { id: 1, name: 'Manenberg Zone A', area: 'Manenberg', households: 72, plan: 'Small', status: 'active' },
  { id: 2, name: 'Rocklands', area: "Mitchell's Plain", households: 180, plan: 'Medium', status: 'active' },
  { id: 3, name: 'Site C', area: 'Khayelitsha', households: 320, plan: 'Large', status: 'active' },
  { id: 4, name: 'Khayelitsha Site B', area: 'Khayelitsha', households: 290, plan: 'Large', status: 'pending' },
  { id: 5, name: "Mitchell's Plain East", area: "Mitchell's Plain", households: 160, plan: 'Medium', status: 'pending' },
  { id: 6, name: 'Manenberg Zone B', area: 'Manenberg', households: 64, plan: 'Small', status: 'pending' },
])

const filter = ref('all')
const showForm = ref(false)
const newZone = ref({ name: '', area: '', households: '', plan: 'small' })

const filtered = () =>
  zones.value.filter((z) => filter.value === 'all' || z.status === filter.value)

function approve(id) {
  const z = zones.value.find((x) => x.id === id)
  if (z) z.status = 'active'
}

function reject(id) {
  zones.value = zones.value.filter((x) => x.id !== id)
}

function addZone() {
  zones.value.push({
    id: Date.now(),
    name: newZone.value.name,
    area: newZone.value.area,
    households: Number(newZone.value.households),
    plan: newZone.value.plan.charAt(0).toUpperCase() + newZone.value.plan.slice(1),
    status: 'active',
  })
  newZone.value = { name: '', area: '', households: '', plan: 'small' }
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="dash-top">
      <div>
        <h1>Zones</h1>
        <p>Approve, reject and manage community zones.</p>
      </div>
      <div class="top-actions">
        <button class="btn btn-green" @click="showForm = !showForm">+ Add zone</button>
      </div>
    </div>

    <div class="dash-panel">
      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
        <button class="tab-btn" :class="{ active: filter === 'active' }" @click="filter = 'active'">Active</button>
        <button class="tab-btn" :class="{ active: filter === 'pending' }" @click="filter = 'pending'">Pending</button>
      </div>

      <form v-if="showForm" class="inline-form" @submit.prevent="addZone">
        <input v-model="newZone.name" placeholder="Zone name" required />
        <input v-model="newZone.area" placeholder="Area / suburb" required />
        <input v-model="newZone.households" type="number" placeholder="Households" required />
        <select v-model="newZone.plan">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        <button class="btn btn-lime" type="submit">Save</button>
      </form>

      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Zone</th><th>Area</th><th>Households</th><th>Plan</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="z in filtered()" :key="z.id">
              <td><strong>{{ z.name }}</strong></td>
              <td>{{ z.area }}</td>
              <td>{{ z.households }}</td>
              <td>{{ z.plan }}</td>
              <td><span class="tag" :class="'tag-' + z.status">{{ z.status }}</span></td>
              <td class="actions" :class="{ 'actions-center': true }">
                <button v-if="z.status === 'pending'" class="btn btn-lime sm" @click="approve(z.id)">Approve</button>
                <button v-if="z.status === 'pending'" class="btn btn-danger sm" @click="reject(z.id)">Reject</button>
                <span v-else class="ok">Approved ✓</span>
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
.top-actions { display: flex; gap: 10px; }
.inline-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 12px;
  margin-bottom: 20px;
}
.inline-form input, .inline-form select {
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid var(--brown-line);
  background: var(--white);
  font-size: 0.9rem;
  outline: none;
}
.inline-form input:focus, .inline-form select:focus {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(107,143,78,0.15);
}
.sm { padding: 8px 14px; font-size: 0.82rem; margin-right: 6px; }
.btn-danger { background: #b33828; color: #fff; }
.btn-danger:hover { background: #962e21; }
.ok { color: var(--moss); font-weight: 600; font-size: 0.88rem; }
@media (max-width: 800px) {
  .inline-form { grid-template-columns: 1fr 1fr; }
}
</style>
