<template>
  <div class="dash">
    <!-- AMBIENT LIGHT -->
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>

    <!-- HERO -->
    <header class="hero">
      <p class="eyebrow">My Zone</p>
      <h1>{{ data.hasZone ? data.zone.name : 'Join A Zone' }}</h1>
      <p class="hero-sub">
        {{ data.hasZone
          ? `${data.zone.neighborhood} · ${data.zone.households} households`
          : 'Pool with your street. Fund your cleanups.' }}
      </p>
    </header>

    <main class="rail">
      <!-- LOADING -->
      <div v-if="loading" class="block">
        <div class="spinner"></div>
      </div>

      <!-- OFFLINE -->
      <div v-else-if="loadError" class="block">
        <h2 class="block-title">Offline</h2>
        <p class="sub">Couldn't reach CleanSpaces. <button class="text-btn" @click="load">Retry</button></p>
      </div>

      <!-- NO ZONE -->
      <div v-else-if="!data.hasZone" class="block">
        <h2 class="block-title">Get Started</h2>
        <p class="big-sub">You're not part of a zone yet.</p>
        <p class="sub">Register your street and start pooling with your neighbours.</p>
        <router-link to="/how-it-works" class="cta">Register Your Zone →</router-link>
      </div>

      <template v-else>
        <!-- ACTIVATION -->
        <section class="block">
          <div class="stat-line">
            <span class="mega">{{ data.zone.paid }}</span>
            <div class="stat-context">
              <span class="stat-strong">of {{ data.zone.threshold }} households paid</span>
              <span class="sub">{{ remaining }} to go until activation</span>
            </div>
          </div>

          <div class="bar">
            <div class="bar-fill" :style="{ width: progressDisplay + '%' }"></div>
          </div>

          <div class="action-row">
            <span class="status-line" :class="data.zone.myStatus">
              {{ data.zone.myStatus === 'paid' ? '● You\'ve paid this month' : '● Payment due' }}
            </span>
            <router-link v-if="data.zone.myStatus !== 'paid'" to="/payment" class="cta">
              Pay R{{ perMonth }} →
            </router-link>
          </div>
        </section>

        <hr class="rule" />

        <!-- CLEANUPS -->
        <section class="block">
          <h2 class="block-title">Cleanups</h2>

          <template v-if="cleanups.length">
            <div class="chips">
              <button
                v-for="(c, i) in cleanups" :key="c.id"
                class="chip" :class="{ on: i === currentCleanup }"
                @click="selectCleanup(i)"
              >{{ formatDate(c.date_cleaned) }}</button>
            </div>

            <div
              class="compare"
              @pointerdown="dragging = true"
              @pointermove="onDrag"
              @pointerup="dragging = false"
              @pointerleave="dragging = false"
              @touchmove.prevent="onDrag"
            >
              <img class="img-before" :src="current.before_url" alt="Before cleanup" draggable="false" />
              <img
                class="img-after"
                :src="current.after_url"
                alt="After cleanup"
                draggable="false"
                :style="{ clipPath: 'inset(0 ' + (100 - pos) + '% 0 0)' }"
              />
              <div class="handle" :style="{ left: pos + '%' }">
                <div class="knob">⇄</div>
              </div>
              <span class="tag after">After</span>
              <span class="tag before">Before</span>
            </div>

            <p class="compare-hint">drag anywhere on the image</p>
            <p class="notes">{{ current.notes }}</p>
          </template>

          <p v-else class="sub">No cleanups recorded yet — your zone's first one is coming.</p>
        </section>

        <hr class="rule" />

        <!-- PAYMENTS -->
        <section class="block">
          <h2 class="block-title">Payments</h2>
          <template v-if="payments.length">
            <div v-for="p in payments" :key="p.id" class="ledger-row">
              <router-link :to="`/payment/success/${p.id}`" class="ref">
                #CS-{{ String(p.id).padStart(5, '0') }}
              </router-link>
              <span class="ledger-meta">{{ formatDate(p.created_at) }} · {{ p.method }}</span>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import api from '../../api.js'

const loading = ref(true)
const loadError = ref(false)
const data = ref({ hasZone: false, zone: null })
const payments = ref([])
const cleanups = ref([])
const progressDisplay = ref(0)

const currentCleanup = ref(0)
const pos = ref(50)
const dragging = ref(false)

const current = computed(() => cleanups.value[currentCleanup.value] || {})

