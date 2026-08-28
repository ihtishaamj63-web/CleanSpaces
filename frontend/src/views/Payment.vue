<template>
  <div class="container">
    <h1>Complete Your Subscription</h1>
    <p class="muted">Choose your zone and pay your monthly contribution.</p>

    <div class="card">
      <h3>Order Summary</h3>

      <label class="label" for="zone">Your Zone</label>
      <select id="zone" v-model="selectedZoneId" class="input">
        <option v-for="z in zones" :key="z.id" :value="z.id">
          {{ z.name }} — {{ z.neighborhood }} ({{ z.households }} households)
        </option>
      </select>

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
          <input type="radio" value="card" v-model="method" /> Card
        </label>
        <label class="method" :class="{ active: method === 'eft' }">
          <input type="radio" value="eft" v-model="method" /> EFT
        </label>
      </div>
      <p class="muted">You will complete the payment on PayFast's secure page. Card details are never entered on our site.</p>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn" :disabled="loading || !selectedZoneId" @click="pay">
        {{ loading ? 'Processing…' : 'Proceed to Secure Payment' }}
      </button>
      <p class="muted">🔒 Payments processed securely by PayFast (PCI DSS Level 1 certified)</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const zones = ref([])
const selectedZoneId = ref(null)
const method = ref('card')
const loading = ref(false)
const error = ref('')

const planInfoMap = {
  small: { label: 'Small Zone', range: 'R3,500 – R4,500' },
  medium: { label: 'Medium Zone', range: 'R6,500 – R8,000' },
  large: { label: 'Large Zone', range: 'R10,000 – R13,000' }
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
    const res = await api.get('/zones')
    zones.value = res.data.filter(z => z.status === 'active')
  } catch {
    // Backend not running yet — sample data so the page can be built and styled
    zones.value = [
      { id: 1, name: 'Petunia Street', neighborhood: 'Manenberg', households: 65, plan_type: 'small', status: 'active' },
      { id: 2, name: 'Mimosa Blocks A–C', neighborhood: "Mitchell's Plain", households: 180, plan_type: 'medium', status: 'active' },
      { id: 3, name: 'Ilitha Park Section 4', neighborhood: 'Khayelitsha', households: 320, plan_type: 'large', status: 'active' }
    ]
  }
  selectedZoneId.value = zones.value[0]?.id ?? null
})

async function pay() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/payments/create', {
      zone_id: selectedZoneId.value,
      method: method.value
    })
    if (res.data.bypass) {
      // DEV_BYPASS=true — backend completed the payment without the gateway
      router.push(`/payment/success/${res.data.payment.id}`)
    } else {
      submitToPayfast(res.data.url, res.data.params)
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
.methods { display: flex; gap: 12px; margin-bottom: 16px; }
.method {
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: bold;
}
.method.active { border-color: var(--green); background: var(--green-light); }
.summary .row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
</style>