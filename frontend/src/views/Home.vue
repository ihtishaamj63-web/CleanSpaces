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

    <!-- STATS SECTION -->
    <section class="stats-counter">
      <div class="stat-item">
        <h3>120+</h3>
        <p>Active zones</p>
      </div>
      <div class="stat-item">
        <h3>850</h3>
        <p>Volunteers</p>
      </div>
      <div class="stat-item">
        <h3>2.5k</h3>
        <p>Cleanups done</p>
      </div>
    </section>

    <!-- MAP SECTION -->
    <section class="section-block">
      <div class="section-heading">
        <h2>Where we're working</h2>
        <p>Active and pending zones across the Cape Flats.</p>
      </div>
      <ZoneMap />
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section class="section-block testimonials" v-if="testimonials.length > 0">
      <div class="section-heading">
        <h2>What residents say</h2>
      </div>
      
      <div class="testimonial-carousel">
        <div v-for="t in testimonials" :key="t.id" class="testimonial-card">
          <p class="quote">&ldquo;{{ t.quote }}&rdquo;</p>
          <p class="author">— {{ t.name }}</p>
          <p class="rating" aria-hidden="true">{{ '★'.repeat(t.rating) }}{{ '☆'.repeat(5 - t.rating) }}</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import ZoneMap from '../components/ZoneMap.vue'

export default {
  components: {
    ZoneMap,
  },
  data() {
    return {
      testimonials: []
    }
  },
  mounted() {
    this.testimonials = []
  },
  methods: {
    goToSignup() {
      this.$router.push('/signup')
    },
    loadTestimonials() {
      this.testimonials = []
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
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: clamp(2.2rem, 4.5vw, 3.4rem);
  line-height: 1.1;
  margin: 0 0 1.1rem;
  letter-spacing: -.01em;
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

/* STATS */
.stats-counter {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: #FFFFFF;
  padding: 2.5rem 1.5rem;
  box-shadow: 0 4px 20px rgba(18, 42, 36, 0.06);
}
.stat-item { text-align: center; }
.stat-item h3 {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 2.2rem;
  margin: 0;
  color: #1E4B3D;
  position: relative;
  display: inline-block;
}
.stat-item h3::after {
  content: '';
  display: block;
  width: 32px;
  height: 3px;
  margin: .4rem auto 0;
  background: #E8A33D;
  border-radius: 2px;
}
.stat-item p { margin: .5rem 0 0; color: #5E7269; font-size: .92rem; }

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
.testimonial-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 1.9rem;
  border: 1px solid rgba(30, 75, 61, 0.08);
  box-shadow: 0 8px 22px rgba(18, 42, 36, .05);
}
.quote { font-style: italic; color: #2E3D39; margin: 0 0 1rem; line-height: 1.55; }
.author { font-weight: 600; margin: 0; color: #17332C; }
.rating { color: #E8A33D; margin: .35rem 0 0; letter-spacing: .05em; }

@media (max-width: 600px) {
  .hero-section { padding: 4.5rem 1.5rem 4rem; }
}
</style>