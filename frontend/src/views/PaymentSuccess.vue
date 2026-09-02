<template>
  <div class="auth-page">
    <div class="glow"></div>
    <div class="auth-card">
      <div class="logo-section">
        <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces Logo" class="logo" />
        <h1 class="brand-title">CLEAN<span>SPACES</span></h1>
        <p class="tagline">Cleaner Spaces. Stronger Communities.</p>
      </div>

      <div v-if="payment" class="confirmation">
        <div class="check">✓</div>
        <h2 class="confirm-title">Payment Successful</h2>
        <p class="confirm-text">Thank you! Your contribution to your zone has been received.</p>

        <div class="details">
          <div class="row"><span>Reference</span><span>#CS-{{ String(payment.id).padStart(5, '0') }}</span></div>
          <div class="row"><span>Amount</span><span>R{{ payment.amount }}</span></div>
          <div class="row"><span>Method</span><span>{{ payment.method }}</span></div>
        </div>

        <!-- What happens next -->
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
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading your payment…</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api.js'

const route = useRoute()
const payment = ref(null)
const zoneProgress = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/payments/return/${route.params.id}`)
    payment.value = res.data
  } catch {
    payment.value = { id: route.params.id, amount: '—', method: '—' }
  }

  // What happens next: fetch zone activation progress
  try {
    const dash = await api.get('/resident/dashboard')
    if (dash.data.hasZone) {
      const z = dash.data.zone
      const pct = Math.min(100, Math.round((z.paid / z.threshold) * 100))
      zoneProgress.value = {
        pct,
        remaining: Math.max(0, z.threshold - z.paid),
        activated: z.paid >= z.threshold
      }
    }
  } catch {
    // dashboard unreachable — skip the next-steps block silently
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid; place-items: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}
.glow {
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 179, 66, 0.18) 0%, transparent 70%);
  top: -150px; left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
.auth-card {
  width: min(100%, 460px);
  padding: 2.75rem;
  background: linear-gradient(165deg, #12332d 0%, #0b2a25 100%);
  color: #f4f6f5;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid #7cb342;
  box-shadow: 0 25px 60px rgba(11, 42, 37, 0.45);
  text-align: center;
  position: relative;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.logo-section { margin-bottom: 1.75rem; }
.logo {
  width: 84px; height: 84px; object-fit: contain;
  margin-bottom: .6rem;
  background: white; padding: 6px; border-radius: 50%;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}
.brand-title {
  margin: 0 0 .3rem; font-size: 1.8rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: .02em; color: #f4f6f5;
}
.brand-title span { color: #9ccc65; }
.tagline { margin: 0; color: #a0b0ac; font-size: .9rem; }

.check {
  width: 72px; height: 72px; line-height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25; font-size: 36px; font-weight: 800;
  margin: 0 auto 1.1rem;
  box-shadow: 0 8px 24px rgba(124, 179, 66, 0.45);
  animation: pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}
.confirm-title { margin: 0 0 .4rem; font-size: 1.45rem; color: #f4f6f5; }
.confirm-text { margin: 0 0 1.5rem; color: #a0b0ac; font-size: .95rem; }

.details { text-align: left; margin: 0 0 1.25rem; }
.details .row {
  display: flex; justify-content: space-between;
  padding: .8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  animation: fadeUp 0.4s ease-out forwards;
}
.details .row:nth-child(1) { animation-delay: 0.4s; }
.details .row:nth-child(2) { animation-delay: 0.6s; }
.details .row:nth-child(3) { animation-delay: 0.8s; }
.details .row span:first-child { color: #a0b0ac; }
.details .row span:last-child { font-weight: 700; }

/* What happens next */
.next-steps {
  padding: 1.1rem 1.25rem;
  background: rgba(124, 179, 66, 0.08);
  border: 1px solid rgba(124, 179, 66, 0.25);
  border-radius: 12px;
  margin: 0 0 1.5rem;
  opacity: 0;
  animation: fadeUp 0.4s ease-out 1s forwards;
  text-align: left;
}
.next-bar {
  height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: .6rem;
}
.next-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #7cb342, #9ccc65);
  box-shadow: 0 0 10px rgba(124, 179, 66, 0.5);
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1) 1.2s;
}
.next-text { margin: 0; font-size: .88rem; color: #d7e4de; }

.submit-btn {
  display: block; width: 100%; padding: 1rem;
  color: #0b2a25;
  background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
  border: 0; border-radius: 10px;
  font-weight: 800; font-size: 1rem;
  font-family: 'Sora', sans-serif;
  cursor: pointer; text-decoration: none;
  box-shadow: 0 6px 18px rgba(124, 179, 66, 0.4);
  transition: all 0.25s ease;
  opacity: 0;
  animation: fadeUp 0.4s ease-out 1.2s forwards;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(124, 179, 66, 0.55); }

.loading-state { padding: 2rem 0; }
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1rem;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: #7cb342;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text { color: #a0b0ac; }

@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: none; } }
</style>