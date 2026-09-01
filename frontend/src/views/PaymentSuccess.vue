<template>
  <div class="auth-page">
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

        <router-link to="/resident/dashboard" class="submit-btn">Go to My Dashboard</router-link>
      </div>
      <p v-else class="loading-text">Loading your payment…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api.js'

const route = useRoute()
const payment = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/payments/return/${route.params.id}`)
    payment.value = res.data
  } catch {
    payment.value = { id: route.params.id, amount: '—', method: '—' }
  }
})
</script>

<style scoped>
.auth-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem 1rem; background: #f4f6f5; }
.auth-card { width: min(100%, 440px); padding: 2.5rem; background: #12332d; color: #f4f6f5; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,.35); text-align: center; }

.logo-section { margin-bottom: 1.75rem; }
.logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: .5rem; background: white; padding: 5px; border-radius: 50%; }
.brand-title { margin: 0 0 .3rem; font-size: 1.8rem; font-weight: 800; text-transform: uppercase; }
.brand-title span { color: #7cb342; }
.tagline { margin: 0; color: #a0b0ac; font-size: .9rem; }

.check { width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background: #7cb342; color: #0b2a25; font-size: 32px; font-weight: 800; margin: 0 auto 1rem; }
.confirm-title { margin: 0 0 .4rem; font-size: 1.4rem; }
.confirm-text { margin: 0 0 1.5rem; color: #a0b0ac; font-size: .95rem; }

.details { text-align: left; margin: 0 0 1.5rem; }
.details .row { display: flex; justify-content: space-between; padding: .7rem 0; border-bottom: 1px solid rgba(255,255,255,.12); }
.details .row span:first-child { color: #a0b0ac; }
.details .row span:last-child { font-weight: 700; }

.submit-btn { display: block; width: 100%; padding: .9rem; color: #0b2a25; background: #7cb342; border: 0; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; text-decoration: none; }
.submit-btn:hover { background: #8bc34a; }
.loading-text { color: #a0b0ac; }
</style>