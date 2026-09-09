<template>
  <div class="dashboard-page">

    <!-- HERO — gradient, soap bubbles, and a live activation ring -->
    <section class="dash-hero">
      <div class="hero-content">
        <span class="hero-tag">MY ZONE</span>

        <h1>{{ data.hasZone ? data.zone.name : 'Join a Zone' }}</h1>

        <p>
          {{ data.hasZone
            ? data.zone.neighborhood + ' · ' + data.zone.households + ' households pooling their cleanups'
            : 'Pool with your street. Fund your cleanups. Watch the progress live.' }}
        </p>

        <router-link
          v-if="data.hasZone && data.zone.myStatus !== 'paid'"
          to="/payment"
          class="hero-button"
        >
          Pay R{{ perMonth }} Now <span>→</span>
        </router-link>
        <router-link v-else-if="!data.hasZone" to="/how-it-works" class="hero-button">
          How it works <span>→</span>
        </router-link>
      </div>

      <!-- Cleaning-themed decoration: soap bubbles + live activation ring -->
      <div class="hero-decoration">
        <div class="bubble bubble-one"></div>
        <div class="bubble bubble-two"></div>
        <div class="bubble bubble-three"></div>
        <div class="bubble bubble-four"></div>

        <div class="progress-ring">
          <svg viewBox="0 0 260 260" aria-hidden="true">
            <circle class="ring-track" cx="130" cy="130" r="110" />
            <circle class="ring-fill" cx="130" cy="130" r="110" :style="{ strokeDashoffset: ringOffset }" />
          </svg>
          <div class="ring-center">
            <template v-if="data.hasZone">
              <strong>{{ progressPct }}%</strong>
              <span>to activation</span>
            </template>
            <template v-else>
              <strong class="ring-cta">Join a<br />zone</strong>
            </template>
          </div>
        </div>
      </div>
    </section>

    <main class="dash-main">
      <!-- LOADING -->
      <div v-if="loading" class="state-card card">
        <div class="spinner"></div>
        <p>Loading your zone…</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="loadError" class="state-card card">
        <div class="state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="9.5" />
            <line x1="12" y1="7" x2="12" y2="13.5" />
            <line x1="12" y1="16.6" x2="12" y2="16.7" />
          </svg>
        </div>
        <h2>Couldn't reach CleanSpaces</h2>
        <p>Check that the backend is running, then try again.</p>
        <button class="retry-btn" @click="load">Retry</button>
      </div>

      <template v-else>
        <!-- NO ZONE -->
        <section v-if="!data.hasZone" class="get-started card">
          <span class="card-label">GET STARTED</span>
          <h2>You're not part of a zone yet</h2>
          <p>
            If your street committee has already registered a zone, start your
            contribution today — otherwise register your street first.
          </p>
          <div class="cta-row">
            <router-link to="/payment" class="primary-btn">Join &amp; pay for my zone</router-link>
            <router-link to="/how-it-works" class="secondary-btn">Register a new zone</router-link>
          </div>
        </section>

        <template v-else>
          <!-- STATS STRIP -->
          <section class="stats-strip">
            <div class="stat-card card">
              <strong>{{ cleanups.length }}</strong>
              <span>Cleanups done</span>
            </div>
            <div class="stat-card card">
              <strong>{{ payingHouseholds }}</strong>
              <span>Households paying</span>
            </div>
            <div class="stat-card card">
              <strong class="compact">{{ nextCleanup }}</strong>
              <span>Next cleanup</span>
            </div>
            <div class="stat-card card">
              <strong>R{{ totalPaid }}</strong>
              <span>You've contributed</span>
            </div>
          </section>

          <!-- ZONE GRID: activation + crew side by side -->
          <section class="zone-grid">
            <div class="card activation-card">
              <span class="card-label">ZONE ACTIVATION</span>

              <div class="activation-figures">
                <strong class="activation-num">{{ displayPaid }}</strong>
                <span class="activation-of">of {{ data.zone.threshold }} households paid this month</span>
                <span class="activation-remaining">{{ remaining }} to go until your zone activates</span>
              </div>

              <div class="bar">
                <div class="bar-fill" :style="{ width: progressDisplay + '%' }"></div>
              </div>

              <div class="status-banner" :class="data.zone.myStatus">
                <p class="status-msg">
                  <template v-if="data.zone.myStatus === 'paid'">
                    ● You're covered this month — your contribution keeps the weekly
                    cleanups running. Next payment due {{ nextDue }}.
                  </template>
                  <template v-else>
                    Your payment is due. R{{ perMonth }} secures this month's cleanup for your zone.
                  </template>
                </p>
                <router-link v-if="data.zone.myStatus !== 'paid'" to="/payment" class="primary-btn compact">
                  Pay Now →
                </router-link>
              </div>

              <p class="impact-line" v-if="data.zone.myStatus === 'paid'">
                Contributions to date: <strong>{{ payments.length }}</strong>
                {{ payments.length === 1 ? 'payment' : 'payments' }} ·
                <strong>R{{ totalPaid }}</strong> into your zone's cleanups
              </p>
            </div>

            <div class="card crew-card">
              <span class="card-label">YOUR CREW</span>
              <template v-if="crew.length">
                <div class="crew-row" v-for="(member, i) in crew" :key="i">
                  <div class="crew-avatar">{{ member.name.charAt(0) }}</div>
                  <div>
                    <strong>{{ member.name }}</strong>
                    <span>{{ member.role }}</span>
                  </div>
                </div>
              </template>
              <p v-else class="muted-note">
                Your crew is being assigned — vetted local workers clean your
                zone weekly, and their photo proof appears right here.
              </p>
            </div>
          </section>

          <!-- CLEANUPS -->
          <section class="dash-section">
            <div class="section-heading centered">
              <span class="section-label">PROOF OF WORK</span>
              <h2>Your zone's cleanups</h2>
              <p>Drag the handle to see the difference CleanSpaces makes.</p>
            </div>

            <template v-if="cleanups.length">
              <div class="chips">
                <button
                  v-for="(c, i) in cleanups"
                  :key="c.id"
                  class="chip"
                  :class="{ on: i === currentCleanup }"
                  @click="selectCleanup(i)"
                >
                  {{ formatDate(c.date_cleaned) }}
                </button>
              </div>

              <div
                class="compare"
                :class="{ idle: !dragging }"
                @pointerdown="dragging = true"
                @pointermove="onDrag"
                @pointerup="dragging = false"
                @pointerleave="dragging = false"
                @pointercancel="dragging = false"
                @touchmove.prevent="onDrag"
              >
                <img class="img-after" :src="current.after_url" alt="After cleanup" draggable="false" />
                <img
                  class="img-before"
                  :src="current.before_url"
                  alt="Before cleanup"
                  draggable="false"
                  :style="{ clipPath: 'inset(0 ' + (100 - pos) + '% 0 0)' }"
                />
                <div class="handle" :style="{ left: pos + '%' }">
                  <div class="knob">⇄</div>
                </div>
                <span class="tag before">Before</span>
                <span class="tag after">After</span>
              </div>

              <p class="compare-hint">drag the handle — or just watch</p>
              <p class="notes">{{ current.notes }}</p>
            </template>

            <div v-else class="empty-note card">
              <div class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9z" />
                  <path d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" opacity="0.55" />
                </svg>
              </div>
              <h3>Your first cleanup is coming</h3>
              <p>Once your zone activates, photo proof of every cleanup lands here.</p>
            </div>
          </section>

          <!-- PAYMENTS -->
          <section class="dash-section">
            <div class="section-heading centered">
              <span class="section-label">PAYMENTS</span>
              <h2>Your contributions</h2>
            </div>

            <div class="card ledger-card">
              <template v-if="payments.length">
                <div v-for="p in payments" :key="p.id" class="ledger-row">
                  <router-link :to="'/payment/success/' + p.id" class="ref">
                    #CS-{{ String(p.id).padStart(5, '0') }}
                  </router-link>
                  <span class="ledger-meta">{{ formatDate(p.created_at) }} · {{ METHOD_LABELS[p.method] || p.method }}</span>
                  <span class="ledger-status" :class="p.status">{{ p.status }}</span>
                  <span class="amount">R{{ p.amount }}</span>
                </div>
              </template>
              <p v-else class="muted-note">
                No payments yet.
                <router-link to="/payment" class="text-link">Make your first →</router-link>
              </p>
            </div>
          </section>
        </template>

        <!-- REPORT A NEGLECTED SPOT — intro left, form in a white card right -->
        <section class="report-section">
          <div class="report-intro">
            <span class="section-label">SPOT A PROBLEM?</span>
            <h2>Report a <strong>neglected spot</strong></h2>
            <p>
              Dumping, a blocked drain, an illegal hotspot — send it straight to
              the CleanSpaces team from your dashboard.
            </p>
            <div class="form-note">
              <span>✓</span>
              <p>Every report is reviewed and scheduled by our crews — you'll see the status of each one right here.</p>
            </div>
          </div>

          <form class="report-form" @submit.prevent="submitRequest">
            <p v-if="requestMessage" :class="['request-msg', requestError ? 'bad' : 'good']">
              {{ requestMessage }}
            </p>

            <div class="form-row">
              <div class="form-group">
                <label for="location">Location name</label>
                <input id="location" v-model.trim="requestForm.location_name" required placeholder="e.g. NY108 corner" />
              </div>
              <div class="form-group">
                <label for="suburb">Suburb</label>
                <input id="suburb" v-model.trim="requestForm.suburb" required placeholder="e.g. Manenberg" />
              </div>
            </div>

            <div class="form-group">
              <label for="address">Street address</label>
              <input id="address" v-model.trim="requestForm.address" required placeholder="e.g. NY108 & Eisleben Road" />
            </div>

            <div class="form-group">
              <label for="description">What's the problem?</label>
              <textarea id="description" v-model.trim="requestForm.description" required rows="3" placeholder="Describe the waste, the size of the dump, how long it's been there…"></textarea>
            </div>

            <!-- Photo evidence: camera or gallery on phones, file picker on desktop -->
            <div class="form-group">
              <label for="photo" class="photo-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                  <circle cx="12" cy="14" r="3.5" />
                </svg>
                Add a photo of the spot
              </label>
              <input
                id="photo"
                ref="photoInput"
                type="file"
                accept="image/*"
                class="photo-input"
                @change="onPhotoChange"
              />
              <span class="field-hint">On your phone this offers the camera or your gallery — on desktop, a file picker.</span>

              <div v-if="photoPreview" class="photo-preview">
                <img :src="photoPreview" alt="Photo preview" />
                <button type="button" class="photo-remove" @click="clearPhoto">Remove photo</button>
              </div>
            </div>

            <div class="form-group">
              <label for="preferred">Preferred cleanup date (optional)</label>
              <input id="preferred" v-model="requestForm.preferred_date" type="date" :min="todayStr" />
              <span class="field-hint">When should the team ideally get to it? Leave empty if anytime.</span>
            </div>

            <button type="submit" class="submit-btn" :disabled="requestSaving">
              <span v-if="!requestSaving">Send to CleanSpaces <span class="submit-arrow">→</span></span>
              <span v-else>Submitting...</span>
            </button>
          </form>
        </section>

        <!-- YOUR REPORTS -->
        <section v-if="myRequests.length" class="dash-section reports-section">
          <div class="section-heading centered">
            <span class="section-label">YOUR REPORTS</span>
            <h2>Spots you've reported</h2>
            <p>Track what happens to every report you send.</p>
          </div>

          <div class="request-grid">
            <article v-for="r in myRequests" :key="r.id" class="request-card card">
              <div class="request-top">
                <strong>{{ r.location_name }}</strong>
                <span class="request-status" :class="r.status">{{ statusLabel(r.status) }}</span>
              </div>
              <p class="request-loc">{{ r.address }}, {{ r.suburb }}</p>
              <p class="request-desc" v-if="r.description">{{ r.description }}</p>
              <img v-if="r.photo_url" :src="r.photo_url" alt="Reported spot" class="request-photo" />
              <small>
                Reported {{ formatDate(r.created_at) }}
                <template v-if="r.preferred_date"> · Preferred {{ formatDate(r.preferred_date) }}</template>
              </small>
            </article>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '../../api.js'

