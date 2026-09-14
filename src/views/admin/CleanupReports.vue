<script setup>
import { ref } from 'vue'

const showForm = ref(false)
const form = ref({ zone: '', employee: '', after: '', notes: '', date: '' })

const zones = ['Manenberg Zone A', 'Rocklands', 'Site C']
const employees = ['Joseph Nkosi', 'Fatima Petersen', 'Ayanda George']

const reports = ref([
  { id: 1, zone: 'Manenberg Zone A', employee: 'Joseph Nkosi', before: 'linear-gradient(135deg,#8a7a68,#5d5145)', after: 'linear-gradient(135deg,#54936b,#2e5138)', notes: 'Cleared corner dump site and swept pavements.', date: '2026-08-24' },
  { id: 2, zone: 'Rocklands', employee: 'Fatima Petersen', before: 'linear-gradient(135deg,#7d6f60,#4f4539)', after: 'linear-gradient(135deg,#63a17d,#3a6548)', notes: 'Removed hazardous waste from open lot. Sanitised playground edge.', date: '2026-08-17' },
  { id: 3, zone: 'Site C', employee: 'Ayanda George', before: 'linear-gradient(135deg,#88776a,#574a3f)', after: 'linear-gradient(135deg,#4f8d68,#2e5942)', notes: 'Drainage canal cleared. Photo proof uploaded.', date: '2026-08-10' },
])

function addReport() {
  reports.value.unshift({
    id: Date.now(),
    zone: form.value.zone,
    employee: form.value.employee,
    before: 'linear-gradient(135deg,#6f6052,#4a3f34)',
    after: 'linear-gradient(135deg,#4f8d68,#2e5942)',
    notes: form.value.notes,
    date: form.value.date,
  })
  form.value = { zone: zones[0], employee: employees[0], after: '', notes: '', date: '' }
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="dash-top">
      <div>
        <h1>Cleanup Reports</h1>
        <p>Capture before/after photos and notes for every cleanup.</p>
      </div>
      <button class="btn btn-green" @click="showForm = !showForm">+ New report</button>
    </div>

    <form v-if="showForm" class="report-form" @submit.prevent="addReport">
      <select v-model="form.zone">
        <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
      </select>
      <select v-model="form.employee">
        <option v-for="e in employees" :key="e" :value="e">{{ e }}</option>
      </select>
      <input v-model="form.date" type="date" required />
      <textarea v-model="form.notes" placeholder="Notes on the cleanup…" required></textarea>
      <button class="btn btn-lime" type="submit">Save report</button>
    </form>

    <div class="report-grid">
      <div v-for="r in reports" :key="r.id" class="dash-panel report-card">
        <div class="pair">
          <div class="cp before" :style="{ background: r.before }"><span>Before</span></div>
          <div class="cp after" :style="{ background: r.after }"><span>After</span></div>
        </div>
        <div class="meta">
          <strong>{{ r.zone }}</strong>
          <span>{{ r.employee }} • {{ r.date }}</span>
          <p>{{ r.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../assets/dash.css';
.report-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr auto;
  gap: 12px;
  margin-bottom: 22px;
}
.report-form input, .report-form select, .report-form textarea {
  padding: 11px 13px;
  border-radius: 12px;
  border: 1px solid var(--brown-line);
  background: var(--white);
  font-size: 0.9rem;
  outline: none;
  resize: vertical;
}
.report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}
.report-card { padding: 20px; }
.pair {
  position: relative;
  height: 170px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.cp { position: absolute; inset: 0; display: flex; align-items: flex-end; }
.cp span {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: #fff; background: rgba(0,0,0,0.3); padding: 3px 9px; border-radius: 999px; margin: 10px;
}
.cp.before { clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%); }
.cp.after { clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%); }
.meta { margin-top: 14px; }
.meta strong { display: block; color: var(--green-deep); }
.meta span { color: var(--moss); font-size: 0.82rem; }
.meta p { color: var(--ink-soft); font-size: 0.9rem; margin-top: 6px; }
@media (max-width: 900px) {
  .report-form { grid-template-columns: 1fr 1fr; }
  .report-grid { grid-template-columns: 1fr; }
}
</style>
