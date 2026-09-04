<template>
  <div class="dash" ref="dashEl">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>

    <header class="hero">
      <p class="eyebrow">My Zone</p>
      <h1>{{ data.hasZone ? data.zone.name : 'Join A Zone' }}</h1>
      <p class="hero-sub">
        {{ data.hasZone
          ? data.zone.neighborhood + ' · ' + data.zone.households + ' households'
          : 'Pool with your street. Fund your cleanups.' }}
      </p>
    </header>

    <main class="rail">
      <div v-if="loading" class="block">
        <div class="spinner"></div>
      </div>

      <div v-else-if="loadError" class="block">
        <h2 class="block-title">Offline</h2>
        <p class="sub">Couldn't reach CleanSpaces. <button class="text-btn" @click="load">Retry</button></p>
      </div>

      <div v-else-if="!data.hasZone" class="block">
        <h2 class="block-title">Get Started</h2>
        <p class="big-sub">You're not part of a zone yet.</p>
        <p class="sub">Register your street and start pooling with your neighbours.</p>
        <router-link to="/how-it-works" class="cta">Register Your Zone</router-link>
      </div>

      <template v-else>
        <!-- THIS MONTH AT A GLANCE -->
        <div class="glance">
          <div class="glance-item">
            <span class="glance-num">{{ cleanups.length }}</span>
            <span class="glance-label">cleanups done</span>
          </div>
          <div class="glance-item">
            <span class="glance-num">{{ payingHouseholds }}</span>
            <span class="glance-label">households paying</span>
          </div>
          <div class="glance-item">
            <span class="glance-num">{{ nextCleanup }}</span>
            <span class="glance-label">next cleanup</span>
          </div>
          <div class="glance-item">
            <span class="glance-num">R{{ totalPaid }}</span>
            <span class="glance-label">you've contributed</span>
          </div>
        </div>

        <!-- ACTIVATION -->
        <section class="block">
          <h2 class="block-title">Zone Activation</h2>
          <div class="stat-line">
            <span class="mega">{{ displayPaid }}</span>
            <div class="stat-context">
              <span class="stat-strong">of {{ data.zone.threshold }} households paid</span>
              <span class="sub">{{ remaining }} to go until activation</span>
            </div>
          </div>

          <div class="bar">
            <div class="bar-fill" :style="{ width: progressDisplay + '%' }"></div>
          </div>

          <div class="status-banner" :class="data.zone.myStatus">
            <p class="status-msg">
              <template v-if="data.zone.myStatus === 'paid'">
                ● You're covered this month — your contribution keeps the weekly cleanups running.
                Next payment due 1 October.
              </template>
              <template v-else>
                ⚠ Your payment is due. R{{ perMonth }} secures this month's cleanup for your zone.
              </template>
            </p>
            <router-link v-if="data.zone.myStatus !== 'paid'" to="/payment" class="cta compact">
              Pay Now →
            </router-link>
          </div>

          <p class="impact-line" v-if="data.zone.myStatus === 'paid'">
            Your contributions to date: <strong>{{ payments.length }}</strong>
            <template v-if="payments.length === 1">payment</template>
            <template v-else>payments</template>
            · <strong>R{{ totalPaid }}</strong> into your zone's cleanups
          </p>
        </section>

        <!-- CLEANUPS -->
        <section class="block">
          <h2 class="block-title">Cleanups</h2>

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

          <p v-else class="sub">No cleanups recorded yet — your zone's first one is coming.</p>
        </section>

        <!-- PAYMENTS -->
        <section class="block">
          <h2 class="block-title">Payments</h2>
          <template v-if="payments.length">
            <div v-for="(p, i) in payments" :key="p.id" class="ledger-row" :style="{ animationDelay: (0.5 + i * 0.1) + 's' }">
              <router-link :to="'/payment/success/' + p.id" class="ref">
                #CS-{{ String(p.id).padStart(5, '0') }}
              </router-link>
              <span class="ledger-meta">{{ formatDate(p.created_at) }} · {{ METHOD_LABELS[p.method] || p.method }}</span>
              <span class="ledger-status" :class="p.status">{{ p.status }}</span>
              <span class="amount">R{{ p.amount }}</span>
            </div>
          </template>
          <p v-else class="sub">
            No payments yet. <router-link to="/payment" class="text-link">Make your first →</router-link>
          </p>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '../../api.js'

