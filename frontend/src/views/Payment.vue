<template>
  <div class="payment-page" ref="payEl">
    <section v-if="checking" class="wrap">
      <div class="panel state-panel">
        <div class="spinner"></div>
        <p class="soft">Checking your payment status…</p>
      </div>
    </section>

    <section v-else-if="alreadyPaid" class="wrap">
      <div class="panel state-panel">
        <div class="check">✓</div>
        <h3>You've Paid This Month</h3>
        <p class="soft">
          Your contribution to {{ paidZoneName }} has been received.<br />
          Next payment due {{ nextDue }}.
        </p>
        <router-link to="/resident/dashboard" class="cta">
          Go to My Dashboard →
        </router-link>
      </div>
    </section>

    <template v-else>
      <section class="wrap">
        <header class="page-head">
          <p class="eyebrow">Payment</p>
          <h1>Complete Your Subscription</h1>
          <p class="page-sub">Choose your zone and pay your monthly contribution.</p>
        </header>

        <div class="steps">
          <div class="step done">
            <span class="node done">✓</span>
            <span>Review</span>
          </div>
          <span class="connector done"></span>
          <div class="step current">
            <span class="node current">2</span>
            <span>Payment</span>
          </div>
          <span class="connector"></span>
          <div class="step">
            <span class="node">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div class="payment-layout">
          <div class="form-column">
            <div class="panel">
              <h2 class="panel-title">Your Zone</h2>
              <div class="field">
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

            <div class="panel">
              <h2 class="panel-title">Payment Method</h2>

              <div class="method-list">
                <label class="method-option" :class="{ active: method === 'card' }">
                  <input type="radio" value="card" v-model="method" />
                  <div class="method-body">
                    <span class="method-name">Debit / Credit Card</span>
                    <span class="method-sub">Visa, Mastercard — processed by PayFast</span>
                  </div>
                  <div class="method-badges">
                    <span class="badge-card visa">VISA</span>
                    <span class="badge-card mc">MC</span>
                  </div>
                </label>

                <label class="method-option" :class="{ active: method === 'eft' }">
                  <input type="radio" value="eft" v-model="method" />
                  <div class="method-body">
                    <span class="method-name">Instant EFT</span>
                    <span class="method-sub">Pay directly from your bank account — no card needed</span>
                  </div>
                  <div class="method-badges">
                    <span class="badge-bank">BANK</span>
                  </div>
                </label>
              </div>

              <div v-if="method === 'card'" class="gateway-info">
                <p>
                  After clicking pay, you'll be redirected to PayFast's secure page to enter your
                  card details. Card information never touches CleanSpaces' servers.
                </p>
              </div>

              <div v-if="method === 'eft'" class="gateway-info">
                <p>
                  You'll be redirected to your bank's secure login to approve the payment.
                  Supported: FNB, Standard Bank, ABSA, Nedbank, Capitec.
                </p>
              </div>

              <p v-if="error" class="error-text">{{ error }}</p>

              <button class="submit-btn" type="button" :disabled="loading || !selectedZoneId" @click="pay">
                {{ loading ? 'Processing…' : `Pay R${perHousehold} Securely` }}
              </button>

              <p class="mandate">
                By paying, you authorise CleanSpaces to bill R{{ perHousehold }} monthly for your
                zone subscription. Cancel anytime from your dashboard. Prices include VAT.
              </p>
            </div>
          </div>

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
                <p>PCI DSS Level 1 certified · 3D Secure</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()

const checking = ref(true)
const alreadyPaid = ref(false)
const paidZoneName = ref('')
const myZoneName = ref('')

const zones = ref([])
const selectedZoneId = ref(null)
const method = ref('card')
const loading = ref(false)
const error = ref('')

// Safety net if the zones endpoint is unreachable during development.
const fallbackZones = [
  { id: 1, name: 'NY108 Block', neighborhood: 'Manenberg', households: 62, plan_type: 'small', status: 'active', per_household_amount: 65 },
]

const planInfoMap = {
  small: { label: 'Small Zone', range: 'R3,500 – R4,500' },
  medium: { label: 'Medium Zone', range: 'R6,500 – R8,000' },
  large: { label: 'Large Zone', range: 'R10,000 – R13,000' },
}

const selectedZone = computed(() => zones.value.find(z => z.id === selectedZoneId.value) || null)
const planInfo = computed(() => planInfoMap[selectedZone.value?.plan_type] || { label: '—', range: '—' })

// Price comes from the backend (single source of truth: config/plans.js)
const perHousehold = computed(() => selectedZone.value?.per_household_amount ?? '—')

// First day of next month — when the next subscription payment is due.
const nextDue = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
})

