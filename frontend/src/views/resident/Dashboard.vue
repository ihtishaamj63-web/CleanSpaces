<template>
  <div class="resident-page">
    <section class="resident-wrap">
      <div class="section-heading">
        <h1>My Dashboard</h1>
        <p>Your zone, payments and cleanup results at a glance.</p>
      </div>

      <div v-if="loading" class="loading-card">Loading your dashboard…</div>

      <div v-else-if="!data.hasZone" class="card empty-card">
        <h2>You're not part of a zone yet</h2>
        <p>Register your zone or join an existing one to start your subscription.</p>
        <router-link to="/how-it-works" class="btn-primary">Register Your Zone</router-link>
      </div>

      <template v-else>
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-show="activeTab === 'zone'" class="card">
          <div class="zone-head">
            <div>
              <h2>{{ data.zone.name }}</h2>
              <p class="zone-sub">{{ data.zone.neighborhood }} · {{ planLabel }} Zone</p>
            </div>
            <span class="status-badge" :class="data.zone.myStatus === 'paid' ? 'paid' : 'pending'">
              {{ data.zone.myStatus === 'paid' ? 'Paid This Month' : 'Payment Pending' }}
            </span>
          </div>

          <div class="progress-block">
            <div class="progress-labels">
              <span>{{ data.zone.paid }} of {{ data.zone.threshold }} households paid</span>
              <span>Zone activates at {{ data.zone.threshold }} (60% of {{ data.zone.households }})</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
            </div>
            <p class="progress-note">
              <template v-if="progressPct >= 100">🎉 Threshold reached — weekly cleanups are active!</template>
              <template v-else>{{ data.zone.threshold - data.zone.paid }} more households needed to activate.</template>
            </p>
          </div>

          <router-link v-if="data.zone.myStatus !== 'paid'" to="/payment" class="btn-primary pay-cta">
            Pay My Contribution
          </router-link>
        </div>

        <div v-show="activeTab === 'payments'" class="card">
          <h3>Payment History</h3>
          <div class="table-responsive">
            <table v-if="payments.length">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in payments" :key="p.id">
                  <td>#CS-{{ String(p.id).padStart(5, '0') }}</td>
                  <td>R{{ p.amount }}</td>
                  <td>{{ p.method }}</td>
                  <td><span class="status-badge sm" :class="p.status">{{ p.status }}</span></td>
                  <td>{{ formatDate(p.created_at) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="muted-text">No payments yet.</p>
          </div>
        </div>

        <div v-show="activeTab === 'cleanups'" class="card">
          <h3>Recent Cleanups</h3>
          <div v-if="cleanups.length" class="gallery">
            <div v-for="c in cleanups" :key="c.id" class="gallery-item">
              <div class="ba-images">
                <img :src="c.before_url" alt="Before cleanup" loading="lazy" />
                <img :src="c.after_url" alt="After cleanup" loading="lazy" />
              </div>
              <p class="caption">{{ c.notes }}</p>
              <p class="muted-text sm">{{ formatDate(c.date_cleaned) }}</p>
            </div>
          </div>
          <p v-else class="muted-text">No cleanups recorded for your zone yet.</p>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const tabs = [
  { key: 'zone', label: 'My Zone' },
  { key: 'payments', label: 'Payments' },
  { key: 'cleanups', label: 'Cleanups' }
]
const activeTab = ref('zone')

const loading = ref(true)
const data = ref({ hasZone: false, zone: null })
const payments = ref([])
const cleanups = ref([])

const planLabel = computed(() => {
  const plan = data.value.zone?.plan
  return { small: 'Small', medium: 'Medium', large: 'Large' }[plan] || ''
})

const progressPct = computed(() => {
  const z = data.value.zone
  if (!z || !z.threshold) return 0
  return Math.min(Math.round((z.paid / z.threshold) * 100), 100)
})

function authHeaders() {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  try {
    const [dashRes, payRes] = await Promise.all([
      fetch('/api/resident/dashboard', { headers: authHeaders() }),
      fetch('/api/resident/payments', { headers: authHeaders() })
    ])
    if (dashRes.ok) data.value = await dashRes.json()
    if (payRes.ok) payments.value = await payRes.json()

    if (data.value.hasZone) {
      const res = await fetch('/api/resident/cleanups', { headers: authHeaders() })
      if (res.ok) cleanups.value = await res.json()
    }
  } catch {
    // backend down — page still renders with empty state
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.resident-page { min-height: 100vh; padding: 3rem 1rem 4rem; background: #f4f6f5; }
.resident-wrap { max-width: 900px; margin: 0 auto; }
.section-heading { text-align: center; margin-bottom: 2rem; }
.section-heading h1 { margin: 0 0 .4rem; font-size: 2rem; color: #12332d; }
.section-heading p { margin: 0; color: #6a7a76; }

.loading-card, .empty-card { text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,.05); }
.empty-card h2 { margin: 0 0 .5rem; color: #12332d; }
.empty-card p { color: #6a7a76; margin: 0 0 1.5rem; }

.tabs { display: flex; gap: .5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tab-btn { padding: .6rem 1.4rem; background: white; color: #6a7a76; border: 1px solid #e0e5e2; border-radius: 20px; font-weight: 700; font-size: .9rem; cursor: pointer; }
.tab-btn.active { color: #0b2a25; background: #7cb342; border-color: #7cb342; }

.card { background: white; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,.05); padding: 1.75rem; margin-bottom: 1.5rem; }
.card h2, .card h3 { margin: 0 0 1rem; color: #12332d; }

.zone-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.zone-head h2 { margin: 0; }
.zone-sub { margin: .3rem 0 0; color: #6a7a76; font-size: .95rem; }

.status-badge { padding: .35rem .9rem; border-radius: 20px; font-size: .8rem; font-weight: 700; white-space: nowrap; }
.status-badge.paid, .status-badge.completed { color: #155724; background: #d4edda; }
.status-badge.pending { color: #856404; background: #fff3cd; }
.status-badge.failed { color: #721c24; background: #f8d7da; }
.status-badge.sm { padding: .2rem .6rem; font-size: .75rem; }

.progress-block { margin-bottom: 1.5rem; }
.progress-labels { display: flex; justify-content: space-between; color: #2e3d39; font-size: .9rem; margin-bottom: .5rem; flex-wrap: wrap; gap: .25rem; }
.progress-track { height: 14px; background: #edf5e3; border-radius: 20px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #7cb342, #4caf50); border-radius: 20px; transition: width .6s ease; }
.progress-note { margin: .6rem 0 0; color: #6a7a76; font-size: .9rem; }

.pay-cta { margin-top: .5rem; }

.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: .8rem 1rem; color: white; background: #12332d; font-size: .8rem; text-transform: uppercase; }
td { padding: .8rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: .95rem; }
@media (max-width: 600px) { th, td { padding: .6rem .5rem; } }

.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.ba-images { display: flex; gap: .5rem; }
.ba-images img { width: 50%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 8px; }
.caption { margin: .6rem 0 .2rem; font-size: .9rem; color: #2e3d39; }

.muted-text { color: #6a7a76; }
.muted-text.sm { font-size: .85rem; margin: 0; }
</style>