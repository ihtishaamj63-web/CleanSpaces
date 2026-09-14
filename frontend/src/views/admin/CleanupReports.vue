<template>
  <section class="admin-page">
    <AdminNav />
    <header>
      <p class="eyebrow">Service proof</p>
      <h1>Cleanup reports</h1>
      <p>Upload before-and-after photos to document completed work.</p>
    </header>

    <p v-if="message" :class="['message', error ? 'error' : 'success']">{{ message }}</p>

    <div class="layout">
      <form class="card" @submit.prevent="save">
        <h2>New cleanup report</h2>
        <label>Zone
          <select v-model="form.zone_id" required>
            <option value="" disabled>Select active zone</option>
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">{{ zone.name }}</option>
          </select>
        </label>
        <label>Crew member
          <select v-model="form.employee_id" required>
            <option value="" disabled>Select employee</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">{{ employee.name }}</option>
          </select>
        </label>
        <label>Before photo
          <input ref="beforeInput" required type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="setPhoto('before_photo', $event)" />
        </label>
        <label>After photo
          <input ref="afterInput" required type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="setPhoto('after_photo', $event)" />
        </label>
        <small class="upload-help">JPG, PNG, WebP or GIF · up to 5 MB per photo</small>
        <label>Notes
          <textarea v-model.trim="form.notes" required rows="3" placeholder="What was completed?"></textarea>
        </label>
        <label>Date cleaned
          <input v-model="form.date_cleaned" required type="date" />
        </label>
        <button>Save report</button>
      </form>

      <div class="report-grid">
        <article v-for="report in reports" :key="report.id" class="report">
          <div class="report-head">
            <div><h3>{{ report.zone_name }}</h3><p>{{ report.employee_name }} · {{ date(report.date_cleaned) }}</p></div>
            <span>Completed</span>
          </div>
          <div class="photos">
            <a :href="report.before_url" target="_blank"><img :src="report.before_url" alt="Before cleanup" /><small>Before</small></a>
            <a :href="report.after_url" target="_blank"><img :src="report.after_url" alt="After cleanup" /><small>After</small></a>
          </div>
          <p>{{ report.notes }}</p>
        </article>
        <p v-if="!reports.length" class="empty">No cleanup reports yet.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../api.js'
import AdminNav from './AdminNav.vue'

const reports = ref([])
const zones = ref([])
const employees = ref([])
const message = ref('')
const error = ref(false)
const beforeInput = ref(null)
const afterInput = ref(null)
const today = () => new Date().toLocaleDateString('en-CA')
const form = reactive({ zone_id: '', employee_id: '', before_photo: null, after_photo: null, notes: '', date_cleaned: today() })

const date = (value) => new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
const setPhoto = (field, event) => { form[field] = event.target.files?.[0] || null }

function reset() {
  Object.assign(form, { zone_id: '', employee_id: '', before_photo: null, after_photo: null, notes: '', date_cleaned: today() })
  if (beforeInput.value) beforeInput.value.value = ''
  if (afterInput.value) afterInput.value.value = ''
}

async function load() {
  try {
    const [reportResponse, zoneResponse, employeeResponse] = await Promise.all([
      api.get('/cleanup-reports'), api.get('/zones'), api.get('/employees')
    ])
    reports.value = reportResponse.data
    zones.value = zoneResponse.data.filter((zone) => zone.status === 'active')
    employees.value = employeeResponse.data.filter((employee) => employee.status === 'active')
  } catch {
    error.value = true
    message.value = 'Unable to load cleanup reports.'
  }
}

async function save() {
  if (!form.before_photo || !form.after_photo) {
    error.value = true
    message.value = 'Upload both before and after photos.'
    return
  }

  try {
    const payload = new FormData()
    payload.append('zone_id', form.zone_id)
    payload.append('employee_id', form.employee_id)
    payload.append('before_photo', form.before_photo)
    payload.append('after_photo', form.after_photo)
    payload.append('notes', form.notes)
    payload.append('date_cleaned', form.date_cleaned)
    const { data } = await api.post('/cleanup-reports', payload)
    message.value = data.message
    error.value = false
    reset()
    await load()
  } catch (requestError) {
    error.value = true
    message.value = requestError.response?.data?.message || 'Unable to save cleanup report.'
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page{width:min(1120px,100%);margin:auto;padding:2rem 1.5rem 4rem}header{margin:2rem 0 1rem}.eyebrow{color:var(--green);font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin:0}h1{color:var(--green-dark);margin:.2rem 0}header p:not(.eyebrow){color:var(--text-muted);margin:0}.layout{display:grid;grid-template-columns:330px 1fr;gap:1.25rem}.card,.report{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.2rem}.card h2{margin:0;color:var(--green-dark)}label{display:grid;gap:.3rem;margin:.7rem 0;font-weight:700;font-size:.85rem;color:var(--green-dark)}input,select,textarea{padding:.65rem;border:1px solid var(--border);border-radius:7px;resize:vertical}.upload-help{display:block;color:var(--text-muted);font-size:.78rem;margin:-.25rem 0 .6rem}button{cursor:pointer;border:0;padding:.65rem .8rem;border-radius:7px;background:var(--green);color:var(--green-deeper);font-weight:800}.report-grid{display:grid;gap:1rem}.report-head{display:flex;justify-content:space-between;gap:1rem}.report h3{margin:0;color:var(--green-dark)}.report-head p,.report>p{margin:.25rem 0;color:var(--text-muted)}.report-head span{font-size:.75rem;color:#286033;background:#e6f5e8;padding:.25rem .5rem;border-radius:99px;height:max-content}.photos{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:1rem 0}.photos a{position:relative;display:block;color:#fff}.photos img{width:100%;height:130px;object-fit:cover;border-radius:8px;display:block;background:#e7eeea}.photos small{position:absolute;bottom:.4rem;left:.4rem;padding:.15rem .4rem;border-radius:4px;background:rgba(0,0,0,.6)}.message{padding:.7rem;border-radius:7px}.success{background:#e7f5e8;color:#286033}.error{background:#fff0f0;color:#9b2525}.empty{color:var(--text-muted)}@media(max-width:760px){.layout{grid-template-columns:1fr}}
</style>
