<template>
  <div class="payment-page">
    <section v-if="checking" class="payment-wrap">
      <div class="card state-card">
        <div class="spinner"></div>
        <p class="muted-text">Checking your payment status…</p>
      </div>
    </section>

    <section v-else-if="alreadyPaid" class="payment-wrap">
      <div class="card state-card">
        <div class="check">✓</div>
        <h3>You've Paid This Month</h3>
        <p class="muted-text">
          Your contribution to {{ paidZoneName }} has been received.<br />
          Next payment: 1 October 2026.
        </p>
        <router-link to="/resident/dashboard" class="btn-primary">
          Go to My Dashboard →
        </router-link>
      </div>
    </section>

    <template v-else>
      <section class="payment-wrap">
        <div class="section-heading">
          <h1>Complete Your Subscription</h1>
          <p>Choose your zone and pay your monthly contribution.</p>
        </div>

        <div class="steps">
          <span class="step done">✓ 1. Review</span>
          <span class="step current">2. Payment</span>
          <span class="step">3. Confirmation</span>
        </div>

        <div class="payment-layout">
          <!-- FORM COLUMN -->
          <div class="form-column">
            <div class="card">
              <h3>Your Zone</h3>
              <div class="input-group">
                <label for="zone">Select your zone</label>
                <select id="zone" v-model="selectedZoneId" class="select">
                  <option v-for="z in zones" :key="z.id" :value="z.id">
                    {{ z.name }} — {{ z.neighborhood }} ({{ z.households }} households)
                  </option>
                </select>
              </div>
              <div v-if="selectedZone" class="zone-quick">
                <div class="row"><span>Plan</span><span>{{ planInfo.label }}</span></div>
                <div class="row"><span>Zone total</span><span>{{ planInfo.range }}/month</span></div>
              </div>
            </div>

            <div class="card">
              <h3>Payment Method</h3>
              <div class="methods">
                <label class="method" :class="{ active: method === 'card' }">
                  <input type="radio" value="card" v-model="method" />
                  <span>Card</span>
                </label>
                <label class="method" :class="{ active: method === 'eft' }">
                  <input type="radio" value="eft" v-model="method" />
                  <span>EFT</span>
                </label>
              </div>
              <p class="note">
                You'll complete payment on PayFast's secure page.
                Card details are never entered on our site.
              </p>

              <p v-if="error" class="error-text">{{ error }}</p>

              <button class="submit-btn" type="button" :disabled="loading || !selectedZoneId" @click="pay">
                {{ loading ? 'Processing…' : `Pay R${perHousehold} Securely` }}
              </button>
              <p class="secure">Payments processed securely by PayFast — PCI DSS Level 1 certified</p>
            </div>
          </div>

          <!-- SUMMARY PANEL -->
          <aside class="summary-panel">
            <p class="panel-label">Your Contribution</p>
            <div class="panel-amount">
              <span class="currency">R</span>{{ perHousehold }}
              <span class="period">/ month</span>
            </div>
            <p class="panel-zone" v-if="selectedZone">
              {{ selectedZone.name }} · {{ planInfo.label }}
            </p>
            <p class="panel-context" v-if="selectedZone">
              Your share of a {{ planInfo.range }} zone, pooled with
              {{ selectedZone.households }} households.
            </p>

            <div class="panel-divider"></div>

            <p class="panel-label">How activation works</p>
            <div class="activation-row">
              <div class="activation-fill"></div>
            </div>
            <p class="panel-activation">
              Once 60% of households have paid, weekly cleanups begin.
            </p>

            <div class="panel-divider"></div>

            <ul class="panel-includes">
              <li>✓ Weekly scheduled cleanup</li>
              <li>✓ Hazardous waste disposal</li>
              <li>✓ Photo proof of every cleanup</li>
              <li>✓ Community progress dashboard</li>
            </ul>

            <div class="panel-divider"></div>

            <div class="panel-trust">
              <div>
                <strong>Secured by PayFast</strong>
                <p>PCI DSS Level 1 certified</p>
              </div>
            </div>

            <div class="panel-badge">
              Pooled with {{ selectedZone?.households ?? '—' }} households in your zone
            </div>
          </aside>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()