const METHOD_LABELS = { card: 'Card', eft: 'EFT' }
// Friendlier labels for the request statuses the admin side sets
const REQUEST_STATUS = { new: 'Received', reviewing: 'Under review', scheduled: 'Scheduled', completed: 'Cleaned' }
const statusLabel = (s) => REQUEST_STATUS[s] || s

// Today as YYYY-MM-DD in LOCAL time — the min bound for the date picker.
// (Not toISOString(): that's UTC and can be a day off in South Africa.)
const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const loading = ref(true)
const loadError = ref(false)
const data = ref({ hasZone: false, zone: null })
const payments = ref([])
const cleanups = ref([])
const crew = ref([])
const progressDisplay = ref(0)

// Cleanup requests — every resident can report spots, zone or not
const myRequests = ref([])
const requestSaving = ref(false)
const requestMessage = ref('')
const requestError = ref(false)
const requestForm = reactive({ location_name: '', address: '', suburb: '', description: '', preferred_date: '' })

// Photo evidence: the selected File + a local preview URL
const photoInput = ref(null)
const photoFile = ref(null)
const photoPreview = ref('')
const MAX_PHOTO_MB = 5

const currentCleanup = ref(0)
const pos = ref(92)
const dragging = ref(false)
const displayPaid = ref(0)

