<template>
  <div class="payment-page">
    <section class="payment-wrap">
      <div class="section-heading">
        <h1>Complete Your Subscription</h1>
        <p>Choose your zone and pay your monthly contribution.</p>
      </div>

      <div class="steps">
        <span class="step done">1. Review</span>
        <span class="step current">2. Payment</span>
        <span class="step">3. Confirmation</span>
      </div>

      <div class="card">
        <h3>Order Summary</h3>
        <div class="input-group">
          <label for="zone">Your Zone</label>
          <select id="zone" v-model="selectedZoneId" class="select">
            <option v-for="z in zones" :key="z.id" :value="z.id">
              {{ z.name }} — {{ z.neighborhood }} ({{ z.households }} households)
            </option>
          </select>
        </div>

        <div v-if="selectedZone" class="summary">
          <div class="row"><span>Zone</span><span>{{ selectedZone.name }}</span></div>
          <div class="row"><span>Plan</span><span>{{ planInfo.label }}</span></div>
          <div class="row"><span>Monthly zone total</span><span>{{ planInfo.range }}</span></div>
          <div class="row"><span>Your household share</span><span>± R{{ perHousehold }}</span></div>
        </div>
      </div>

      <div class="card">
        <h3>Payment Method</h3>
        <div class="methods">
          <label class="method" :class="{ active: method === 'card' }">
            <input type="radio" value="card" v-model="method" /> 💳 Card
          </label>
          <label class="method" :class="{ active: method === 'eft' }">
            <input type="radio" value="eft" v-model="method" /> 🏦 EFT
          </label>
        </div>
        <p class="note">You will complete the payment on PayFast's secure page. Card details are never entered on our site.</p>

        <p v-if="error" class="error-text">{{ error }}</p>

        <button class="submit-btn" type="button" :disabled="loading || !selectedZoneId" @click="pay">
          {{ loading ? 'Processing…' : 'Proceed to Secure Payment' }}
        </button>
        <p class="secure">🔒 Payments processed securely by PayFast (PCI DSS Level 1 certified)</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const zones = ref([])
const selectedZoneId = ref(null)
const method = ref('card')
const loading = ref(false)
const error = ref('')

// Same fallback zones as Krish's ZoneMap so demo data is consistent site-wide
const fallbackZones = [
  { id: 1, name: 'NY108 Block', neighborhood: 'Manenberg', households: 62, plan_type: 'small', status: 'active' },
  { id: 3, name: 'Tafelsig', neighborhood: "Mitchell's Plain", households: 180, plan_type: 'medium', status: 'active' },
  { id: 5, name: 'Site C', neighborhood: 'Khayelitsha', households: 210, plan_type: 'large', status: 'active' },
]

const planInfoMap = {
  small: { label: 'Small Zone', range: 'R3,500 – R4,500' },
  medium: { label: 'Medium Zone', range: 'R6,500 – R8,000' },
  large: { label: 'Large Zone', range: 'R10,000 – R13,000' },
}

const selectedZone = computed(() => zones.value.find(z => z.id === selectedZoneId.value) || null)
const planInfo = computed(() => planInfoMap[selectedZone.value?.plan_type] || { label: '—', range: '—' })
const perHousehold = computed(() => {
  if (!selectedZone.value) return '—'
  const base = { small: 4000, medium: 7250, large: 11500 }[selectedZone.value.plan_type] || 0
  return Math.round(base / selectedZone.value.households)
})

onMounted(async () => {
  try {
    const res = await fetch('/api/zones')
    if (!res.ok) throw new Error('bad response')
    const data = await res.json()
    const active = (Array.isArray(data) ? data : []).filter(z => z.status === 'active')
    if (active.length === 0) throw new Error('no active zones')
    zones.value = active
  } catch {
    zones.value = fallbackZones
  }
  selectedZoneId.value = zones.value[0]?.id ?? null
})

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function pay() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ zone_id: selectedZoneId.value, method: method.value })
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    if (data.bypass) {
      router.push(`/payment/success/${data.payment.id}`)
    } else {
      submitToPayfast(data.url, data.params)
    }
  } catch {
    error.value = 'Could not start the payment. Is the backend running?'
    loading.value = false
  }
}

// PayFast requires a form POST with the signed parameters from our backend
function submitToPayfast(url, params) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  Object.keys(params).forEach((key) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = params[key]
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}
</script>

<style scoped>
.payment-page { min-height: 100vh; padding: 3rem 1rem; background: #f4f6f5; }
.payment-wrap { max-width: 900px; margin: 0 auto; }
.section-heading { text-align: center; margin-bottom: 1.5rem; }
.section-heading h1 { margin: 0 0 .4rem; font-size: 2rem; color: #12332d; }
.section-heading p { margin: 0; color: #6a7a76; }

.steps { display: flex; justify-content: center; gap: .5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.step { padding: .3rem .9rem; border-radius: 20px; font-size: .8rem; font-weight: 700; color: #6a7a76; background: white; border: 1px solid #e0e5e2; }
.step.done { color: #0b2a25; background: #edf5e3; border-color: #7cb342; }
.step.current { color: #0b2a25; background: #7cb342; border-color: #7cb342; }

.card { background: white; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,.05); padding: 1.75rem; margin-bottom: 1.5rem; }
.card h3 { margin: 0 0 1.2rem; color: #12332d; }

.input-group { display: grid; gap: .4rem; margin-bottom: 1rem; }
.input-group label { font-size: .88rem; font-weight: 600; color: #12332d; }
.select { padding: .8rem 1rem; background: #f4f8f5; border: 1px solid #e0e5e2; border-radius: 8px; font-size: 1rem; color: #12332d; }
.select:focus { outline: 2px solid #7cb342; outline-offset: 2px; }

.summary .row { display: flex; justify-content: space-between; padding: .75rem 0; border-bottom: 1px solid #f0f0f0; color: #2e3d39; }
.summary .row span:last-child { font-weight: 700; color: #12332d; }

.methods { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.method { padding: .8rem 1.5rem; background: #f4f8f5; border: 1px solid #e0e5e2; border-radius: 8px; font-weight: 600; color: #12332d; cursor: pointer; }
.method.active { background: #edf5e3; border: 2px solid #7cb342; }
.method input { margin-right: .5rem; accent-color: #7cb342; }

.note { margin: 0 0 1.5rem; color: #6a7a76; font-size: .9rem; }
.error-text { margin: 0 0 1rem; color: #d32f2f; font-size: .9rem; }

.submit-btn { width: 100%; padding: 1rem; color: #0b2a25; background: #7cb342; border: 0; border-radius: 8px; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: all .3s ease; }
.submit-btn:hover { background: #8bc34a; transform: translateY(-2px); }
.submit-btn:disabled { opacity: .6; cursor: wait; transform: none; }
.secure { margin: 1rem 0 0; text-align: center; color: #6a7a76; font-size: .85rem; }

@media (max-width: 600px) {
  .section-heading h1 { font-size: 1.6rem; }
  .methods { flex-direction: column; }
  .method { text-align: center; }
}
</style>