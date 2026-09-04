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
          Next payment due 1 October 2026.
        </p>
        <router-link to="/resident/dashboard" class="cta">
          Go to My Dashboard →
        </router-link>
      </div>
    </section>

    <template v-else>
      <section class="wrap">
        <header class="page-head">
          <p class="eyebrow"><span class="tick"></span>Payment</p>
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
              <h2 class="panel-title"><span class="tick"></span>Your Zone</h2>
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
              <h2 class="panel-title"><span class="tick"></span>Payment Method</h2>

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

              <div v-if="method === 'card'" class="card-form">
                <div class="field">
                  <label for="cardname">Name on card</label>
                  <input
                    id="cardname"
                    v-model="card.name"
                    type="text"
                    placeholder="T. Mbeki"
                    autocomplete="cc-name"
                  />
                </div>
                <div class="field">
                  <label for="cardnumber">Card number</label>
                  <input
                    id="cardnumber"
                    v-model="card.number"
                    type="text"
                    inputmode="numeric"
                    placeholder="4242 4242 4242 4242"
                    autocomplete="cc-number"
                    maxlength="19"
                    :class="{ invalid: cardErrors.number }"
                    @input="formatCardNumber"
                  />
                  <p v-if="cardErrors.number" class="field-error">{{ cardErrors.number }}</p>
                </div>
                <div class="card-row">
                  <div class="field">
                    <label for="cardexp">Expiry (MM/YY)</label>
                    <input
                      id="cardexp"
                      v-model="card.expiry"
                      type="text"
                      inputmode="numeric"
                      placeholder="09/28"
                      autocomplete="cc-exp"
                      maxlength="5"
                      :class="{ invalid: cardErrors.expiry }"
                      @input="formatExpiry"
                    />
                    <p v-if="cardErrors.expiry" class="field-error">{{ cardErrors.expiry }}</p>
                  </div>
                  <div class="field">
                    <label for="cardcvv">CVV</label>
                    <input
                      id="cardcvv"
                      v-model="card.cvv"
                      type="password"
                      inputmode="numeric"
                      placeholder="•••"
                      autocomplete="cc-csc"
                      maxlength="3"
                      :class="{ invalid: cardErrors.cvv }"
                    />
                    <p v-if="cardErrors.cvv" class="field-error">{{ cardErrors.cvv }}</p>
                  </div>
                </div>
                <p class="card-note">
                  Card details are never stored on CleanSpaces — payment is completed
                  on PayFast's PCI DSS Level 1 certified page.
                </p>
              </div>

              <div v-if="method === 'eft'" class="eft-info">
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
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
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

const card = reactive({ name: '', number: '', expiry: '', cvv: '' })
const cardErrors = reactive({ number: '', expiry: '', cvv: '' })

const payEl = ref(null)
let pointerMove = null

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
  const base = { small: 4000, medium: 7250, large: 11500 }[selectedZone.value.plan_type] || 0
  return Math.round(base / selectedZone.value.households)
})

function formatCardNumber() {
  const digits = card.number.replace(/\D/g, '').slice(0, 16)
  card.number = digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const digits = card.expiry.replace(/\D/g, '').slice(0, 4)
  card.expiry = digits.length >= 3
    ? digits.slice(0, 2) + '/' + digits.slice(2)
    : digits
}

function validateCard() {
  cardErrors.number = ''
  cardErrors.expiry = ''
  cardErrors.cvv = ''

  const digits = card.number.replace(/\D/g, '')
  if (digits.length !== 16) {
    cardErrors.number = 'Enter a valid 16-digit card number'
  }

  const m = card.expiry.match(/^(\d{2})\/(\d{2})$/)
  if (!m) {
    cardErrors.expiry = 'Use MM/YY format'
  } else {
    const month = parseInt(m[1], 10)
    const year = 2000 + parseInt(m[2], 10)
    const now = new Date()
    if (month < 1 || month > 12) {
      cardErrors.expiry = 'Invalid month'
    } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      cardErrors.expiry = 'Card has expired'
    }
  }

  if (!/^\d{3}$/.test(card.cvv)) {
    cardErrors.cvv = '3 digits'
  }

  return !cardErrors.number && !cardErrors.expiry && !cardErrors.cvv
}