const METHOD_LABELS = { card: 'Card', eft: 'EFT' }

const loading = ref(true)
const loadError = ref(false)
const data = ref({ hasZone: false, zone: null })
const payments = ref([])
const cleanups = ref([])
const progressDisplay = ref(0)

const currentCleanup = ref(0)
const pos = ref(92)
const dragging = ref(false)
const displayPaid = ref(0)

const dashEl = ref(null)

let autoTimer = null
let countTimer = null
let parallaxOn = null
let pointerMove = null

const current = computed(() => cleanups.value[currentCleanup.value] || {})

const perMonth = computed(() => {
  if (!data.value.hasZone) return '—'
  const base = { small: 4000, medium: 7250, large: 11500 }[data.value.zone.plan] || 0
  return Math.round(base / data.value.zone.households)
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

function selectCleanup(i) {
  currentCleanup.value = i
  pos.value = 92
}

/* ONE AUTHORITY SWEEP */
let target = 8
const HOLD_MS = 2000
const SWEEP_MS = 3000
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

/* LIVE COUNTER */
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

/* HERO PARALLAX */
function onScroll() {
  const y = window.scrollY
  const h1 = document.querySelector('.dash .hero h1')
  if (h1) h1.style.transform = `translateY(${Math.min(y * 0.08, 40)}px)`
}

/* CLEAN-REVEAL SPOTLIGHT — light follows the cursor across panels */
function onPointerMove(e) {
  const el = dashEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', (e.clientX - rect.left) + 'px')
  el.style.setProperty('--my', (e.clientY - rect.top) + 'px')
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
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
      const res = await api.get('/resident/cleanups')
      cleanups.value = res.data
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
}

onMounted(() => {
  load()
  parallaxOn = () => onScroll()
  window.addEventListener('scroll', parallaxOn, { passive: true })
  pointerMove = (e) => onPointerMove(e)
  window.addEventListener('pointermove', pointerMove, { passive: true })
})

onUnmounted(() => {
  stopAuto()
  if (countTimer) cancelAnimationFrame(countTimer)
  if (parallaxOn) window.removeEventListener('scroll', parallaxOn)
  if (pointerMove) window.removeEventListener('pointermove', pointerMove)
})
</script>

<style scoped>
.dash {
  position: relative;
  min-height: 100vh;
  background: #0b2a25;
  color: #f4f6f5;
  overflow-x: clip;
}

/* DRIFTING AMBIENT GLOWS */
.glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: -1;
  will-change: transform;
}
.glow-a {
  width: 640px; height: 640px;
  top: -220px; right: -140px;
  background: rgba(124, 179, 66, 0.10);
  animation: driftA 14s ease-in-out infinite alternate;
}
.glow-b {
  width: 520px; height: 520px;
  bottom: -160px; left: -180px;
  background: rgba(42, 74, 67, 0.55);
  animation: driftB 18s ease-in-out infinite alternate;
}
@keyframes driftA {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-60px, 50px) scale(1.15); }
}
@keyframes driftB {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(70px, -40px) scale(0.92); }
}

.hero {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 5rem 1.5rem 2.5rem;
}
.eyebrow {
  margin: 0 0 .7rem;
  font-family: 'Sora', sans-serif;
  font-size: .78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .22em;
  color: #9ccc65;
}
.hero h1 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.6rem, 6.5vw, 4.4rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.04;
  color: #ffffff;
  text-shadow: 0 2px 30px rgba(11, 42, 37, 0.8);
  will-change: transform;
}
.hero-sub {
  margin: 1rem 0 0;
  color: #c3d0cb;
  font-size: 1.08rem;
}

.rail {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
  display: grid;
  gap: 2.25rem;
}

/* SECTION PANELS + SPOTLIGHT */
.block {
  background: #0e2420;
  border: 1px solid #1d3b35;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  position: relative;
  animation: sweepIn .65s cubic-bezier(.22, 1, .36, 1) both;
}
.block:nth-of-type(2) { animation-delay: .05s; }
.block:nth-of-type(3) { animation-delay: .1s; }
.block:nth-of-type(4) { animation-delay: .15s; }

