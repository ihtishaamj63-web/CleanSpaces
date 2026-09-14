<script setup>
import { RouterLink } from 'vue-router'

const team = [
  { name: 'Ihtishaam', role: 'Co-Founder & Operations Director', bio: 'Keeps every weekly cleanup running on schedule.', initials: 'IH' },
  { name: 'Krishendree', role: 'Co-Founder & Strategy Director', bio: 'Sets the vision and growth path for the Cape Flats.', initials: 'KR' },
  { name: 'Sibongile', role: 'Co-Founder & Marketing Director', bio: 'Tells the story of every clean street we build.', initials: 'SB' },
  { name: 'Mubaarik', role: 'Co-Founder & Customer Experience Director', bio: 'Makes sure every community feels supported.', initials: 'MU' },
]
</script>

<template>
  <div class="about">
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow white">About us</span>
        <h1>We believe clean spaces <br />build stronger people.</h1>
        <p>CleanSpaces was born on the Cape Flats — a community-led initiative that organises, funds and
        verifies weekly neighbourhood cleanups in Manenberg, Mitchell’s Plain and Khayelitsha.</p>
      </div>
    </section>

    <section class="section">
      <div class="container two-col">
        <div class="miss-copy">
          <span class="eyebrow">Our mission</span>
          <h2>A sustainable way for any neighbourhood to stay clean</h2>
          <p>
            Too often, waste piles up and no one is accountable. CleanSpaces flips that: residents come
            together, subscribe to a plan that fits their zone, and our crew delivers a dependable weekly
            cleanup — with photo proof uploaded so everyone can see the difference.
          </p>
          <p>
            We’re not a charity and we’re not an anonymous service. We’re neighbours, organisers and
            workers building a model that communities own and trust.
          </p>
          <RouterLink to="/reviews" class="btn btn-green">See the difference</RouterLink>
        </div>
        <div class="miss-card">
          <div class="miss-num">2023</div>
          <p><strong>Founded</strong> — CleanSpaces starts with its first street pilot in Manenberg.</p>
        </div>
      </div>
    </section>

    <section class="section team">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Meet the team</span>
          <h2>The people behind the mission</h2>
        </div>
        <div class="team-grid">
          <div v-for="m in team" :key="m.name" class="member">
            <div class="avatar">{{ m.initials }}</div>
            <h3>{{ m.name }}</h3>
            <span class="role">{{ m.role }}</span>
            <p>{{ m.bio }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.two-col {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 46px;
  align-items: center;
}
.miss-copy h2 { font-size: clamp(1.8rem, 3vw, 2.5rem); margin-bottom: 16px; }
.miss-copy p { color: var(--ink-soft); margin-bottom: 16px; max-width: 560px; }
.miss-copy .btn { margin-top: 8px; }
.miss-card {
  background: var(--green);
  border-radius: var(--radius-lg);
  padding: 44px 34px;
  color: var(--cream);
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}
.miss-card::before {
  content: '🍃';
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 3rem;
  opacity: 0.25;
}
.miss-num {
  font-family: var(--font-display);
  font-size: 3.4rem;
  font-weight: 700;
  color: var(--lime);
  line-height: 1;
  margin-bottom: 12px;
}
.miss-card p strong { display: block; color: var(--cream); margin-bottom: 4px; }
.miss-card p { color: var(--green-chalk); }

.team { background: var(--cream-deep); }
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.member {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.avatar {
  width: 74px;
  height: 74px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-mid), var(--green-deep));
  color: var(--lime);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}
.member h3 { font-size: 1.15rem; }
.role {
  display: block;
  color: var(--moss);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 6px 0 10px;
}
.member p { color: var(--ink-soft); font-size: 0.92rem; }

@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .team-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .team-grid { grid-template-columns: 1fr; }
}
</style>
