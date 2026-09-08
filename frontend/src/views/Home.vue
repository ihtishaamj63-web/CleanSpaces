<template>
  <div class="home">

    <!-- HERO SECTION -->
    <section class="hero-section">
      <div class="hero-glow"></div>
      <p class="hero-eyebrow">Cape Flats · Community-Powered</p>
      <h1>Making our communities shine</h1>
      <p class="hero-sub">Join the CleanSpaces movement in the Cape Flats.</p>
      <button class="hero-btn" @click="goToSignup">Get started</button>
    </section>

    <!-- STATS SECTION — live numbers from GET /api/stats -->
    <StatsCounter />

    <!-- MAP SECTION -->
    <section class="section-block">
      <div class="section-heading">
        <h2>Where we're working</h2>
        <p>Active and pending zones across the Cape Flats.</p>
      </div>
      <ZoneMap />
    </section>

    <!-- TESTIMONIALS SECTION — approved reviews from the API -->
    <section class="section-block testimonials" v-if="testimonials.length > 0">
      <div class="section-heading">
        <h2>What residents say</h2>
      </div>
      <div class="testimonial-carousel">
        <TestimonialCard
          v-for="t in testimonials"
          :key="t.id"
          :name="t.name"
          :quote="t.quote"
          :rating="t.rating"
        />
      </div>
    </section>

  </div>
</template>

<script>
import ZoneMap from '../components/ZoneMap.vue'
import TestimonialCard from '../components/TestimonialCard.vue'
import StatsCounter from '../components/StatsCounter.vue'
import api from '../api.js'

export default {
  components: { ZoneMap, TestimonialCard, StatsCounter },
  data() {
    return {
      testimonials: []
    }
  },
  mounted() {
    this.loadTestimonials()
  },
  methods: {
    goToSignup() {
      this.$router.push('/signup')
    },
    async loadTestimonials() {
      try {
        const res = await api.get('/testimonials')
        // testimonial endpoints wrap results: { success, data }
        this.testimonials = res.data.data || []
      } catch {
        // section simply stays hidden when there's nothing to show
      }
    }
  }
}
</script>

<style scoped>
.home {
  background: #F7F3E8;
  font-family: 'Work Sans', sans-serif;
  color: #17332C;
}

/* HERO */
.hero-section {
  position: relative;
  background: linear-gradient(165deg, #1E4B3D 0%, #122A24 85%);
  color: #F7F3E8;
  text-align: center;
  padding: 6rem 2rem 5.5rem;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(600px 400px at 80% -10%, rgba(232, 163, 61, .22), transparent 60%);
  pointer-events: none;
}
.hero-eyebrow {
  position: relative;
  margin: 0 0 1.1rem;
  color: #E8A33D;
  font-size: .9rem;
  font-weight: 600;
}
.hero-section h1 {
  position: relative;
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: clamp(2.2rem, 4.5vw, 3.4rem);
  line-height: 1.1;
  margin: 0 0 1.1rem;
  letter-spacing: -.01em;
  color: #ffffff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}
.hero-sub {
  position: relative;
  max-width: 480px;
  margin: 0 auto 2.2rem;
  color: #B9C9C2;
  font-size: 1.05rem;
}
.hero-btn {
  position: relative;
  background: linear-gradient(135deg, #F0B65A, #E0952E);
  color: #17332C;
  border: none;
  padding: .9rem 1.9rem;
  border-radius: 9px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}
.hero-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(224, 149, 46, .35); }

/* SECTION BLOCKS */
.section-block { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }
.section-heading { text-align: center; margin-bottom: 2.2rem; }
.section-heading h2 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  margin: 0 0 .5rem;
  font-size: 1.9rem;
  color: #17332C;
}
.section-heading p { margin: 0; color: #5E7269; }

/* TESTIMONIALS */
.testimonial-carousel { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }

@media (max-width: 600px) {
  .hero-section { padding: 4.5rem 1.5rem 4rem; }
}
</style>