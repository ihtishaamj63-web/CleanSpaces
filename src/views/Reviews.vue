<script setup>
import { ref, computed } from 'vue'
import TestimonialCard from '../components/TestimonialCard.vue'

const testimonials = ref([
  { id: 1, name: 'Thandiwe Mbeki', quote: 'Our street finally looks like a place kids can play safely. CleanSpaces turned months of frustration into action.', rating: 5, status: 'approved' },
  { id: 2, name: 'Sipho Daniels', quote: 'Transparent, consistent and genuinely community-led. The weekly cleanups are something we now rely on.', rating: 5, status: 'approved' },
  { id: 3, name: 'Noluthando Gqola', quote: 'Seeing the before and after photos each week kept everyone motivated. The whole block joined in.', rating: 4, status: 'approved' },
  { id: 4, name: 'Lena Adams', quote: 'Worth every rand. Our corner dump site is now a green patch the kids play on.', rating: 5, status: 'pending' },
])

const photos = [
  { before: 'linear-gradient(135deg,#8a7a68,#5d5145)', after: 'linear-gradient(135deg,#54936b,#2e5138)', label: 'Manenberg — street corner' },
  { before: 'linear-gradient(135deg,#9a8877,#6d5f4f)', after: 'linear-gradient(135deg,#5f9c76,#376044)', label: "Mitchell's Plain — open lot" },
  { before: 'linear-gradient(135deg,#7d6f60,#4f4539)', after: 'linear-gradient(135deg,#63a17d,#3a6548)', label: 'Khayelitsha — drainage canal' },
  { before: 'linear-gradient(135deg,#88776a,#574a3f)', after: 'linear-gradient(135deg,#4f8d68,#2e5942)', label: 'Manenberg — playground edge' },
]

const isAdmin = ref(false)
const newFeedback = ref({ name: '', quote: '', rating: 5 })
const submitted = ref(false)

const approved = computed(() => testimonials.value.filter((t) => t.status === 'approved'))
const pending = computed(() => testimonials.value.filter((t) => t.status === 'pending'))
const average = computed(() => {
  const a = approved.value
  if (!a.length) return '—'
  return (a.reduce((s, t) => s + t.rating, 0) / a.length).toFixed(1)
})

function submit() {
  testimonials.value.push({
    id: Date.now(),
    name: newFeedback.value.name,
    quote: newFeedback.value.quote,
    rating: Number(newFeedback.value.rating),
    status: 'pending',
  })
  submitted.value = true
  newFeedback.value = { name: '', quote: '', rating: 5 }
  setTimeout(() => (submitted.value = false), 3500)
}

function moderate(id, status) {
  const t = testimonials.value.find((x) => x.id === id)
  if (t) t.status = status
}
</script>