onMounted(async () => {
  // Already paid this month? Skip straight to the confirmation state.
  try {
    const dash = await api.get('/resident/dashboard')
    if (dash.data.hasZone && dash.data.zone.myStatus === 'paid') {
      alreadyPaid.value = true
      paidZoneName.value = dash.data.zone.name
      checking.value = false
      return
    }
    if (dash.data.hasZone) {
      myZoneName.value = dash.data.zone.name
    }
  } catch {
    // Dashboard unreachable — allow the payment attempt
  }

  // /zones is admin-only; the public map endpoint lists every zone.
  try {
    const res = await api.get('/zones/map')
    const active = (Array.isArray(res.data) ? res.data : []).filter(z => z.status === 'active')
    if (active.length === 0) throw new Error('no active zones')
    zones.value = active
  } catch {
    zones.value = fallbackZones
  }

  // Preselect the resident's own zone if it's in the list
  const mine = zones.value.find(z => z.name === myZoneName.value)
  selectedZoneId.value = (mine || zones.value[0])?.id ?? null
  checking.value = false
})

async function pay() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.post('/payments/create', {
      zone_id: selectedZoneId.value,
      method: method.value
    })
    if (res.data.bypass) {
      // DEV_BYPASS — payment completed instantly, no gateway involved
      router.push(`/payment/success/${res.data.payment.id}`)
    } else {
      submitToPayfast(res.data.url, res.data.params)
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not start the payment. Is the backend running?'
    loading.value = false
  }
}

// Build a hidden form and POST it to PayFast — card details are entered
// on PayFast's own PCI-compliant page, never here.
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
.payment-page {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1rem 5rem;
  background: #f7faf8;
  color: #183b28;
}

.wrap { max-width: 1000px; margin: 0 auto; }

.page-head { margin-bottom: 1.75rem; }
.eyebrow {
  margin: 0 0 0.7rem;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.page-head h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -2px;
  color: #173b27;
}
.page-sub {
  margin: 0;
  color: #718077;
  font-size: 1.05rem;
}