/* CLEAN-REVEAL SPOTLIGHT — the panel brightens where the cursor is */
.block::before,
.glance::before {
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
.block:hover::before,
.glance:hover::before {
  opacity: 1;
}

.block-title {
  margin: 0 0 1.5rem;
  font-family: 'Sora', sans-serif;
  font-size: 1rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
  color: #9ccc65;
  display: flex;
  align-items: center;
  gap: .75rem;
}
.block-title::before {
  content: '';
  width: 22px; height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #7cb342, transparent);
  flex-shrink: 0;
}

/* THIS MONTH AT A GLANCE */
.glance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1px;
  background: #1d3b35;
  border: 1px solid #1d3b35;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  animation: sweepIn .65s cubic-bezier(.22, 1, .36, 1) both;
}
.glance-item {
  background: #0e2420;
  padding: 1.5rem 1.25rem;
  display: grid;
  gap: .3rem;
  transition: background 0.25s ease;
}
.glance-item:hover { background: #12332d; }
.glance-num {
  font-family: 'Sora', sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.glance-label {
  color: #6a7a76;
  font-size: .78rem;
  text-transform: uppercase;
  letter-spacing: .1em;
}

.sub { color: #c3d0cb; margin: .4rem 0 0; font-size: .95rem; }
.big-sub {
  color: #ffffff; font-size: 1.35rem; font-weight: 700;
  margin: 0; font-family: 'Sora', sans-serif;
}
.text-btn { background: none; border: 0; color: #9ccc65; font: inherit; font-weight: 600; cursor: pointer; }
.text-link { color: #9ccc65; font-weight: 600; text-decoration: none; }

/* ACTIVATION */
.stat-line {
  display: flex; align-items: baseline; gap: 1.4rem; flex-wrap: wrap;
  margin-top: -0.5rem;
}
.mega {
  font-family: 'Sora', sans-serif;
  font-size: clamp(3.6rem, 11vw, 7rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.045em;
  background: linear-gradient(180deg, #ffffff 55%, #c3d0cb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 20px rgba(11, 42, 37, 0.6));
  font-variant-numeric: tabular-nums;
}
.stat-context { display: grid; gap: .15rem; }
.stat-strong { font-weight: 700; font-size: 1.18rem; font-family: 'Sora', sans-serif; color: #ffffff; }

/* THE SWEEPING PROGRESS BAR — broom rides the leading edge */
.bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  margin: 2rem 0 1.25rem;
  overflow: hidden; 
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7cb342, #9ccc65);
  box-shadow: 0 0 20px rgba(124, 179, 66, 0.55);
  transition: width 1.3s cubic-bezier(.22, 1, .36, 1);
  position: relative;
  min-width: 12px;
}
/* the glint edge — the sweep line */
.bar-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 3px;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}
/* SMART STATUS BANNER */
.status-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.4rem;
  border-radius: 14px;
  flex-wrap: wrap;
  margin-bottom: .9rem;
  animation: sweepIn .6s cubic-bezier(.22, 1, .36, 1) .3s both;
}
.status-banner.paid {
  background: rgba(124, 179, 66, 0.1);
  border: 1px solid rgba(124, 179, 66, 0.3);
}
.status-banner.pending {
  background: rgba(255, 202, 122, 0.08);
  border: 1px solid rgba(255, 202, 122, 0.3);
  animation: sweepIn .6s cubic-bezier(.22, 1, .36, 1) .3s both,
             urgentPulse 2.8s ease-in-out 1.5s infinite;
}
@keyframes urgentPulse {
  0%, 100% { border-color: rgba(255, 202, 122, 0.3); box-shadow: none; }
  50% { border-color: rgba(255, 202, 122, 0.65); box-shadow: 0 0 18px rgba(255, 202, 122, 0.12); }
}
.status-msg { margin: 0; font-size: .93rem; line-height: 1.5; }
.status-banner.paid .status-msg { color: #d7e4de; }
.status-banner.pending .status-msg { color: #ffe3c2; }

.impact-line { margin: 0; color: #c3d0cb; font-size: .88rem; }
.impact-line strong { color: #9ccc65; font-weight: 700; }

/* CTA */
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
  white-space: nowrap;
}
.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(124, 179, 66, 0.55);
}
.cta.compact { padding: .6rem 1.4rem; font-size: .88rem; margin-left: auto; }

/* CLEANUPS */
.chips { display: flex; gap: .55rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.chip {
  padding: .5rem 1.25rem;
  border-radius: 999px;
  background: transparent;
  color: #c3d0cb;
  border: 1px solid #2a4a43;
  font-family: 'Sora', sans-serif;
  font-size: .82rem; font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}
.chip:hover { border-color: #9ccc65; color: #f4f6f5; }
.chip.on {
  background: #7cb342;
  color: #0b2a25;
  border-color: #7cb342;
  box-shadow: 0 4px 14px rgba(124, 179, 66, 0.35);
}

/* DRAG-TO-COMPARE — with the BROOM CURSOR */
.compare {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.compare img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
.img-after { z-index: 1; }
.img-before { z-index: 2; }

.handle {
  position: absolute; top: 0; bottom: 0;
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
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.7);
}
.knob {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 50px; height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  display: grid; place-items: center;
  font-size: 1.25rem; font-weight: 800;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.5), 0 0 0 5px rgba(255, 255, 255, 0.12);
  transition: transform 0.2s ease;
}
.compare.idle .knob::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(124, 179, 66, 0.6);
  animation: breathe 2.4s ease-out infinite;
}
@keyframes breathe {
  0% { transform: scale(0.85); opacity: 0.9; }
  70% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
}
.compare:active .knob {
  transform: translate(-50%, -50%) scale(1.14);
}

.tag {
  position: absolute; bottom: 1.1rem;
  z-index: 5;
  padding: .38rem 1.05rem;
  border-radius: 999px;
  font-size: .72rem; font-weight: 700;
  letter-spacing: .09em; text-transform: uppercase;
  backdrop-filter: blur(8px);
}
.tag.before { left: 1.1rem; background: rgba(15, 15, 15, 0.6); color: #fff; }
.tag.after { right: 1.1rem; background: rgba(104, 159, 56, 0.85); color: #fff; }

.compare-hint {
  margin: .8rem 0 0;
  text-align: center;
  color: #6a7a76;
  font-size: .75rem;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.notes { margin: 1.1rem 0 0; font-size: 1.05rem; color: #d7e4de; max-width: 60ch; }

/* PAYMENTS LEDGER */
.ledger-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #1d3b35;
  flex-wrap: wrap;
  animation: sweepIn .5s cubic-bezier(.22, 1, .36, 1) both;
}
.ledger-row:last-child { border-bottom: none; }
.ref {
  color: #f4f6f5;
  font-weight: 700;
  font-family: 'Sora', sans-serif;
  text-decoration: none;
  border-bottom: 2px solid #9ccc65;
  transition: color 0.2s;
}
.ref:hover { color: #9ccc65; }
.ledger-meta { color: #c3d0cb; font-size: 0.9rem; }
.ledger-status {
  margin-left: auto;
  padding: 0.28rem 0.85rem;
  border-radius: 999px;
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
}
.ledger-status.completed { color: #9ccc65; background: rgba(124, 179, 66, 0.13); }
.ledger-status.pending { color: #ffca7a; background: rgba(255, 202, 122, 0.1); }
.ledger-status.failed { color: #ff8a80; background: rgba(255, 138, 128, 0.1); }
.amount {
  font-family: 'Sora', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.spinner {
  width: 44px; height: 44px;
  margin: 3rem auto;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #9ccc65;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* SWEEP-IN — the slider's grammar at page scale:
   sections wipe clean from the left */
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

@media (max-width: 640px) {
  .hero { padding-top: 3.5rem; }
  .rail { gap: 1.75rem; }
  .block { padding: 1.5rem 1.25rem; }
  .glance { grid-template-columns: repeat(2, 1fr); }
  .compare { aspect-ratio: 4 / 5; }
  .knob { width: 42px; height: 42px; }
  .status-banner { flex-direction: column; align-items: flex-start; }
  .cta.compact { margin-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .glow-a, .glow-b, .compare.idle .knob::after,
  .status-banner.pending, .block, .ledger-row, .glance {
    animation: none !important;
  }
  .block::before, .glance::before { display: none; }
}
</style>