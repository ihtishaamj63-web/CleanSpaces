<script setup>
import { RouterLink } from 'vue-router'
import HeroSlider from '../components/HeroSlider.vue'
import ZoneMap from '../components/ZoneMap.vue'
import StatsCounter from '../components/StatsCounter.vue'
import TestimonialCard from '../components/TestimonialCard.vue'

const testimonials = [
  { name: 'Thandiwe Mbeki', quote: 'Our street finally looks like a place kids can play safely. CleanSpaces turned months of frustration into action.', rating: 5 },
  { name: 'Sipho Daniels', quote: 'Transparent, consistent and genuinely community-led. The weekly cleanups are something we now rely on.', rating: 5 },
  { name: 'Noluthando Gqola', quote: 'Seeing the before and after photos each week kept everyone motivated. The whole block joined in.', rating: 4 },
]

const steps = [
  { n: '01', t: 'Gather your community', d: 'Get your neighbours on board and agree on the areas that need the most care.' },
  { n: '02', t: 'Choose your plan', d: 'Pick the zone size that fits your street or blocks — from R3,500 per month.' },
  { n: '03', t: 'Register your zone', d: 'Tell us where you are and how many households are involved. That’s it.' },
  { n: '04', t: 'Weekly cleanups', d: 'Our crew starts the weekly cycle and you get photo proof of every cleanup.' },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <span class="leaf" style="top:18%;left:6%;">🍃</span>
      <span class="leaf" style="top:60%;right:8%;animation-delay:1.2s;">🌿</span>
      <span class="leaf" style="bottom:14%;left:44%;animation-delay:2.4s;">🌱</span>
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow white">Community-led waste care • Cape Flats</span>
          <h1>Cleaner streets. <br /><em>Stronger communities.</em></h1>
          <p>
            CleanSpaces brings neighbours together to fund and run weekly cleanups in Manenberg,
            Mitchell’s Plain and Khayelitsha — with photo proof of every single one.
          </p>
          <div class="hero-actions">
            <RouterLink to="/signup" class="btn btn-lime">Join a zone</RouterLink>
            <RouterLink to="/how-it-works" class="btn btn-cream">See how it works</RouterLink>
          </div>
          <div class="hero-trust">
            <span class="dot"></span> Trusted by 300+ households
          </div>
        </div>
        <div class="hero-visual">
          <HeroSlider />
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="section stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat">
            <StatsCounter start="8" />
            <span class="stat-label">Active zones</span>
          </div>
          <div class="stat">
            <StatsCounter start="310" suffix="+" />
            <span class="stat-label">Households subscribed</span>
          </div>
          <div class="stat">
            <StatsCounter start="1240" suffix="+" />
            <span class="stat-label">Cleanups completed</span>
          </div>
          <div class="stat">
            <span class="stat-num">92<em>%</em></span>
            <span class="stat-label">Community satisfaction</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="section">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Our footprint</span>
          <h2>Live across the Cape Flats</h2>
          <p>Every dot is a neighbourhood we are working with. Click a pin to see its status and size.</p>
        </div>
        <ZoneMap />
      </div>
    </section>

    <!-- How it works -->
    <section class="section how">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Simple by design</span>
          <h2>How CleanSpaces works</h2>
        </div>
        <div class="steps">
          <div v-for="s in steps" :key="s.n" class="step">
            <span class="step-num">{{ s.n }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Word on the street</span>
          <h2>Loved by the communities we serve</h2>
        </div>
        <div class="t-grid">
          <TestimonialCard
            v-for="t in testimonials"
            :key="t.name"
            :name="t.name"
            :quote="t.quote"
            :rating="t.rating"
          />
        </div>
        <div class="center" style="margin-top:40px;">
          <RouterLink to="/reviews" class="btn btn-green">Read all reviews</RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-band">
      <div class="container cta-inner">
        <div>
          <h2>Ready to see your street shine?</h2>
          <p>Join hundreds of households keeping their neighbourhoods clean.</p>
        </div>
        <RouterLink to="/signup" class="btn btn-cream">Get started today</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  background: var(--green-deep);
  color: var(--cream);
  padding: 150px 0 90px;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(800px 400px at 80% 10%, rgba(107, 143, 78, 0.25), transparent),
    radial-gradient(600px 350px at 0% 100%, rgba(63, 107, 75, 0.35), transparent);
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-copy h1 {
  color: var(--cream);
  font-size: clamp(2.5rem, 5vw, 3.9rem);
  margin-bottom: 20px;
}
.hero-copy h1 em {
  font-style: italic;
  color: var(--lime);
}
.hero-copy p {
  color: var(--green-chalk);
  font-size: 1.12rem;
  max-width: 480px;
  margin-bottom: 30px;
}
.eyebrow.white { color: var(--lime); }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-trust {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--green-chalk);
  font-size: 0.9rem;
}
.hero-trust .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #7ed99a; box-shadow: 0 0 0 4px rgba(126,217,154,0.18);
}

/* Stats */
.stats { padding-top: 44px; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.stat {
  text-align: center;
  background: var(--green);
  color: var(--cream);
  border-radius: var(--radius);
  padding: 30px 16px;
  box-shadow: var(--shadow-sm);
}
.stat :deep(.counter) {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--lime);
  display: block;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-num {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--lime);
  display: block;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-num em { font-size: 1.6rem; font-style: normal; }
.stat-label {
  font-size: 0.85rem;
  color: var(--green-chalk);
  letter-spacing: 0.03em;
}

/* How it works */
.how { background: var(--cream-deep); }
.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}
.step {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}
.step-num {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--moss);
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}
.step h3 { font-size: 1.15rem; margin-bottom: 8px; }
.step p { color: var(--ink-soft); font-size: 0.95rem; }

/* Testimonials */
.t-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

/* CTA */
.cta-band {
  background: var(--green);
  color: var(--cream);
  padding: 64px 0;
}
.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
}
.cta-inner h2 { color: var(--cream); font-size: 2rem; }
.cta-inner p { color: var(--green-chalk); margin-top: 4px; }

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .steps { grid-template-columns: repeat(2, 1fr); }
  .t-grid { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .steps { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