const current = computed(() => cleanups.value[currentCleanup.value] || {})

// Price comes from the backend (single source of truth: config/plans.js)
const perMonth = computed(() => data.value.zone?.per_household_amount ?? '—')

// First day of next month — when the next subscription payment is due.
const nextDue = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })
})

const totalPaid = computed(() =>
  payments.value
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(0)
)

const payingHouseholds = computed(() => data.value.zone?.paid ?? 0)

const nextCleanup = computed(() => {
  if (!cleanups.value.length) return '—'
  const last = new Date(cleanups.value[0].date_cleaned)
  last.setDate(last.getDate() + 7)
  return last.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
})

const progressPct = computed(() => {
  const z = data.value.zone
  if (!z || !z.threshold) return 0
  return Math.min(Math.round((z.paid / z.threshold) * 100), 100)
})

const remaining = computed(() => {
  const z = data.value.zone
  return z ? Math.max(0, z.threshold - z.paid) : 0
})

// Hero progress ring — SVG circle geometry (circumference = 2π × r, r = 110)
const RING_LENGTH = 2 * Math.PI * 110
const ringOffset = computed(() => RING_LENGTH * (1 - progressPct.value / 100))

function selectCleanup(i) {
  currentCleanup.value = i
  pos.value = 92
}

/* PHOTO EVIDENCE — pick/capture, validate, preview */
function onPhotoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  // client-side checks — the server re-checks both (never trust the client)
  if (!file.type.startsWith('image/')) {
    requestError.value = true
    requestMessage.value = 'Please choose an image file.'
    e.target.value = ''
    return
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    requestError.value = true
    requestMessage.value = `That photo is too large (max ${MAX_PHOTO_MB} MB).`
    e.target.value = ''
    return
  }
  requestMessage.value = ''
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function clearPhoto() {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
  photoFile.value = null
  photoPreview.value = ''
  if (photoInput.value) photoInput.value.value = ''
}

