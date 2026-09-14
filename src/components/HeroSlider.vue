<script setup>
import { ref } from 'vue'

const slides = [
  {
    beforeTone: 'linear-gradient(135deg, #8a7a68, #5d5145)',
    afterTone: 'linear-gradient(135deg, #54936b, #2e5138)',
    label: 'Manenberg Zone A',
    years: 'After 6 weeks',
  },
  {
    beforeTone: 'linear-gradient(135deg, #9a8877, #6d5f4f)',
    afterTone: 'linear-gradient(135deg, #5f9c76, #376044)',
    label: 'Mitchell’s Plain Blocks 4–6',
    years: 'After 12 weeks',
  },
  {
    beforeTone: 'linear-gradient(135deg, #7d6f60, #4f4539)',
    afterTone: 'linear-gradient(135deg, #63a17d, #3a6548)',
    label: 'Khayelitsha Site C',
    years: 'After 8 weeks',
  },
]

const index = ref(0)
const timer = setInterval(() => {
  index.value = (index.value + 1) % slides.length
}, 5000)
</script>

<template>
  <div class="slider">
    <div class="frame">
      <div
        class="slide before"
        :style="{ background: slides[index].beforeTone }"
      >
        <span class="tag">Before</span>
        <span class="label">{{ slides[index].label }}</span>
      </div>
      <div
        class="slide after"
        :style="{ background: slides[index].afterTone }"
      >
        <span class="tag">After</span>
        <span class="years">{{ slides[index].years }}</span>
      </div>
      <div class="divider" :style="{ left: index % 2 === 0 ? '52%' : '48%' }">
        <span class="knob">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l-4 6 4 6M15 6l4 6-4 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
    <div class="dots">
      <button
        v-for="(s, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === index }"
        @click="index = i"
        :aria-label="`Slide ${i + 1}`"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.slider { width: 100%; }
.frame {
  position: relative;
  height: 320px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 26px;
  color: #fff;
}
.slide.before {
  clip-path: polygon(0 0, 52% 0, 52% 100%, 0 100%);
  transition: clip-path 0.9s ease;
}
.slide.after {
  clip-path: polygon(52% 0, 100% 0, 100% 100%, 52% 100%);
  transition: clip-path 0.9s ease;
}
.slide .tag {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.25);
  padding: 6px 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}
.slide.after .tag { left: auto; right: 20px; }
.slide .label {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.35);
}
.slide .years {
  font-size: 0.85rem;
  opacity: 0.95;
  text-align: right;
  position: absolute;
  bottom: 26px;
  right: 26px;
  font-weight: 600;
}
.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
  transition: left 0.9s ease;
}
.knob {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--green);
  color: var(--cream);
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-sm);
}
.dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 18px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: var(--brown);
  opacity: 0.35;
  transition: all 0.25s ease;
  padding: 0;
}
.dot.active {
  width: 24px;
  opacity: 1;
  background: var(--green);
}
</style>