/* STEPS */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2.25rem;
  flex-wrap: wrap;
}
.step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #8a978f;
}
.node {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  background: #fff;
  border: 2px solid #e0e8e2;
  color: #8a978f;
  flex-shrink: 0;
}
.step.done { color: #198044; }
.step.done .node {
  border-color: #198044;
  color: #198044;
  background: #e9f7ed;
}
.step.current { color: #173b27; }
.step.current .node {
  background: #176b3a;
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 0 0 4px rgba(23, 107, 58, 0.15);
}
.connector {
  display: block;
  width: 48px; height: 2px;
  background: #e0e8e2;
}
.connector.done { background: #bfe3cc; }

/* LAYOUT */
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.75rem;
  align-items: start;
}
.form-column { min-width: 0; }

/* PANELS */
.panel {
  background: #ffffff;
  border: 1px solid #e4eee7;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 22px rgba(31, 89, 54, 0.05);
}

.panel-title {
  margin: 0 0 1.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #198044;
}

/* FIELDS */
.field { display: grid; gap: 0.45rem; margin-bottom: 1rem; }
.field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #294635;
}
.field input,
.select {
  padding: 0.9rem 1.1rem;
  background: #fbfdfc;
  border: 1.5px solid #dce7df;
  border-radius: 10px;
  font-size: 1rem;
  color: #294635;
  width: 100%;
  transition: border-color 0.25s, box-shadow 0.25s;
  box-sizing: border-box;
}
.select { cursor: pointer; }
.field input:focus,
.select:focus {
  border-color: #198044;
  box-shadow: 0 0 0 4px rgba(25, 128, 68, 0.08);
  outline: none;
}
.select option { background: #ffffff; color: #294635; }

.zone-quick {
  border-top: 1px dashed #dce7df;
  padding-top: 0.9rem;
  margin-top: 0.5rem;
}
.zone-quick .row {
  display: flex; justify-content: space-between;
  padding: 0.4rem 0; font-size: 0.92rem; color: #66736b;
}
.zone-quick .row span:last-child { font-weight: 700; color: #173b27; }

/* METHOD OPTIONS */
.method-list { display: grid; gap: 0.75rem; margin-bottom: 1.25rem; }
.method-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fbfdfc;
  border: 1.5px solid #dce7df;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.method-option:hover { border-color: #62b987; }
.method-option.active {
  border-color: #198044;
  background: #e9f7ed;
  box-shadow: 0 0 0 4px rgba(25, 128, 68, 0.08);
}
.method-option input { display: none; }
.method-body { display: grid; gap: 0.15rem; flex: 1; min-width: 0; }
.method-name { font-weight: 700; font-size: 0.98rem; color: #173b27; }
.method-sub { font-size: 0.82rem; color: #718077; }
.method-badges { display: flex; gap: 0.4rem; flex-shrink: 0; }
.badge-card {
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: white;
}
.badge-card.visa { background: #1a1f71; }
.badge-card.mc { background: #eb001b; }
.badge-bank {
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  color: white;
  background: #176b3a;
}

/* GATEWAY INFO (card + EFT notes) */
.gateway-info {
  padding: 1.25rem;
  background: #f6faf7;
  border: 1px solid #dce7df;
  border-radius: 14px;
  margin-bottom: 1.25rem;
}
.gateway-info p { margin: 0; font-size: 0.88rem; color: #66736b; line-height: 1.6; }

.error-text { margin: 0 0 1rem; color: #a33d3d; font-size: 0.9rem; font-weight: 600; }

.submit-btn {
  width: 100%; padding: 1.05rem;
  color: #ffffff;
  background: #176b3a;
  border: 0; border-radius: 12px;
  font-weight: 800; font-size: 1.08rem;
  cursor: pointer;
  box-shadow: 0 6px 26px rgba(23, 107, 58, 0.25);
  transition: all 0.25s ease;
}
.submit-btn:hover { transform: translateY(-2px); background: #1e6040; box-shadow: 0 10px 32px rgba(23, 107, 58, 0.3); }
.submit-btn:disabled { opacity: 0.6; cursor: wait; transform: none; }

.mandate {
  margin: 1.1rem 0 0;
  font-size: 0.78rem;
  color: #8a978f;
  line-height: 1.55;
  text-align: center;
}

/* SUMMARY PANEL */
.summary-panel {
  background: #ffffff;
  border: 1px solid #e4eee7;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  color: #183b28;
  position: sticky;
  top: 100px;
  box-shadow: 0 20px 50px rgba(31, 89, 54, 0.1);
  overflow: hidden;
  border-left: 3px solid #198044;
}
.panel-label {
  margin: 0 0 0.3rem;
  font-size: 0.78rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #198044;
}
.panel-amount {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #173b27;
}
.panel-amount .currency { font-size: 1.5rem; font-weight: 700; margin-right: 0.1rem; }
.panel-amount .period { font-size: 0.95rem; font-weight: 500; color: #718077; letter-spacing: 0; }
.panel-zone { margin: 0.8rem 0 0; color: #66736b; font-size: 0.92rem; }
.panel-context { margin: 0.3rem 0 0; color: #8a978f; font-size: 0.85rem; }

.panel-divider {
  height: 1px; margin: 1.4rem 0;
  background: #e6eee8;
}

.activation-row {
  height: 6px; border-radius: 999px;
  background: #e6eee8;
  overflow: hidden;
  margin: 0.5rem 0;
}
.activation-fill {
  height: 100%; width: 60%;
  border-radius: 999px;
  background: linear-gradient(90deg, #198044, #3b9b68);
}
.panel-activation { margin: 0; font-size: 0.84rem; color: #66736b; }

.panel-includes { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.65rem; }
.panel-includes li { font-size: 0.92rem; color: #294635; }

.panel-trust strong { display: block; font-size: 0.95rem; color: #173b27; }
.panel-trust p { margin: 0; font-size: 0.8rem; color: #8a978f; }

.panel-badge {
  margin-top: 1.4rem;
  padding: 0.8rem 1rem;
  background: #e9f7ed;
  border: 1px solid #bfe3cc;
  border-radius: 10px;
  font-size: 0.85rem;
  text-align: center;
  color: #24633a;
}

/* STATES */
.state-panel { text-align: center; padding: 3.5rem 1.5rem; }
.state-panel h3 { margin: 0 0 0.5rem; font-size: 1.35rem; color: #173b27; }
.state-panel p { margin: 0 0 1.75rem; }
.soft { color: #66736b; }
.check {
  width: 72px; height: 72px; line-height: 72px; border-radius: 50%;
  background: #176b3a;
  color: #ffffff; font-size: 36px; font-weight: 800;
  margin: 0 auto 1.25rem;
  box-shadow: 0 8px 24px rgba(23, 107, 58, 0.25);
}
.cta {
  display: inline-block;
  padding: 0.95rem 2.3rem;
  border-radius: 999px;
  background: #176b3a;
  color: #ffffff;
  font-weight: 700; font-size: 1.02rem;
  text-decoration: none;
  box-shadow: 0 6px 26px rgba(23, 107, 58, 0.25);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.cta:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(23, 107, 58, 0.3); }
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1.25rem;
  border: 4px solid #dcebe0;
  border-top-color: #198044;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .payment-layout { grid-template-columns: 1fr; }
  .summary-panel { position: static; order: -1; border-left: 0; }
}
@media (max-width: 600px) {
  .steps { gap: 0.5rem; }
  .connector { width: 24px; }
  .method-badges { display: none; }
  .panel { padding: 1.5rem 1.25rem; }
}
</style>