/* AUTO-SWEEP — the slider slowly reveals the "after" image on its own */
let target = 8
const HOLD_MS = 2000
const SWEEP_MS = 3000
let autoTimer = null
let holdUntil = 0
let lastTick = 0

function startAuto() {
  stopAuto()
  target = 8
  holdUntil = Date.now() + HOLD_MS
  lastTick = Date.now()
  autoTimer = setInterval(() => {
    const now = Date.now()
    const dt = now - lastTick
    lastTick = now

    if (dragging.value) return
    if (now < holdUntil) return

    const step = (dt / SWEEP_MS) * 84
    let next = pos.value + (target > pos.value ? step : -step)
    if (Math.abs(next - target) < 1) {
      next = target
      target = (target === 8) ? 92 : 8
      holdUntil = now + HOLD_MS
    }
    pos.value = next
  }, 40)
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer)
  autoTimer = null
}

function onDrag(e) {
  if (!dragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
  pos.value = Math.min(97, Math.max(3, (x / rect.width) * 100))
}

/* LIVE COUNTER — the paid-households figure counts up on load */
let countTimer = null
function animateCount(targetVal, display, duration = 1200) {
  const start = performance.now()
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = Math.round(targetVal * eased)
    if (progress < 1) countTimer = requestAnimationFrame(tick)
  }
  countTimer = requestAnimationFrame(tick)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* Load the resident's submitted cleanup requests (independent — a failure
   here should never take the whole dashboard offline) */
