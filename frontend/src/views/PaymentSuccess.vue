<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-section">
        <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces Logo" class="logo" />
        <h1 class="brand-title">CLEAN<span>SPACES</span></h1>
        <p class="tagline">Cleaner Spaces. Stronger Communities.</p>
      </div>

      <!-- COMPLETED -->
      <div v-if="payment && payment.status === 'completed'" class="confirmation">
        <div class="check">✓</div>
        <h2 class="confirm-title">Payment Successful</h2>
        <p class="confirm-text">Thank you! Your contribution to your zone has been received.</p>

        <div class="details">
          <div class="row"><span>Reference</span><span>#CS-{{ String(payment.id).padStart(5, '0') }}</span></div>
          <div class="row"><span>Amount</span><span>R{{ payment.amount }}</span></div>
          <div class="row"><span>Method</span><span>{{ methodLabel }}</span></div>
        </div>

        <div class="next-steps" v-if="zoneProgress">
          <div class="next-bar">
            <div class="next-fill" :style="{ width: zoneProgress.pct + '%' }"></div>
          </div>
          <p class="next-text" v-if="zoneProgress.activated">
            Your zone is active — weekly cleanups are running.
          </p>
          <p class="next-text" v-else>
            Your zone activates at 60% paid — currently {{ zoneProgress.pct }}%
            ({{ zoneProgress.remaining }} more households to go).
          </p>
        </div>

        <router-link to="/resident/dashboard" class="submit-btn">
          Go to My Dashboard →
        </router-link>
      </div>

      <!-- FAILED -->
      <div v-else-if="payment && payment.status === 'failed'" class="confirmation">
        <div class="check failed">✕</div>
        <h2 class="confirm-title">Payment Not Completed</h2>
        <p class="confirm-text">
          The payment was cancelled or declined — no money has left your account.
        </p>
        <router-link to="/payment" class="submit-btn">Try Again →</router-link>
      </div>

      <!-- PENDING — waiting for PayFast's ITN confirmation -->
      <div v-else-if="payment" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Confirming your payment… this can take a few seconds.</p>
      </div>

      <!-- LOOKUP FAILED -->
      <div v-else-if="loadFailed" class="loading-state">
        <p class="loading-text">
          We couldn't confirm this payment right now. Any completed payment will
          still appear on your dashboard.
        </p>
        <router-link to="/resident/dashboard" class="submit-btn">Go to My Dashboard →</router-link>
      </div>

      <!-- INITIAL LOAD -->
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading your payment…</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api.js'

const route = useRoute()
const payment = ref(null)
const zoneProgress = ref(null)
const loadFailed = ref(false)
let retries = 0

const METHOD_LABELS = { card: 'Card', eft: 'EFT' }
const methodLabel = computed(() =>
  METHOD_LABELS[payment.value?.method] || payment.value?.method || '—'
)

async function load() {
  try {
    const res = await api.get(`/payments/return/${route.params.id}`)
    payment.value = res.data
    // PayFast's ITN webhook is the source of truth and can land moments
    // after the redirect — poll briefly while the payment is still pending.
    if (payment.value?.status === 'pending' && retries++ < 4) setTimeout(load, 2500)
  } catch {
    loadFailed.value = true
  }
}

// Zone activation progress for the "what happens next" block
async function loadZoneProgress() {
  try {
    const dash = await api.get('/resident/dashboard')
    if (dash.data.hasZone) {
      const z = dash.data.zone
      zoneProgress.value = {
        pct: Math.min(100, Math.round((z.paid / z.threshold) * 100)),
        remaining: Math.max(0, z.threshold - z.paid),
        activated: z.paid >= z.threshold
      }
    }
  } catch {
    // dashboard unreachable — skip the next-steps block silently
  }
}

onMounted(async () => {
  await load()
  loadZoneProgress()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid; place-items: center;
  padding: 2rem 1rem;
  background: #f7faf8;
}
.auth-card {
  width: min(100%, 460px);
  padding: 2.75rem;
  background: #ffffff;
  color: #183b28;
  border: 1px solid #e4eee7;
  border-radius: 20px;
  border-left: 3px solid #198044;
  box-shadow: 0 25px 60px rgba(31, 89, 54, 0.12);
  text-align: center;
}

.logo-section { margin-bottom: 1.75rem; }
.logo {
  width: 84px; height: 84px; object-fit: contain;
  margin-bottom: 0.6rem;
  background: white; padding: 6px; border-radius: 50%;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.brand-title {
  margin: 0 0 0.3rem; font-size: 1.8rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.02em; color: #173b27;
}
.brand-title span { color: #198044; }
.tagline { margin: 0; color: #8a978f; font-size: 0.9rem; }

.check {
  width: 72px; height: 72px; line-height: 72px;
  border-radius: 50%;
  background: #176b3a;
  color: #ffffff; font-size: 36px; font-weight: 800;
  margin: 0 auto 1.1rem;
  box-shadow: 0 8px 24px rgba(23, 107, 58, 0.25);
}
.check.failed { background: #c62828; color: #ffffff; }
.confirm-title { margin: 0 0 0.4rem; font-size: 1.45rem; color: #173b27; }
.confirm-text { margin: 0 0 1.5rem; color: #718077; font-size: 0.95rem; }

.details { text-align: left; margin: 0 0 1.25rem; }
.details .row {
  display: flex; justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #e6eee8;
}
.details .row span:first-child { color: #8a978f; }
.details .row span:last-child { font-weight: 700; color: #173b27; }

.next-steps {
  padding: 1.1rem 1.25rem;
  background: #e9f7ed;
  border: 1px solid #bfe3cc;
  border-radius: 12px;
  margin: 0 0 1.5rem;
  text-align: left;
}
.next-bar {
  height: 6px; border-radius: 999px;
  background: #e6eee8;
  overflow: hidden;
  margin-bottom: 0.6rem;
}
.next-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #198044, #3b9b68);
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.next-text { margin: 0; font-size: 0.88rem; color: #24633a; }

.submit-btn {
  display: block; width: 100%; padding: 1rem;
  color: #ffffff;
  background: #176b3a;
  border: 0; border-radius: 10px;
  font-weight: 800; font-size: 1rem;
  cursor: pointer; text-decoration: none;
  box-shadow: 0 6px 18px rgba(23, 107, 58, 0.2);
  transition: all 0.25s ease;
  margin-top: 1rem;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(23, 107, 58, 0.28); }

.loading-state { padding: 2rem 0; }
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1rem;
  border: 4px solid #dcebe0;
  border-top-color: #198044;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text { color: #718077; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>