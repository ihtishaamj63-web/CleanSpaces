<script setup>
import { RouterLink } from 'vue-router'

const stats = [
  { label: 'Pending zones', value: '3', sub: 'awaiting approval' },
  { label: 'Active zones', value: '8', sub: 'running weekly cleanups' },
  { label: 'Employees', value: '26', sub: 'across all zones' },
  { label: 'Monthly income', value: 'R 84,500', sub: 'projected this month' },
]

const recentZones = [
  { name: 'Khayelitsha Site B', area: 'Khayelitsha', status: 'pending', households: 290 },
  { name: "Mitchell's Plain East", area: "Mitchell's Plain", status: 'pending', households: 160 },
  { name: 'Manenberg Zone B', area: 'Manenberg', status: 'pending', households: 64 },
]

const recentPayments = [
  { id: '#PAY-1042', zone: 'Manenberg Zone A', amount: 'R 3,900', date: '28 Aug', status: 'paid' },
  { id: '#PAY-1041', zone: 'Rocklands', amount: 'R 7,200', date: '28 Aug', status: 'paid' },
  { id: '#PAY-1040', zone: 'Site C', amount: 'R 11,500', date: '27 Aug', status: 'pending' },
]
</script>

<template>
  <div>
    <div class="dash-top">
      <div>
        <h1>Admin Overview</h1>
        <p>Everything happening across CleanSpaces at a glance.</p>
      </div>
      <RouterLink to="/admin/zones" class="btn btn-green">Review new zones</RouterLink>
    </div>

    <div class="dash-cards">
      <div v-for="s in stats" :key="s.label" class="dash-card" :class="{ 'card-cream': s.label === 'Monthly income' }">
        <div class="lbl">{{ s.label }}</div>
        <div class="val">{{ s.value }}</div>
        <div class="sub">{{ s.sub }}</div>
      </div>
    </div>

    <div class="grid-2col">
      <div class="dash-panel">
        <div class="panel-head">
          <h2>Pending zone requests</h2>
          <RouterLink to="/admin/zones" class="view-site">Manage →</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Zone</th><th>Area</th><th>Households</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="z in recentZones" :key="z.name">
                <td>{{ z.name }}</td>
                <td>{{ z.area }}</td>
                <td>{{ z.households }}</td>
                <td><span class="tag tag-pending">{{ z.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dash-panel">
        <div class="panel-head">
          <h2>Recent payments</h2>
          <RouterLink to="/admin/payroll" class="view-site">Payroll →</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Ref</th><th>Zone</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="p in recentPayments" :key="p.id">
                <td>{{ p.id }}</td>
                <td>{{ p.zone }}</td>
                <td>{{ p.amount }}</td>
                <td>{{ p.date }}</td>
                <td><span class="tag" :class="'tag-' + p.status">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../assets/dash.css';
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
@media (max-width: 1000px) {
  .grid-2col { grid-template-columns: 1fr; }
}
</style>