async function loadRequests() {
  try {
    myRequests.value = (await api.get('/resident/cleanup-requests')).data
  } catch { /* leave the list as-is */ }
}

async function submitRequest() {
  requestSaving.value = true
  requestMessage.value = ''
  try {
    // multipart/form-data — axios sets the correct content type automatically
    const body = new FormData()
    body.append('location_name', requestForm.location_name)
    body.append('address', requestForm.address)
    body.append('suburb', requestForm.suburb)
    body.append('description', requestForm.description)
    if (requestForm.preferred_date) body.append('preferred_date', requestForm.preferred_date)
    if (photoFile.value) body.append('photo', photoFile.value)

    const { data: result } = await api.post('/resident/cleanup-requests', body)

    requestError.value = false
    requestMessage.value = result.message
    Object.assign(requestForm, { location_name: '', address: '', suburb: '', description: '', preferred_date: '' })
    clearPhoto()
    await loadRequests()
  } catch (e) {
    requestError.value = true
    requestMessage.value = e.response?.data?.message || 'Unable to submit your request.'
  } finally {
    requestSaving.value = false
  }
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
      // crew is a bonus — if the /crew route isn't deployed yet, carry on without it
      const [cleanRes, crewRes] = await Promise.all([
        api.get('/resident/cleanups'),
        api.get('/resident/crew').catch(() => ({ data: [] }))
      ])
      cleanups.value = cleanRes.data
      crew.value = crewRes.data
    }

    await nextTick()
    setTimeout(() => { progressDisplay.value = progressPct.value }, 300)
    if (data.value.hasZone) {
      animateCount(data.value.zone.paid, displayPaid)
    }
    startAuto()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
  loadRequests()
}

onMounted(load)

onUnmounted(() => {
  stopAuto()
  if (countTimer) cancelAnimationFrame(countTimer)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f7faf8;
  color: #183b28;
}

/* ===== HERO — gradient + soap bubbles + activation ring ===== */
.dash-hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 80px 8%;
  background: linear-gradient(135deg, #eaf6ed 0%, #f7fbf8 55%, #dff0e5 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 650px;
}

/* Hero tag — a badge that headlines the page, bigger than section labels */
.hero-tag {
  display: inline-block;
  margin-bottom: 20px;
  padding: 8px 20px;
  border-radius: 50px;
  background: #176b3a;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* Section/card labels — small green eyebrows (stay small on purpose) */
.section-label,
.card-label {
  display: inline-block;
  margin-bottom: 16px;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(40px, 6vw, 68px);
  line-height: 1.02;
  letter-spacing: -3px;
  color: #173b27;
}

.hero-content p {
  max-width: 560px;
  margin: 24px 0;
  color: #5e7165;
  font-size: 18px;
  line-height: 1.7;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 15px 23px;
  border-radius: 50px;
  background: #176b3a;
  color: white;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(23, 107, 58, 0.25);
}

.hero-button span { font-size: 20px; }

.hero-decoration {
  position: absolute;
  right: 8%;
  width: 400px;
  height: 400px;
}

/* Live activation ring — a real progress indicator, not just decoration */
.progress-ring { position: absolute; inset: 35px; }

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* start the fill at 12 o'clock */
}

.ring-track {
  fill: none;
  stroke: rgba(23, 107, 58, 0.12);
  stroke-width: 12;
}

.ring-fill {
  fill: none;
  stroke: #198044;
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: 691; /* 2π × 110 */
  transition: stroke-dashoffset 1.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ring-center strong {
  font-size: 54px;
  line-height: 1;
  color: #176b3a;
  font-weight: 800;
}

.ring-center strong.ring-cta { font-size: 26px; line-height: 1.15; letter-spacing: -1px; }

.ring-center span {
  margin-top: 8px;
  color: #5e7165;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* Soap bubbles — the cleaning motif, drifting gently */
.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(212, 240, 220, 0.35) 65%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 20px rgba(31, 89, 54, 0.1);
  animation: drift 7s ease-in-out infinite;
}

.bubble-one { width: 48px; height: 48px; top: 28px; left: 66px; }
.bubble-two { width: 26px; height: 26px; right: 42px; top: 128px; animation-delay: 1.4s; }
.bubble-three { width: 18px; height: 18px; left: 26px; bottom: 108px; animation-delay: 2.8s; }
.bubble-four { width: 34px; height: 34px; right: 92px; bottom: 44px; animation-delay: 4.2s; }

@keyframes drift {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-16px) translateX(7px); }
}