/* CLEAN-REVEAL SPOTLIGHT */
function onPointerMove(e) {
  const el = payEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', (e.clientX - rect.left) + 'px')
  el.style.setProperty('--my', (e.clientY - rect.top) + 'px')
}

onMounted(async () => {
  pointerMove = (e) => onPointerMove(e)
  window.addEventListener('pointermove', pointerMove, { passive: true })

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

  try {
    const res = await api.get('/zones')
    const active = (Array.isArray(res.data) ? res.data : []).filter(z => z.status === 'active')
    if (active.length === 0) throw new Error('no active zones')
    zones.value = active
  } catch {
    zones.value = fallbackZones
  }

  const mine = zones.value.find(z => z.name === myZoneName.value)
  selectedZoneId.value = (mine || zones.value[0])?.id ?? null
  checking.value = false
})

onUnmounted(() => {
  if (pointerMove) window.removeEventListener('pointermove', pointerMove)
})

async function pay() {
  if (method.value === 'card' && !validateCard()) {
    error.value = 'Please check your card details.'
    return
  }
  error.value = ''
  loading.value = true
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
.payment-page {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1rem 5rem;
  background: #0b2a25;
  color: #f4f6f5;
  overflow-x: clip;
}

.wrap { max-width: 1000px; margin: 0 auto; }

.page-head { margin-bottom: 1.75rem; }
.eyebrow {
  margin: 0 0 .7rem;
  display: flex;
  align-items: center;
  gap: .7rem;
  font-family: 'Sora', sans-serif;
  font-size: .78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .22em;
  color: #9ccc65;
}
.tick {
  display: inline-block;
  width: 26px; height: 14px;
  position: relative;
  flex-shrink: 0;
}
.tick::before {
  content: '';
  position: absolute;
  left: 0; right: 14px; top: 6px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #7cb342);
}
.tick::after {
  content: '';
  position: absolute;
  right: 0; top: 0;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #0b2a25;
  border: 3px solid #7cb342;
}
.page-head h1 {
  margin: 0 0 .5rem;
  font-family: 'Sora', sans-serif;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
}
.page-sub {
  margin: 0;
  color: #c3d0cb;
  font-size: 1.05rem;
}

/* STEPS */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  margin-bottom: 2.25rem;
  flex-wrap: wrap;
}
.step {
  display: flex;
  align-items: center;
  gap: .6rem;
  font-family: 'Sora', sans-serif;
  font-size: .85rem;
  font-weight: 700;
  color: #6a7a76;
}
.node {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: .8rem;
  font-weight: 800;
  background: #0e2420;
  border: 2px solid #2a4a43;
  color: #6a7a76;
  flex-shrink: 0;
}
.step.done { color: #9ccc65; }
.step.done .node {
  border-color: #7cb342;
  color: #9ccc65;
  background: rgba(124, 179, 66, 0.1);
}
.step.current { color: #f4f6f5; }
.step.current .node {
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  border-color: transparent;
  box-shadow: 0 0 16px rgba(124, 179, 66, 0.5);
}
.connector {
  display: block;
  width: 48px; height: 2px;
  background: #2a4a43;
}
.connector.done {
  background: linear-gradient(90deg, #7cb342, #2a4a43);
}

/* LAYOUT */
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.75rem;
  align-items: start;
  animation: sweepIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.form-column { min-width: 0; }

/* PANELS + SPOTLIGHT */
.panel {
  background: #0e2420;
  border: 1px solid #1d3b35;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  animation: sweepIn .5s cubic-bezier(.22, 1, .36, 1) both;
}
.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    280px circle at var(--mx, -500px) var(--my, -500px),
    rgba(124, 179, 66, 0.07),
    transparent 65%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.panel:hover::before { opacity: 1; }

.panel-title {
  margin: 0 0 1.4rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .12em;
  color: #9ccc65;
  display: flex;
  align-items: center;
  gap: .7rem;
}

/* FIELDS */
.field { display: grid; gap: .45rem; margin-bottom: 1rem; }
.field label {
  font-size: .85rem; font-weight: 600;
  color: #ffffff;
  font-family: 'Sora', sans-serif;
}
.field input,
.select {
  padding: .9rem 1.1rem;
  background: #0b2a25;
  border: 1.5px solid #2a4a43;
  border-radius: 10px;
  font-size: 1rem;
  color: #f4f6f5;
  width: 100%;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.field input::placeholder { color: #6a7a76; }
.select { cursor: pointer; }
.field input:focus,
.select:focus {
  border-color: #7cb342;
  box-shadow: 0 0 0 4px rgba(124, 179, 66, 0.15);
  outline: none;
}
.field input.invalid { border-color: #ff8a80; }
.field-error {
  margin: 0;
  color: #ff8a80;
  font-size: .78rem;
  font-weight: 600;
}
.select option { background: #0e2420; color: #f4f6f5; }

.zone-quick {
  border-top: 1px dashed #2a4a43;
  padding-top: .9rem;
  margin-top: .5rem;
}
.zone-quick .row {
  display: flex; justify-content: space-between;
  padding: .4rem 0; font-size: .92rem; color: #c3d0cb;
}
.zone-quick .row span:last-child { font-weight: 700; color: #ffffff; }

/* METHOD OPTIONS */
.method-list { display: grid; gap: .75rem; margin-bottom: 1.25rem; }
.method-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #0b2a25;
  border: 1.5px solid #2a4a43;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.method-option:hover { border-color: #7cb342; }
.method-option.active {
  border-color: #7cb342;
  background: rgba(124, 179, 66, 0.08);
  box-shadow: 0 0 0 4px rgba(124, 179, 66, 0.12);
}
.method-option input { display: none; }
.method-body { display: grid; gap: .15rem; flex: 1; min-width: 0; }
.method-name {
  font-weight: 700;
  font-size: .98rem;
  color: #ffffff;
}
.method-sub {
  font-size: .82rem;
  color: #c3d0cb;
}
.method-badges { display: flex; gap: .4rem; flex-shrink: 0; }
.badge-card {
  padding: .25rem .55rem;
  border-radius: 6px;
  font-size: .68rem;
  font-weight: 800;
  font-family: 'Sora', sans-serif;
  letter-spacing: .03em;
  color: white;
}
.badge-card.visa { background: #1a1f71; }
.badge-card.mc { background: #eb001b; }
.badge-bank {
  padding: .25rem .55rem;
  border-radius: 6px;
  font-size: .68rem;
  font-weight: 800;
  font-family: 'Sora', sans-serif;
  color: white;
  background: #2a4a43;
}

/* CARD FORM */
.card-form {
  padding: 1.25rem;
  background: #0b2a25;
  border: 1px solid #2a4a43;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  animation: sweepIn 0.3s ease both;
}
.card-form .field { margin-bottom: 1rem; }
.card-form .field input { background: #0e2420; }
.card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.card-row .field { margin-bottom: 0; }
.card-note {
  margin: 1rem 0 0;
  font-size: .78rem;
  color: #c3d0cb;
  line-height: 1.5;
}

/* EFT INFO */
.eft-info {
  padding: 1.25rem;
  background: #0b2a25;
  border: 1px solid #2a4a43;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  animation: sweepIn 0.3s ease both;
}
.eft-info p { margin: 0; font-size: .88rem; color: #c3d0cb; line-height: 1.6; }

.error-text { margin: 0 0 1rem; color: #ff8a80; font-size: .9rem; font-weight: 600; }

.submit-btn {
  width: 100%; padding: 1.05rem;
  color: #0b2a25;
  background: linear-gradient(135deg, #7cb342 0%, #689f38 100%);
  border: 0; border-radius: 12px;
  font-weight: 800; font-size: 1.08rem;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 26px rgba(124, 179, 66, 0.4);
  transition: all 0.25s ease;
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124, 179, 66, 0.55); }
.submit-btn:disabled { opacity: .6; cursor: wait; transform: none; }

.mandate {
  margin: 1.1rem 0 0;
  font-size: .78rem;
  color: #c3d0cb;
  line-height: 1.55;
  text-align: center;
}

/* SUMMARY PANEL */
.summary-panel {
  background: linear-gradient(165deg, #12332d 0%, #0b2a25 70%, #0e2420 100%);
  border: 1px solid #1d3b35;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  color: #f4f6f5;
  position: sticky;
  top: 100px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
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
  font-family: 'Sora', sans-serif;
}
.panel-amount {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #ffffff;
}
.panel-amount .currency { font-size: 1.5rem; font-weight: 700; margin-right: .1rem; }
.panel-amount .period { font-size: .95rem; font-weight: 500; color: #c3d0cb; letter-spacing: 0; }
.panel-zone { margin: .8rem 0 0; color: #c3d0cb; font-size: .92rem; }
.panel-context { margin: .3rem 0 0; color: #c3d0cb; font-size: .85rem; }

.panel-divider {
  height: 1px; margin: 1.4rem 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.15), transparent);
}

.activation-row {
  height: 6px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin: .5rem 0;
}
.activation-fill {
  height: 100%; width: 60%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7cb342, #9ccc65);
  box-shadow: 0 0 10px rgba(124, 179, 66, 0.5);
}
.panel-activation { margin: 0; font-size: .84rem; color: #c3d0cb; }

.panel-includes { list-style: none; margin: 0; padding: 0; display: grid; gap: .65rem; }
.panel-includes li { font-size: .92rem; color: #d7e4de; }

.panel-trust strong { display: block; font-size: .95rem; font-family: 'Sora', sans-serif; color: #ffffff; }
.panel-trust p { margin: 0; font-size: .8rem; color: #c3d0cb; }

.panel-badge {
  margin-top: 1.4rem;
  padding: .8rem 1rem;
  background: rgba(124, 179, 66, 0.15);
  border: 1px solid rgba(124, 179, 66, 0.3);
  border-radius: 10px;
  font-size: .85rem;
  text-align: center;
  color: #d7e4de;
}

/* STATES */
.state-panel { text-align: center; padding: 3.5rem 1.5rem; }
.state-panel h3 { margin: 0 0 .5rem; font-size: 1.35rem; color: #ffffff; }
.state-panel p { margin: 0 0 1.75rem; }
.soft { color: #c3d0cb; }
.check {
  width: 72px; height: 72px; line-height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25; font-size: 36px; font-weight: 800;
  margin: 0 auto 1.25rem;
  box-shadow: 0 8px 24px rgba(124, 179, 66, 0.45);
  animation: pop 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.cta {
  display: inline-block;
  padding: .95rem 2.3rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  font-family: 'Sora', sans-serif;
  font-weight: 700; font-size: 1.02rem;
  text-decoration: none;
  box-shadow: 0 6px 26px rgba(124, 179, 66, 0.4);
  transition: transform .25s ease, box-shadow .25s ease;
}
.cta:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(124, 179, 66, 0.55); }
.spinner {
  width: 42px; height: 42px; margin: 0 auto 1.25rem;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #9ccc65;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes sweepIn {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0 round 20px);
  }
  60% { opacity: 1; }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0 round 20px);
  }
}

@media (max-width: 900px) {
  .payment-layout { grid-template-columns: 1fr; }
  .summary-panel { position: static; order: -1; border-left: 0; }
}
@media (max-width: 600px) {
  .steps { gap: .5rem; }
  .connector { width: 24px; }
  .card-row { grid-template-columns: 1fr; }
  .method-badges { display: none; }
  .panel { padding: 1.5rem 1.25rem; }
}

@media (prefers-reduced-motion: reduce) {
  .payment-layout, .panel, .card-form, .eft-info, .check {
    animation: none !important;
  }
  .panel::before { display: none; }
}
</style>