const perMonth = computed(() => {
  if (!data.value.hasZone) return '—'
  const base = { small: 4000, medium: 7250, large: 11500 }[data.value.zone.plan] || 0
  return Math.round(base / data.value.zone.households)
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
  pos.value = 50
}

function onDrag(e) {
  if (e.type === 'pointermove' && !dragging.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
  pos.value = Math.min(97, Math.max(3, (x / rect.width) * 100))
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
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dash {
  position: relative;
  min-height: 100vh;
  background: #0b2a25;
  color: #f4f6f5;
  overflow-x: hidden;
}

/* AMBIENT LIGHT — the depth trick from Apple/Loopy product pages */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}
.glow-a {
  width: 640px; height: 640px;
  top: -220px; right: -140px;
  background: rgba(124, 179, 66, 0.16);
}
.glow-b {
  width: 520px; height: 520px;
  bottom: -160px; left: -180px;
  background: rgba(42, 74, 67, 0.55);
}

/* HERO */
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
  color: #7cb342;
}
.hero h1 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.6rem, 6.5vw, 4.4rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.04;
}
.hero-sub { margin: 1rem 0 0; color: #a0b0ac; font-size: 1.08rem; }

/* RAIL */
.rail {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
  display: grid;
  gap: 3.25rem;
}
.block { animation: rise .65s cubic-bezier(.22, 1, .36, 1) both; }
.block:nth-child(2) { animation-delay: .08s; }
.block:nth-child(3) { animation-delay: .16s; }

.block-title {
  margin: 0 0 1.5rem;
  font-family: 'Sora', sans-serif;
  font-size: .92rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
  color: #7cb342;
}
.sub { color: #a0b0ac; margin: .4rem 0 0; font-size: .95rem; }
.big-sub { color: #f4f6f5; font-size: 1.35rem; font-weight: 700; margin: 0; font-family: 'Sora', sans-serif; }
.text-btn { background: none; border: 0; color: #7cb342; font: inherit; font-weight: 600; cursor: pointer; }
.text-link { color: #7cb342; font-weight: 600; text-decoration: none; }

.rule { border: 0; border-top: 1px solid #1d3b35; margin: 0; }

/* ACTIVATION */
.stat-line { display: flex; align-items: baseline; gap: 1.4rem; flex-wrap: wrap; }
.mega {
  font-family: 'Sora', sans-serif;
  font-size: clamp(3.6rem, 11vw, 7rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.045em;
  background: linear-gradient(180deg, #f4f6f5 30%, #a0b0ac 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat-context { display: grid; gap: .15rem; }
.stat-strong { font-weight: 700; font-size: 1.18rem; font-family: 'Sora', sans-serif; }

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
  background: linear-gradient(90deg, #7cb342, #66bb6a);
  box-shadow: 0 0 20px rgba(124, 179, 66, 0.55);
  transition: width 1.3s cubic-bezier(.22, 1, .36, 1);
}

.action-row {
  display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
}
.status-line {
  font-size: .88rem; font-weight: 600;
  letter-spacing: .02em;
}
.status-line.paid { color: #7cb342; }
.status-line.pending { color: #ffca7a; }

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
}
.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(124, 179, 66, 0.55);
}

/* CLEANUPS */
.chips { display: flex; gap: .55rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.chip {
  padding: .5rem 1.25rem;
  border-radius: 999px;
  background: transparent;
  color: #a0b0ac;
  border: 1px solid #2a4a43;
  font-family: 'Sora', sans-serif;
  font-size: .82rem; font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}
.chip:hover { border-color: #7cb342; color: #f4f6f5; }
.chip.on {
  background: #7cb342;
  color: #0b2a25;
  border-color: #7cb342;
  box-shadow: 0 4px 14px rgba(124, 179, 66, 0.35);
}

/* DRAG-TO-COMPARE */
.compare {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  cursor: ew-resize;
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
.img-before { z-index: 1; }
.img-after { z-index: 2; }

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
  transition: transform .2s ease;
}
.compare:active .knob { transform: translate(-50%, -50%) scale(1.14); }

.tag {
  position: absolute; bottom: 1.1rem;
  z-index: 5;
  padding: .38rem 1.05rem;
  border-radius: 999px;
  font-size: .72rem; font-weight: 700;
  letter-spacing: .09em; text-transform: uppercase;
  backdrop-filter: blur(8px);
}
.tag.after  { left: 1.1rem; background: rgba(104, 159, 56, 0.85); color: #fff; }
.tag.before { right: 1.1rem; background: rgba(15, 15, 15, 0.6); color: #fff; }

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
}
.ref {
  color: #f4f6f5;
  font-weight: 700;
  font-family: 'Sora', sans-serif;
  text-decoration: none;
  border-bottom: 2px solid #7cb342;
  transition: color .2s;
}
.ref:hover { color: #7cb342; }
.ledger-meta { color: #a0b0ac; font-size: .9rem; }
.ledger-status {
  margin-left: auto;
  padding: .28rem .85rem;
  border-radius: 999px;
  font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .07em;
}
.ledger-status.completed { color: #7cb342; background: rgba(124, 179, 66, 0.13); }
.ledger-status.pending { color: #ffca7a; background: rgba(255, 202, 122, 0.1); }
.ledger-status.failed { color: #ff8a80; background: rgba(255, 138, 128, 0.1); }
.amount {
  font-family: 'Sora', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* SPINNER */
.spinner {
  width: 44px; height: 44px;
  margin: 3rem auto;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #7cb342;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
  .hero { padding-top: 3.5rem; }
  .rail { gap: 2.5rem; }
  .compare { aspect-ratio: 4 / 5; }
  .knob { width: 42px; height: 42px; }
}
</style>