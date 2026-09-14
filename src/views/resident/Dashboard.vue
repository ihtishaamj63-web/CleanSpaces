<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const tab = ref('zone')

const zone = {
  name: 'Manenberg Zone A',
  plan: 'Small Zone',
  households: 72,
  paid: 51,
  threshold: 60,
}

const thresholdPct = computed(() =>
  Math.min(100, Math.round((zone.paid / (zone.households * (zone.threshold / 100))) * 100))
)

const payments = [
  { id: '#PAY-1042', date: '28 Aug 2026', plan: 'Small Zone', amount: 'R 3,900', status: 'paid' },
  { id: '#PAY-1007', date: '28 Jul 2026', plan: 'Small Zone', amount: 'R 3,900', status: 'paid' },
  { id: '#PAY-0963', date: '28 Jun 2026', plan: 'Small Zone', amount: 'R 3,900', status: 'paid' },
  { id: '#PAY-0912', date: '25 Jun 2026', plan: 'Small Zone', amount: 'R 3,900', status: 'pending' },
]

const cleanups = [
  { date: '24 Aug 2026', label: 'Street corner & drain', before: 'linear-gradient(135deg,#8a7a68,#5d5145)', after: 'linear-gradient(135deg,#54936b,#2e5138)' },
  { date: '17 Aug 2026', label: 'Playground edge', before: 'linear-gradient(135deg,#7d6f60,#4f4539)', after: 'linear-gradient(135deg,#63a17d,#3a6548)' },
  { date: '10 Aug 2026', label: 'Main road strip', before: 'linear-gradient(135deg,#88776a,#574a3f)', after: 'linear-gradient(135deg,#4f8d68,#2e5942)' },
]

function logout() {
  router.push('/login')
}
</script>

<template>
  <div class="dash">
    <aside class="dash-side">
      <RouterLink to="/" class="side-brand">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path d="M16 4c0 7 4 10 10 12-1 6-5 10-10 12-5-2-9-6-10-12 6-2 10-5 10-12z" fill="currentColor" opacity=".9"/>
        </svg>
        <span><strong>CleanSpaces</strong><span>Resident</span></span>
      </RouterLink>

      <nav class="side-nav">
        <RouterLink to="/resident" class="side-link active"><span class="ico">🗂️</span>Dashboard</RouterLink>
        <RouterLink to="/resident" class="side-link"><span class="ico">💳</span>Payments</RouterLink>
        <RouterLink to="/resident" class="side-link"><span class="ico">🧹</span>Cleanups</RouterLink>
        <RouterLink to="/" class="side-link"><span class="ico">🌐</span>View site</RouterLink>
      </nav>

      <div class="side-user">
        <div class="who">
          <span class="av">T</span>
          <span><strong>Thandiwe Mbeki</strong><small>thandiwe@gmail.com</small></span>
        </div>
        <button class="side-logout" @click="logout">Sign out</button>
      </div>
    </aside>

    <main class="dash-main">
      <div class="dash-top">
        <div>
          <h1>Resident Dashboard</h1>
          <p>Welcome back, Thandiwe 👋</p>
        </div>
        <RouterLink to="/" class="view-site">← Back to site</RouterLink>
      </div>

      <div class="dash-cards">
        <div class="dash-card">
          <div class="lbl">My zone</div>
          <div class="val">{{ zone.name }}</div>
          <div class="sub">{{ zone.plan }} • {{ zone.households }} households</div>
        </div>
        <div class="dash-card">
          <div class="lbl">Payment status</div>
          <div class="val">Paid</div>
          <div class="sub">Current • due 28 Sep</div>
        </div>
        <div class="dash-card">
          <div class="lbl">Cleanups completed</div>
          <div class="val">12</div>
          <div class="sub">This quarter</div>
        </div>
      </div>

      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: tab === 'zone' }" @click="tab = 'zone'">My Zone</button>
        <button class="tab-btn" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">Payments</button>
        <button class="tab-btn" :class="{ active: tab === 'cleanups' }" @click="tab = 'cleanups'">Cleanups</button>
      </div>

      <!-- My Zone -->
      <div v-if="tab === 'zone'" class="dash-panel">
        <div class="panel-head">
          <h2>Activation progress</h2>
          <RouterLink to="/pricing" class="btn btn-green">Invite neighbours</RouterLink>
        </div>
        <div class="progress-wrap">
          <div class="progress"><span :style="{ width: thresholdPct + '%' }"></span></div>
          <span class="progress-lbl">{{ zone.paid }} / {{ Math.round(zone.households * zone.threshold / 100) }} paid</span>
        </div>
        <p style="color:var(--ink-soft);margin-top:16px;font-size:0.95rem;">
          Your zone activates once <strong>{{ zone.threshold }}%</strong> (≈ {{ Math.round(zone.households * zone.threshold / 100) }} of {{ zone.households }}
          households) have paid their subscription. You’re at <strong>{{ thresholdPct }}%</strong> toward that goal. 🌿
        </p>
      </div>

      <!-- Payments -->
      <div v-if="tab === 'payments'" class="dash-panel">
        <div class="panel-head">
          <h2>Payment history</h2>
          <RouterLink to="/pricing" class="btn btn-green">Make a payment</RouterLink>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Reference</th><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in payments" :key="p.id">
                <td>{{ p.id }}</td>
                <td>{{ p.date }}</td>
                <td>{{ p.plan }}</td>
                <td>{{ p.amount }}</td>
                <td><span class="tag" :class="p.status">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style="color:var(--ink-soft);font-size:0.85rem;margin-top:14px;">Payments are processed securely via PayFast.</p>
      </div>

      <!-- Cleanups -->
      <div v-if="tab === 'cleanups'" class="dash-panel">
        <div class="panel-head"><h2>Cleanup photo proof</h2></div>
        <div class="cleanup-grid">
          <div v-for="c in cleanups" :key="c.date" class="cleanup-item">
            <div class="pair">
              <div class="cp before" :style="{ background: c.before }"><span>Before</span></div>
              <div class="cp after" :style="{ background: c.after }"><span>After</span></div>
            </div>
            <p><strong>{{ c.label }}</strong> <span>{{ c.date }}</span></p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import '../../assets/dash.css';
.cleanup-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.cleanup-item .pair {
  position: relative;
  height: 150px;
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
.cleanup-item p { margin-top: 10px; font-size: 0.9rem; }
.cleanup-item p span { color: var(--ink-soft); font-size: 0.82rem; }
@media (max-width: 800px) {
  .cleanup-grid { grid-template-columns: 1fr; }
}
</style>
