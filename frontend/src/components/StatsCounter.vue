<template>
  <section class="stats-section" aria-label="CleanSpaces impact so far">
    <div class="section-heading">
      <h2>Communities taking back their streets</h2>
      <p>Live numbers from the CleanSpaces platform.</p>
    </div>
    <div class="stats-grid">
      <article class="stat-card"><span class="stat-num">{{ display[0] }}</span><span class="stat-label">Active zones</span></article>
      <article class="stat-card"><span class="stat-num">{{ display[1] }}</span><span class="stat-label">Households funding cleanups</span></article>
      <article class="stat-card"><span class="stat-num">{{ display[2] }}</span><span class="stat-label">Cleanups completed</span></article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import api from '../api.js'

// Display values, animated from 0 up to the real counts.
const display = ref([0, 0, 0])
let raf = null

async function load() {
  try {
    const { data } = await api.get('/stats')
    animateTo([Number(data.active_zones) || 0, Number(data.households) || 0, Number(data.cleanups) || 0])
  } catch { /* stats are decorative — leave zeros rather than breaking the page */ }
}

// Ease-out count-up so the numbers sweep in.
function animateTo(targets, duration = 1200) {
  if (raf) cancelAnimationFrame(raf)
  const from = [...display.value]
  const start = performance.now()
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = targets.map((target, i) => Math.round(from[i] + (target - from[i]) * eased))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(load)
onUnmounted(() => raf && cancelAnimationFrame(raf))
</script>

<style scoped>
.stats-section { max-width: 1100px; margin: 0 auto; padding: 3rem 1rem; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem 1.5rem; text-align: center; box-shadow: var(--shadow-sm); }
.stat-num { display: block; font-family: var(--font-display); font-size: clamp(2.2rem, 5vw, 3.2rem); font-weight: 800; color: var(--green-dark); font-variant-numeric: tabular-nums; }
.stat-label { display: block; margin-top: .4rem; color: var(--text-muted); font-size: .9rem; text-transform: uppercase; letter-spacing: .08em; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }
</style>