/* ===== MAIN / SHARED ===== */
.dash-main { overflow: hidden; }

.card {
  background: white;
  border: 1px solid #e4eee7;
  border-radius: 24px;
  box-shadow: 0 8px 22px rgba(31, 89, 54, 0.05);
}

.card-label { margin-bottom: 12px; }

.state-card {
  max-width: 500px;
  margin: 80px auto;
  padding: 55px 30px;
  text-align: center;
}

.state-card h2 { margin: 0 0 8px; }
.state-card p { margin: 0 0 20px; color: #718077; }

/* SVG state icons (no emoji) */
.state-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  color: #a33d3d;
  display: flex;
  align-items: center;
  justify-content: center;
}
.state-icon svg { width: 100%; height: 100%; }

.retry-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 50px;
  background: #176b3a;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.spinner {
  width: 35px;
  height: 35px;
  margin: 0 auto 15px;
  border: 3px solid #dcebe0;
  border-top-color: #198044;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.muted-note { color: #718077; font-size: 14px; line-height: 1.7; }
.text-link { color: #198044; font-weight: 700; text-decoration: none; }

/* ===== GET STARTED (no zone) ===== */
.get-started {
  max-width: 800px;
  margin: 70px auto;
  padding: 45px;
}

.get-started h2 { margin: 0 0 10px; font-size: clamp(28px, 4vw, 40px); letter-spacing: -2px; }
.get-started p { margin: 0 0 25px; color: #66736b; line-height: 1.7; }

.cta-row { display: flex; gap: 14px; flex-wrap: wrap; }

.primary-btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 26px;
  border-radius: 50px;
  background: #176b3a;
  color: white;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(23, 107, 58, 0.22);
}

.primary-btn.compact { padding: 10px 20px; font-size: 14px; margin-left: auto; }

.secondary-btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 26px;
  border-radius: 50px;
  background: transparent;
  color: #176b3a;
  border: 2px solid #bfe3cc;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.secondary-btn:hover { border-color: #198044; background: rgba(25, 128, 68, 0.06); }

/* ===== STATS STRIP ===== */
.stats-strip {
  max-width: 1150px;
  margin: 60px auto 0;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  padding: 28px 22px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(31, 89, 54, 0.1);
}

.stat-card strong {
  display: block;
  font-size: 44px;
  line-height: 1;
  color: #176b3a;
}

.stat-card strong.compact { font-size: 30px; padding-top: 8px; padding-bottom: 8px; }

.stat-card span {
  display: block;
  margin-top: 10px;
  color: #8a978f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* ===== ZONE GRID (activation + crew) ===== */
.zone-grid {
  max-width: 1150px;
  margin: 45px auto 0;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 24px;
  align-items: stretch;
}

.activation-card,
.crew-card { padding: 38px 40px; }

.activation-figures { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }

.activation-num {
  font-size: clamp(48px, 6vw, 64px);
  line-height: 1;
  color: #176b3a;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.activation-of { color: #66736b; font-weight: 700; font-size: 15px; }
.activation-remaining {
  display: block;
  width: 100%;
  margin-top: 6px;
  color: #8a978f;
  font-size: 13px;
}

.bar {
  height: 10px;
  border-radius: 999px;
  background: #e6eee8;
  margin: 28px 0 22px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #198044, #3b9b68);
  transition: width 1.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  min-width: 14px;
}

/* glint at the leading edge of the progress fill */
.bar-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 3px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(25, 128, 68, 0.6);
  border-radius: 2px;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 14px;
  flex-wrap: wrap;
}

.status-banner.paid { background: #e9f7ed; border: 1px solid #bfe3cc; }
.status-banner.pending { background: #fff8e6; border: 1px solid #f0dca8; }

.status-msg { margin: 0; font-size: 14px; line-height: 1.6; }
.status-banner.paid .status-msg { color: #24633a; }
.status-banner.pending .status-msg { color: #7a5300; font-weight: 600; }

.impact-line { margin: 18px 0 0; color: #66736b; font-size: 13px; }
.impact-line strong { color: #198044; }

.crew-row {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fbf9;
  border: 1px solid #e3ede6;
}

.crew-row + .crew-row { margin-top: 10px; }

.crew-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #e9f5ec;
  color: #198044;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}

.crew-row strong { display: block; color: #183b28; font-size: 15px; }
.crew-row span { color: #8a978f; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }

/* ===== SECTIONS ===== */
.dash-section {
  max-width: 1150px;
  margin: 0 auto;
  padding: 70px 20px 0;
}

.dash-section:last-of-type { padding-bottom: 90px; }

.section-heading { max-width: 650px; margin-bottom: 45px; }

.section-heading.centered {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.section-heading h2,
.report-intro h2 {
  margin: 0 0 15px;
  color: #183b28;
  font-size: clamp(34px, 5vw, 52px);
  letter-spacing: -2px;
  line-height: 1.08;
}

.section-heading p { margin: 0; color: #718077; line-height: 1.7; }

/* ===== CLEANUPS ===== */
.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 28px;
}

.chip {
  padding: 10px 22px;
  border-radius: 50px;
  background: white;
  color: #5e7165;
  border: 1px solid #e0e8e2;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.chip:hover { border-color: #62b987; color: #176b3a; }

.chip.on {
  background: #176b3a;
  color: white;
  border-color: #176b3a;
  box-shadow: 0 6px 15px rgba(23, 107, 58, 0.25);
}

.compare {
  position: relative;
  aspect-ratio: 16 / 9;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 20px 45px rgba(31, 89, 54, 0.15);
}

.compare img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.img-after { z-index: 1; }
.img-before { z-index: 2; }

.handle {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
  transform: translateX(-50%);
  pointer-events: none;
}

.handle::before {
  content: '';
  position: absolute;
  top: 0; bottom: 0; left: -1.5px;
  width: 3px;
  background: #fff;
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.5);
}

.knob {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #176b3a;
  color: white;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), 0 0 0 5px rgba(255, 255, 255, 0.35);
  transition: transform 0.2s ease;
}

.compare.idle .knob::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(23, 107, 58, 0.5);
  animation: breathe 2.4s ease-out infinite;
}

@keyframes breathe {
  0% { transform: scale(0.85); opacity: 0.9; }
  70% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}

.compare:active .knob { transform: translate(-50%, -50%) scale(1.12); }

.tag {
  position: absolute;
  bottom: 18px;
  z-index: 5;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.tag.before { left: 18px; background: rgba(23, 37, 26, 0.65); color: #fff; }
.tag.after { right: 18px; background: rgba(23, 107, 58, 0.85); color: #fff; }

.compare-hint {
  margin: 16px 0 0;
  text-align: center;
  color: #8a978f;
  font-size: 12px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.notes {
  max-width: 700px;
  margin: 18px auto 0;
  text-align: center;
  color: #5e7165;
  line-height: 1.7;
}

.empty-note {
  max-width: 600px;
  margin: 0 auto;
  padding: 55px 30px;
  text-align: center;
}

.empty-note h3 { margin: 0 0 8px; color: #294635; }
.empty-note p { margin: 0; color: #718078; }

.empty-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 14px;
  color: #198044;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-icon svg { width: 100%; height: 100%; }

/* ===== PAYMENTS ===== */
.ledger-card { max-width: 900px; margin: 0 auto; padding: 14px 36px; }

.ledger-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid #e6eee8;
  flex-wrap: wrap;
}

.ledger-row:last-child { border-bottom: none; }

.ref {
  color: #176b3a;
  font-weight: 800;
  text-decoration: none;
  border-bottom: 2px solid #bfe3cc;
}

.ref:hover { border-color: #198044; }

.ledger-meta { color: #718078; font-size: 13px; }

.ledger-status {
  margin-left: auto;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ledger-status.completed { color: #24633a; background: #e9f7ed; }
.ledger-status.pending { color: #7a5300; background: #fff1cb; }
.ledger-status.failed { color: #a33d3d; background: #fff0f0; }

.amount { font-size: 24px; font-weight: 800; color: #183b28; }

.ledger-card .muted-note { padding: 22px 0; }

/* ===== REPORT SECTION (intro left, form right) ===== */
/* margin shorthand: top 90, sides auto (centers the section), bottom 0 */
.report-section {
  max-width: 1150px;
  margin: 90px auto 0;
  padding: 70px;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 70px;
  border-radius: 35px;
  background: linear-gradient(135deg, #e7f4ea, #f6fbf7);
}

.report-intro h2 strong { color: #198044; }

.report-intro > p { color: #68776e; line-height: 1.7; }

.form-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 30px;
  padding: 16px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.65);
}

.form-note span { color: #198044; font-weight: 800; }
.form-note p { margin: 0; color: #65746b; font-size: 13px; line-height: 1.5; }

.report-form {
  padding: 35px;
  background: white;
  border-radius: 25px;
  box-shadow: 0 15px 40px rgba(31, 89, 54, 0.08);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

.form-group { margin-bottom: 22px; }

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #294635;
  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid #dce7df;
  border-radius: 13px;
  outline: none;
  background: #fbfdfc;
  color: #294635;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #198044;
  box-shadow: 0 0 0 4px rgba(25, 128, 68, 0.08);
}

.form-group textarea { resize: vertical; min-height: 100px; }

/* small helper text under inputs (e.g. the preferred-date explanation) */
.field-hint {
  display: block;
  margin-top: 6px;
  color: #8a978f;
  font-size: 11px;
}

/* Photo upload: the label is the visible button, the real input stays hidden */
label.photo-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border: 2px dashed #c8ded1;
  border-radius: 13px;
  background: #fbfdfc;
  color: #176b3a;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

label.photo-label:hover { border-color: #198044; background: #f3faf5; }

.photo-label svg { width: 20px; height: 20px; flex-shrink: 0; }
.photo-input { display: none; }

.photo-preview { margin-top: 12px; display: grid; gap: 8px; }
.photo-preview img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.photo-remove {
  justify-self: start;
  padding: 6px 14px;
  border: none;
  border-radius: 50px;
  background: #fff0f0;
  color: #a33d3d;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.request-msg {
  margin: 0 0 20px;
  padding: 14px;
  border-radius: 12px;
  font-size: 13px;
}

.request-msg.good { background: #e9f7ed; color: #24633a; }
.request-msg.bad { background: #fff0f0; color: #a33d3d; }

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px;
  border: none;
  border-radius: 13px;
  background: #176b3a;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(23, 107, 58, 0.2);
}

.submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.submit-arrow { font-size: 18px; }

/* ===== YOUR REPORTS ===== */
.reports-section { padding-bottom: 100px; }

.request-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.request-card {
  padding: 26px 28px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.request-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(31, 89, 54, 0.12);
}

.request-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.request-top strong { color: #183b28; font-size: 17px; }

.request-status {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.request-status.new { color: #395463; background: #e6edf2; }
.request-status.reviewing { color: #7a5300; background: #fff1cb; }
.request-status.scheduled { color: #294f88; background: #e6eefb; }
.request-status.completed { color: #286033; background: #e6f5e8; }

.request-loc { margin: 10px 0 0; color: #718078; font-size: 13px; font-weight: 600; }

.request-desc {
  margin: 8px 0 0;
  color: #78857d;
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* the resident's own photo evidence on their report card */
.request-photo {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 14px;
  display: block;
}

.request-card small { display: block; margin-top: 14px; color: #8a978f; font-size: 12px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1000px) {
  .hero-decoration { right: -80px; opacity: 0.65; }
  .zone-grid { grid-template-columns: 1fr; }
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
  .request-grid { grid-template-columns: 1fr; }
  .report-section { gap: 45px; padding: 50px; }
}

@media (max-width: 750px) {
  .dash-hero { min-height: auto; padding: 70px 7%; }
  .hero-decoration { display: none; }
  .dash-section { padding-top: 55px; }
  /* mobile gutters: sides 16px instead of auto */
  .report-section { grid-template-columns: 1fr; margin: 60px 16px 0; padding: 35px 25px; gap: 30px; }
  .activation-card, .crew-card { padding: 28px 24px; }
  .ledger-card { padding: 10px 22px; }
  .compare { aspect-ratio: 4 / 5; }
  .status-banner { flex-direction: column; align-items: flex-start; }
  .primary-btn.compact { margin-left: 0; }
}

@media (max-width: 500px) {
  .stats-strip { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .ledger-row { gap: 12px; }
  .amount { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .bubble, .compare.idle .knob::after, .spinner { animation: none !important; }
}
</style>