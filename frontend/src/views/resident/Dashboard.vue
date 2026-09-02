<template>
  <div class="resident-page">
    <section class="resident-wrap">
      <div class="section-heading">
        <h1>My Dashboard</h1>
        <p>Your zone, payments and cleanup results at a glance.</p>
      </div>

      <div v-if="loading" class="card state-card">
        <div class="spinner"></div>
        <p class="muted-text">Loading your dashboard…</p>
      </div>

      <div v-else-if="loadError" class="card state-card">
        <div class="state-icon">⚠</div>
        <h3>Couldn't load your dashboard</h3>
        <p class="muted-text">Is the backend running? Refresh once it's up.</p>
        <button class="btn-secondary" @click="load">Try Again</button>
      </div>

      <div v-else-if="!data.hasZone" class="card state-card">
        <div class="state-icon">📍</div>
        <h2>You're not part of a zone yet</h2>
        <p class="muted-text">Register your zone or join an existing one to start your subscription.</p>
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

        <!-- MY ZONE -->
        <div v-show="activeTab === 'zone'" class="card zone-card">
          <div class="zone-head">
            <div>
              <h2>{{ data.zone.name }}</h2>
              <p class="zone-sub">{{ data.zone.neighborhood }} · {{ planLabel }} Zone</p>
            </div>
            <span class="status-badge" :class="data.zone.myStatus === 'paid' ? 'paid' : 'pending'">
              {{ data.zone.myStatus === 'paid' ? '✓ Paid This Month' : 'Payment Pending' }}
            </span>
          </div>

          <div class="progress-block">
            <div class="progress-labels">
              <span><strong>{{ data.zone.paid }}</strong> of {{ data.zone.threshold }} households paid</span>
              <span class="muted-text">Zone activates at {{ data.zone.threshold }} (60% of {{ data.zone.households }})</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressDisplay + '%' }"></div>
            </div>
            <p class="progress-note">
              <template v-if="progressPct >= 100">🎉 Threshold reached — weekly cleanups are active!</template>
              <template v-else>{{ data.zone.threshold - data.zone.paid }} more households needed to activate.</template>
            </p>
          </div>

          <router-link v-if="data.zone.myStatus !== 'paid'" to="/payment" class="btn-primary pay-cta">
            Pay My Contribution →
          </router-link>
        </div>

        <!-- PAYMENTS -->
        <div v-show="activeTab === 'payments'" class="card">
          <h3>Payment History</h3>
          <div class="table-responsive">
            <table v-if="payments.length">
              <thead>
                <tr>
                  <th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in payments" :key="p.id">
                  <td>
                    <router-link :to="`/payment/success/${p.id}`" class="ref-link">
                      #CS-{{ String(p.id).padStart(5, '0') }}
                    </router-link>
                  </td>
                  <td class="amount">R{{ p.amount }}</td>
                  <td>{{ p.method }}</td>
                  <td><span class="status-badge sm" :class="p.status">{{ p.status }}</span></td>
                  <td class="muted-text">{{ formatDate(p.created_at) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-table">
              <p class="muted-text">No payments yet.</p>
              <router-link to="/payment" class="btn-secondary">Make your first payment</router-link>
            </div>
          </div>
        </div>

        <!-- CLEANUPS -->
        <div v-show="activeTab === 'cleanups'" class="card">
          <h3>Recent Cleanups</h3>

          <swiper
            v-if="cleanups.length"
            :modules="modules"
            :slides-per-view="1"
            :space-between="24"
            :pagination="{ clickable: true }"
            :autoplay="{ delay: 5000, disableOnInteraction: true }"
            :grab-cursor="true"
          >
            <swiper-slide v-for="c in cleanups" :key="c.id">
              <div class="ba-compare">
                <div class="ba-frame">
                  <img :src="c.before_url" alt="Before cleanup" loading="lazy" />
                  <span class="ba-label before">Before</span>
                </div>
                <div class="ba-frame">
                  <img :src="c.after_url" alt="After cleanup" loading="lazy" />
                  <span class="ba-label after">After</span>
                </div>
              </div>
              <p class="caption">{{ c.notes }}</p>
              <p class="muted-text sm">Completed {{ formatDate(c.date_cleaned) }}</p>
            </swiper-slide>
          </swiper>

          <div v-else class="empty-table">
            <p class="muted-text">No cleanups recorded for your zone yet.</p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import api from '../../api.js'

const modules = [Pagination, Autoplay]

const tabs = [
  { key: 'zone', label: 'My Zone' },
  { key: 'payments', label: 'Payments' },
  { key: 'cleanups', label: 'Cleanups' }
]
const activeTab = ref('zone')

const loading = ref(true)
const loadError = ref(false)
const data = ref({ hasZone: false, zone: null })
const payments = ref([])
const cleanups = ref([])
const progressDisplay = ref(0)

const planLabel = computed(() => {
  const plan = data.value.zone?.plan
  return { small: 'Small', medium: 'Medium', large: 'Large' }[plan] || ''
})

const progressPct = computed(() => {
  const z = data.value.zone
  if (!z || !z.threshold) return 0
  return Math.min(Math.round((z.paid / z.threshold) * 100), 100)
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const [dashRes, payRes] = await Promise.all([
      api.get('/resident/dashboard'),
      api.get('/resident/payments')
    ])
    data.value = dashRes.data
    payments.value = payRes.data

    if (data.value.hasZone) {
      const res = await api.get('/resident/cleanups')
      cleanups.value = res.data
    }

    // Animate the progress bar after render
    await nextTick()
    setTimeout(() => { progressDisplay.value = progressPct.value }, 200)
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.resident-page { min-height: 100vh; padding: 3rem 1rem 5rem; }
.resident-wrap { max-width: 900px; margin: 0 auto; }

/* States */
.state-card { text-align: center; padding: 3.5rem 1.5rem; }
.state-card h2, .state-card h3 { margin: 0 0 .5rem; }
.state-card p { margin: 0 0 1.75rem; }
.state-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1.25rem;
  border: 4px solid var(--green-tint);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Tabs */
.tabs { display: flex; gap: .5rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
.tab-btn {
  padding: .65rem 1.6rem;
  background: white;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-weight: 700;
  font-family: var(--font-display);
  font-size: .9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}
.tab-btn:hover { color: var(--green-dark); border-color: var(--green); }
.tab-btn.active {
  color: var(--green-deeper);
  background: linear-gradient(135deg, var(--green), var(--green-deep));
  border-color: transparent;
  box-shadow: var(--shadow-green);
}

/* Zone card */
.zone-card { animation: fadeUp 0.45s ease-out both; }
.zone-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 1rem; flex-wrap: wrap; margin-bottom: 1.75rem;
}
.zone-head h2 { margin: 0; font-size: 1.6rem; font-weight: 800; }
.zone-sub { margin: .3rem 0 0; color: var(--text-muted); font-size: .95rem; }

.status-badge {
  padding: .4rem 1rem; border-radius: 20px;
  font-size: .8rem; font-weight: 700; white-space: nowrap;
}
.status-badge.paid, .status-badge.completed { color: #1b5e20; background: #d4edda; }
.status-badge.pending { color: #856404; background: #fff3cd; }
.status-badge.failed { color: #721c24; background: #f8d7da; }
.status-badge.sm { padding: .2rem .7rem; font-size: .75rem; }

/* Progress */
.progress-block { margin-bottom: 1.75rem; }
.progress-labels {
  display: flex; justify-content: space-between;
  font-size: .92rem; margin-bottom: .6rem; flex-wrap: wrap; gap: .3rem;
}
.progress-labels strong { color: var(--green-dark); font-size: 1.05rem; }
.progress-track {
  height: 16px; background: var(--green-tint);
  border-radius: 20px; overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(18, 51, 45, 0.1);
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green) 0%, #4caf50 60%, #66bb6a 100%);
  border-radius: 20px;
  box-shadow: 0 0 12px rgba(124, 179, 66, 0.5);
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.progress-note { margin: .7rem 0 0; color: var(--text-muted); font-size: .9rem; }

.pay-cta { margin-top: .5rem; }

/* Payments table */
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th {
  padding: .85rem 1rem;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: .75rem; text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 2px solid var(--border);
}
td { padding: 1rem; border-bottom: 1px solid #f0f2f0; font-size: .95rem; }
tr { transition: background 0.2s; }
tbody tr:hover { background: rgba(124, 179, 66, 0.04); }
.amount { font-weight: 700; color: var(--green-dark); }
.ref-link {
  color: var(--green-dark); font-weight: 700; text-decoration: none;
  border-bottom: 2px solid var(--green);
  transition: color 0.2s;
}
.ref-link:hover { color: var(--green-deep); }
.empty-table { text-align: center; padding: 2.5rem 0; }

/* Cleanup carousel */
.ba-compare { display: flex; gap: .75rem; }
.ba-frame {
  position: relative; flex: 1; overflow: hidden;
  border-radius: 14px;
  box-shadow: var(--shadow-md);
}
.ba-frame img {
  width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block;
  transition: transform 0.5s ease;
}
.ba-frame:hover img { transform: scale(1.05); }
.ba-label {
  position: absolute; bottom: .8rem; left: .8rem;
  padding: .25rem .8rem; border-radius: 20px;
  font-size: .75rem; font-weight: 700; color: white;
  backdrop-filter: blur(4px);
}
.ba-label.before { background: rgba(114, 28, 36, 0.85); }
.ba-label.after { background: rgba(104, 159, 56, 0.9); }
.caption { margin: 1rem 0 .2rem; font-size: .95rem; }

:deep(.swiper-pagination) { position: relative; margin-top: 1.25rem; }
:deep(.swiper-pagination-bullet) {
  background: #c5cec9; opacity: 1; width: 10px; height: 10px;
  transition: all 0.25s;
}
:deep(.swiper-pagination-bullet-active) {
  background: var(--green); width: 26px; border-radius: 5px;
}

.muted-text { color: var(--text-muted); }
.muted-text.sm { font-size: .85rem; margin: 0; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 600px) {
  .ba-compare { flex-direction: column; }
  th, td { padding: .7rem .5rem; }
}
</style>