const checking = ref(true)
const alreadyPaid = ref(false)
const paidZoneName = ref('')

const zones = ref([])
const selectedZoneId = ref(null)
const myZoneId = ref(null)
const method = ref('card')
const loading = ref(false)
const error = ref('')

const fallbackZones = [
  { id: 1, name: 'NY108 Block', neighborhood: 'Manenberg', households: 62, plan_type: 'small', status: 'active' },
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
  const base = { small: 4000, medium: 7250, large: 11550 }[selectedZone.value.plan_type] || 0
  return Math.round(base / selectedZone.value.households)
})

onMounted(async () => {
  // Double-payment guard + zone pre-select: check status BEFORE showing the form
  try {
    const dash = await api.get('/resident/dashboard')
    if (dash.data.hasZone && dash.data.zone.myStatus === 'paid') {
      alreadyPaid.value = true
      paidZoneName.value = dash.data.zone.name
      checking.value = false
      return
    }
    // Pre-select the resident's own zone if they have one
    if (dash.data.hasZone) {
      myZoneId.value = dash.data.zone.id ?? null
      // dashboard response doesn't carry zone id — fall back to name matching below
      myZoneName.value = dash.data.zone.name
    }
  } catch {
    // Dashboard unreachable — allow the payment attempt
  }

  try {
    const res = await api.get('/zones')
    const active = (Array.isArray(res.data) ? res.data : []).filter(z => z.status === 'active')
    if (active.length === 0) throw new Error('no active zones')
    zones.value = active
  } catch {
    zones.value = fallbackZones
  }

  // Pre-select their zone by name if possible
  const mine = zones.value.find(z => z.name === myZoneName.value)
  selectedZoneId.value = (mine || zones.value[0])?.id ?? null
  checking.value = false
})

const myZoneName = ref('')

async function pay() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/payments/create', {
      zone_id: selectedZoneId.value,
      method: method.value
    })
    if (res.data.bypass) {
      router.push(`/payment/success/${res.data.payment.id}`)
    } else {
      submitToPayfast(res.data.url, res.data.params)
    }
  } catch {
    error.value = 'Could not start the payment. Is the backend running?'
    loading.value = false
  }
}

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
.payment-page { min-height: 100vh; padding: 3rem 1rem 5rem; }
.payment-wrap { max-width: 1000px; margin: 0 auto; }
.section-heading { margin-bottom: 1.75rem; }
.section-heading h1 { margin: 0 0 .4rem; font-size: 2.2rem; font-weight: 800; }

.state-card { text-align: center; padding: 3.5rem 1.5rem; }
.state-card h3 { margin: 0 0 .5rem; font-size: 1.35rem; }
.state-card p { margin: 0 0 1.75rem; }
.check {
  width: 72px; height: 72px; line-height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--green-deep));
  color: var(--green-deeper); font-size: 36px; font-weight: 800;
  margin: 0 auto 1.25rem;
  box-shadow: var(--shadow-green);
  animation: pop 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1.25rem;
  border: 4px solid var(--green-tint);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }

.steps { display: flex; justify-content: center; gap: .6rem; flex-wrap: wrap; margin-bottom: 2rem; }
.step {
  padding: .4rem 1.1rem; border-radius: 20px;
  font-size: .82rem; font-weight: 700;
  color: var(--text-muted); background: white;
  border: 1px solid var(--border);
}
.step.done { color: var(--green-deep); background: var(--green-tint); border-color: var(--green); }
.step.current {
  color: var(--green-deeper);
  background: linear-gradient(135deg, var(--green), var(--green-deep));
  border-color: transparent;
  box-shadow: var(--shadow-green);
}

.payment-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.75rem;
  align-items: start;
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.form-column { min-width: 0; }

.card h3 { margin: 0 0 1.2rem; font-size: 1.15rem; }

.input-group { display: grid; gap: .45rem; margin-bottom: 1rem; }
.input-group label {
  font-size: .85rem; font-weight: 600; color: var(--green-dark);
  font-family: var(--font-display);
}
.select {
  padding: .9rem 1.1rem;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 1rem; color: var(--text);
  transition: border-color 0.25s, box-shadow 0.25s;
  cursor: pointer;
}
.select:focus { border-color: var(--green); box-shadow: 0 0 0 4px rgba(124, 179, 66, 0.15); outline: none; }

