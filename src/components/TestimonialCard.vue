<script setup>
defineProps({
  name: { type: String, required: true },
  quote: { type: String, required: true },
  rating: { type: Number, default: 5 },
})
</script>

<template>
  <div class="t-card">
    <div class="stars" aria-label="rating">
      <span v-for="n in 5" :key="n" class="star" :class="{ on: n <= rating }">★</span>
    </div>
    <p class="quote">“{{ quote }}”</p>
    <div class="who">
      <span class="avatar">{{ name.charAt(0) }}</span>
      <span class="nm">{{ name }}</span>
    </div>
  </div>
</template>

<style scoped>
.t-card {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius);
  padding: 26px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}
.stars { color: var(--brown-line); letter-spacing: 2px; margin-bottom: 14px; }
.star.on { color: #c9a227; }
.quote {
  font-family: var(--font-display);
  font-size: 1.08rem;
  color: var(--ink);
  flex: 1;
}
.who {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--green);
  color: var(--cream);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
}
.nm { font-weight: 600; color: var(--green-deep); }
</style>
