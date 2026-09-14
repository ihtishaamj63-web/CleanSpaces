<template>
  <!-- Admin: approve or reject pending zone registrations -->
  <section class="admin-page">
    <AdminNav />
    <header>
      <div>
        <p class="eyebrow">Zone registration</p>
        <h1>Zone approvals</h1>
        <p>Approve qualifying communities to activate their service zone.</p>
      </div>
    </header>

    <p v-if="message" :class="['message', error ? 'error' : 'success']">{{ message }}</p>

    <div v-if="loading" class="empty">Loading zones…</div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Plan</th>
            <th>Households</th>
            <th>Status</th>
            <th>Registered</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="zone in zones" :key="zone.id">
            <td>
              <strong>{{ zone.name }}</strong>
              <small>{{ zone.neighborhood }}</small>
            </td>
            <td class="capitalize">{{ zone.plan_type }}</td>
            <td>{{ zone.households }}</td>
            <td><span :class="['badge', zone.status]">{{ zone.status }}</span></td>
            <td>{{ date(zone.created_at) }}</td>
            <td v-if="zone.status === 'pending'" class="actions">
              <button @click="approve(zone.id)">Approve</button>
              <button class="reject" @click="reject(zone.id)">Reject</button>
            </td>
            <td v-else>—</td>
          </tr>
          <tr v-if="!zones.length">
            <td colspan="6" class="empty">No zone registrations yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../api.js'
import AdminNav from './AdminNav.vue'
import { askConfirm } from '../../utils/confirm.js'

const zones = ref([])
const loading = ref(true)
const message = ref('')
const error = ref(false)

// Shared date formatter (en-ZA: 14 Sept 2026)
const date = (v) => new Date(v).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

// Load every zone, pending first, then newest
async function load() {
  loading.value = true
  try {
    zones.value = (await api.get('/zones')).data
  } catch (e) {
    error.value = true
    message.value = e.response?.data?.message || 'Unable to load zones.'
  } finally {
    loading.value = false
  }
}

// Shared approve/reject dispatcher
async function action(method, id) {
  try {
    message.value = (await api[method](`/zones/${id}${method === 'put' ? '/approve' : ''}`)).data.message
    error.value = false
    await load()
  } catch (e) {
    error.value = true
    message.value = e.response?.data?.message || 'Action could not be completed.'
  }
}

const approve = (id) => action('put', id)

// Confirm rejection with SweetAlert2 instead of native confirm()
const reject = async (id) => {
  if (await askConfirm('Reject this zone registration?', 'The pending zone will be removed.')) {
    action('delete', id)
  }
}

onMounted(load)
</script>

<style scoped>
/* Page shell */
.admin-page { width: min(1120px, 100%); margin: auto; padding: 2rem 1.5rem 4rem; }
header { margin: 2rem 0 1rem; }
.eyebrow { color: var(--green); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
h1 { color: var(--green-dark); margin: 0.2rem 0; }
header p:not(.eyebrow) { color: var(--text-muted); margin: 0; }

/* Zones table */
.table-wrap { overflow: auto; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
table { border-collapse: collapse; width: 100%; min-width: 700px; }
th, td { text-align: left; padding: 1rem; border-bottom: 1px solid var(--border); }
th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
td small { display: block; color: var(--text-muted); }

/* Status badges */
.badge { padding: 0.25rem 0.55rem; border-radius: 99px; font-size: 0.78rem; font-weight: 800; }
.pending { color: #7a5300; background: #fff1cb; }
.active { color: #286033; background: #e5f5e7; }
.capitalize { text-transform: capitalize; }

/* Action buttons */
.actions { display: flex; gap: 0.5rem; }
button { border: 0; border-radius: 6px; padding: 0.45rem 0.65rem; background: var(--green); color: var(--green-deeper); font-weight: 800; cursor: pointer; }
.reject { background: #f9e4e4; color: #962a2a; }

/* Flash message + empty state */
.message { padding: 0.7rem; border-radius: 7px; }
.success { background: #e7f5e8; color: #286033; }
.error { background: #fff0f0; color: #9b2525; }
.empty { text-align: center; padding: 2rem; color: var(--text-muted); }
</style>