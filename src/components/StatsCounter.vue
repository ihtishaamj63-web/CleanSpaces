<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  start: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
})

const display = ref(0)
let raf = null

function animate() {
  const duration = 1600
  const from = 0
  const to = props.start
  const t0 = performance.now()
  const step = (t) => {
    const p = Math.min((t - t0) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    display.value = Math.floor(from + (to - from) * eased)
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

onMounted(animate)
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <span class="counter">{{ display.toLocaleString() }}{{ suffix }}</span>
</template>