<template>
  <div class="reviews">
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow white">Reviews</span>
        <h1>Proof it works — <br />straight from the streets.</h1>
        <p>Before and after photos from our completed cleanups, plus the words of the residents we serve.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="rate-bar">
          <span class="avg">{{ average }}</span>
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ on: n <= Math.round(Number(average)) }">★</span>
          </div>
          <span class="count">Based on {{ approved.length }} approved reviews</span>
        </div>

        <div class="grid photo-grid">
          <div v-for="(p, i) in photos" :key="i" class="photo">
            <div class="ph before" :style="{ background: p.before }"><span>Before</span></div>
            <div class="ph after" :style="{ background: p.after }"><span>After</span></div>
            <p>{{ p.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section dark">
      <div class="container">
        <div class="t-head">
          <div>
            <span class="eyebrow white">Testimonials</span>
            <h2>What residents are saying</h2>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="isAdmin" />
            <span class="slider"></span>
            Admin view {{ isAdmin ? 'on' : 'off' }}
          </label>
        </div>

        <div v-if="isAdmin && pending.length" class="pending">
          <h3>Pending — awaiting moderation</h3>
          <div v-for="t in pending" :key="t.id" class="pend-card">
            <div>
              <strong>{{ t.name }}</strong> <span class="stars-sm">★ {{ t.rating }}</span>
              <p>“{{ t.quote }}”</p>
            </div>
            <div class="pend-actions">
              <button class="btn btn-lime" @click="moderate(t.id, 'approved')">Approve</button>
              <button class="btn btn-ghost-w" @click="moderate(t.id, 'rejected')">Reject</button>
            </div>
          </div>
        </div>

        <div class="t-grid">
          <TestimonialCard
            v-for="t in approved"
            :key="t.id"
            :name="t.name"
            :quote="t.quote"
            :rating="t.rating"
          />
        </div>

        <div class="submit-row">
          <h3>Share your experience</h3>
          <form class="form" @submit.prevent="submit">
            <input v-model="newFeedback.name" required placeholder="Your name" />
            <div class="rating-pick">
              <span>Rating:</span>
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="star-btn"
                :class="{ on: n <= newFeedback.rating }"
                @click="newFeedback.rating = n"
              >★</button>
            </div>
            <textarea v-model="newFeedback.quote" required placeholder="Tell us about your experience…"></textarea>
            <button type="submit" class="btn btn-cream">Submit review</button>
          </form>
          <p v-if="submitted" class="success">Thanks! Your review will appear once approved. 🌿</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rate-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.avg {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  color: var(--green-deep);
}
.stars { color: var(--brown-line); font-size: 1.4rem; letter-spacing: 2px; }
.star.on { color: #c9a227; }
.count { color: var(--ink-soft); font-size: 0.9rem; }

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}
.photo {
  position: relative;
  height: 240px;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.ph { position: absolute; inset: 0; display: flex; align-items: flex-end; }
.ph span {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: #fff; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 999px; margin: 14px;
}
.ph.before { clip-path: polygon(0 0, 52% 0, 52% 100%, 0 100%); }
.ph.after { clip-path: polygon(52% 0, 100% 0, 100% 100%, 52% 100%); }
.photo p {
  position: absolute;
  bottom: 12px;
  right: 14px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0,0,0,0.4);
  z-index: 2;
}

.dark {
  background: var(--green-dark);
  color: var(--cream);
}
.dark h2, .dark h3 { color: var(--cream); }
.t-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 30px;
}
.eyebrow.white { color: var(--lime); }
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--green-chalk);
  cursor: pointer;
}
.toggle input { display: none; }
.slider {
  width: 44px; height: 24px; border-radius: 99px;
  background: rgba(255,255,255,0.15); position: relative; transition: 0.2s;
}
.slider::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  border-radius: 50%; background: var(--cream); transition: 0.2s;
}
.toggle input:checked + .slider { background: var(--moss); }
.toggle input:checked + .slider::after { left: 23px; }

.pending { margin-bottom: 30px; }
.pending h3 { color: var(--lime); font-size: 1rem; margin-bottom: 14px; }
.pend-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(220,233,212,0.16);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.pend-card p { color: var(--green-chalk); font-size: 0.92rem; margin-top: 4px; }
.stars-sm { color: #c9a227; }
.pend-actions { display: flex; gap: 8px; }
.btn-ghost-w {
  background: transparent; color: var(--cream);
  border: 1px solid rgba(255,255,255,0.3);
}
.btn-ghost-w:hover { background: rgba(255,255,255,0.08); }

.t-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
.t-grid :deep(.t-card) {
  background: rgba(255,255,255,0.06);
  border-color: rgba(220,233,212,0.16);
}
.t-grid :deep(.quote) { color: var(--cream-soft); }
.t-grid :deep(.nm) { color: var(--cream); }

.submit-row {
  margin-top: 44px;
  max-width: 560px;
}
.submit-row h3 { margin-bottom: 16px; }
.form {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(220,233,212,0.16);
  border-radius: var(--radius);
  padding: 24px;
  display: grid;
  gap: 14px;
}
.form input, .form textarea {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(220,233,212,0.2);
  background: rgba(255,255,255,0.06);
  color: var(--cream);
  outline: none;
  font-size: 0.95rem;
  resize: vertical;
}
.form textarea { min-height: 90px; }
.form input::placeholder, .form textarea::placeholder { color: rgba(220,233,212,0.5); }
.rating-pick { display: flex; align-items: center; gap: 6px; color: var(--green-chalk); font-size: 0.9rem; }
.star-btn {
  background: none; font-size: 1.4rem; color: rgba(255,255,255,0.2);
  transition: 0.15s; padding: 0;
}
.star-btn.on { color: #c9a227; }
.success {
  margin-top: 12px; background: var(--moss); color: #fff;
  padding: 12px; border-radius: 12px; text-align: center; font-weight: 600;
}
@media (max-width: 800px) {
  .photo-grid { grid-template-columns: 1fr; }
  .t-grid { grid-template-columns: 1fr; }
}
</style>
