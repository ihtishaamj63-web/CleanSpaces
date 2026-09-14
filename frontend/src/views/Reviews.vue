<template>
  <div class="reviews-page">
    <section class="hero-section">
      <h1>Resident Reviews</h1>
      <p class="hero-sub">Read stories and testimonials from residents across all active cleanup zones.</p>
    </section>

    <section class="content-section">
      <div v-if="testimonials.length > 0" class="reviews-grid">
        <TestimonialCard
          v-for="t in testimonials"
          :key="t.id"
          :name="t.name"
          :quote="t.quote"
          :rating="t.rating"
        />
      </div>
      <p v-else class="no-reviews">No reviews available yet.</p>
    </section>
  </div>
</template>

<script>
import TestimonialCard from '../components/TestimonialCard.vue'
import api from '../api.js'

export default {
  name: 'ReviewsPage',
  components: { TestimonialCard },
  data() {
    return { testimonials: [] }
  },
  async mounted() {
    try {
      const res = await api.get('/testimonials')
      this.testimonials = res.data.data || []
    } catch (err) {
      console.warn('Failed to load testimonials:', err.message)
    }
  }
}
</script>

<style scoped>
.reviews-page {
  background: #F7F3E8;
  color: #17332C;
  min-height: 100vh;
  padding-bottom: 4rem;
}
.hero-section {
  background: linear-gradient(165deg, #1E4B3D 0%, #122A24 85%);
  color: #ffffff;
  text-align: center;
  padding: calc(100px + 2rem) 1.5rem 4rem;
}
.hero-section h1 {
  font-family: 'Fraunces', serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.hero-sub {
  color: #B9C9C2;
  font-size: 1.1rem;
}
.content-section {
  max-width: 1000px;
  margin: 3rem auto 0;
  padding: 0 1.5rem;
}
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
.no-reviews {
  text-align: center;
  color: #718096;
}
</style>