.zone-quick { border-top: 1px dashed var(--border); padding-top: .75rem; }
.zone-quick .row {
  display: flex; justify-content: space-between;
  padding: .4rem 0; font-size: .92rem; color: var(--text);
}
.zone-quick .row span:last-child { font-weight: 700; color: var(--green-dark); }

.methods { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; margin-bottom: 1rem; }
.method {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .95rem 1.2rem;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-weight: 700; color: var(--green-dark);
  cursor: pointer;
  transition: all 0.25s ease;
}
.method:hover { border-color: var(--green); }
.method.active {
  border-color: var(--green);
  background: var(--green-tint);
  box-shadow: 0 0 0 4px rgba(124, 179, 66, 0.12);
}
.method input { display: none; }

.note { margin: 0 0 1.5rem; color: var(--text-muted); font-size: .88rem; }
.error-text { margin: 0 0 1rem; color: #d32f2f; font-size: .9rem; }

.submit-btn {
  width: 100%; padding: 1.05rem;
  color: var(--green-deeper);
  background: linear-gradient(135deg, var(--green) 0%, var(--green-deep) 100%);
  border: 0; border-radius: 12px;
  font-weight: 800; font-size: 1.08rem;
  font-family: var(--font-display);
  cursor: pointer;
  box-shadow: var(--shadow-green);
  transition: all 0.25s ease;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(124, 179, 66, 0.5); }
.submit-btn:disabled { opacity: .6; cursor: wait; transform: none; }
.secure { margin: 1rem 0 0; text-align: center; color: var(--text-muted); font-size: .82rem; }

/* Summary panel */
.summary-panel {
  background: linear-gradient(165deg, #12332d 0%, #0b2a25 70%, #0e2420 100%);
  border-radius: 18px;
  padding: 2rem 1.75rem;
  color: #f4f6f5;
  position: sticky;
  top: 100px;
  box-shadow: 0 20px 50px rgba(11, 42, 37, 0.35);
  overflow: hidden;
  border-left: 3px solid #7cb342;
}
.summary-panel::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(124, 179, 66, 0.25) 0%, transparent 70%);
  border-radius: 50%;
}
.panel-label {
  margin: 0 0 .3rem;
  font-size: .78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: #9ccc65;
  font-family: var(--font-display);
}
.panel-amount {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}
.panel-amount .currency { font-size: 1.5rem; font-weight: 700; margin-right: .1rem; }
.panel-amount .period { font-size: .95rem; font-weight: 500; color: #a0b0ac; letter-spacing: 0; }
.panel-zone { margin: .8rem 0 0; color: #a0b0ac; font-size: .92rem; }
.panel-context { margin: .3rem 0 0; color: #a0b0ac; font-size: .85rem; }

.panel-divider {
  height: 1px; margin: 1.4rem 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.15), transparent);
}

/* Activation mini-bar in panel */
.activation-row {
  height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin: .5rem 0 .5rem;
}
.activation-fill {
  height: 100%; width: 60%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7cb342, #9ccc65);
  box-shadow: 0 0 10px rgba(124, 179, 66, 0.5);
}
.panel-activation { margin: 0; font-size: .84rem; color: #a0b0ac; }

.panel-includes { list-style: none; margin: 0; padding: 0; display: grid; gap: .65rem; }
.panel-includes li { font-size: .92rem; }

.panel-trust strong { display: block; font-size: .95rem; font-family: var(--font-display); }
.panel-trust p { margin: 0; font-size: .8rem; color: #a0b0ac; }

.panel-badge {
  margin-top: 1.4rem;
  padding: .8rem 1rem;
  background: rgba(124, 179, 66, 0.15);
  border: 1px solid rgba(124, 179, 66, 0.3);
  border-radius: 10px;
  font-size: .85rem;
  text-align: center;
}

.muted-text { color: var(--text-muted); }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 900px) {
  .payment-layout { grid-template-columns: 1fr; }
  .summary-panel { position: static; order: -1; border-left: 0; }
}
@media (max-width: 600px) {
  .section-heading h1 { font-size: 1.7rem; }
  .methods { grid-template-columns: 1fr; }
}
</style>