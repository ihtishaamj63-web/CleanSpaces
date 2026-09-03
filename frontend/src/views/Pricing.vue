<template>
  <div class="pricing-page">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>

    <header class="hero">
      <p class="eyebrow">Pricing</p>
      <h1>One street. One price.<br />Split across your block.</h1>
      <p class="hero-sub">
        Zones are funded collectively — the monthly total is shared,
        so each household pays a fraction of what private cleanup would cost.
      </p>
    </header>

    <main class="rail">
      <section class="plans">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="plan"
          :class="{ featured: plan.featured }"
        >
          <p v-if="plan.featured" class="plan-flag">Most common</p>
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-fit">{{ plan.fit }}</p>

          <div class="plan-price">
            <span class="plan-total">{{ plan.range }}</span>
            <span class="plan-period">zone total / month</span>
          </div>
          <div class="plan-share">
            <span class="share-amount">±R{{ plan.share }}</span>
            <span class="share-label">per household, monthly</span>
          </div>

          <hr class="plan-rule" />

          <ul class="plan-includes">
            <li v-for="item in plan.includes" :key="item">{{ item }}</li>
          </ul>

          <router-link to="/signup" class="plan-cta">
            Start Your Zone
          </router-link>
        </div>
      </section>

      <hr class="rule" />

      <section class="block">
        <h2 class="block-title">How the price works</h2>
        <div class="explain">
          <div class="explain-row">
            <span class="explain-num">01</span>
            <div>
              <h3>Your zone picks a plan</h3>
              <p>A single street (Small) up to a full block (Large) — sized to what your community needs.</p>
            </div>
          </div>
          <div class="explain-row">
            <span class="explain-num">02</span>
            <div>
              <h3>The total is split</h3>
              <p>R3,500 across 62 households is about R56 each. Nobody carries it alone.</p>
            </div>
          </div>
          <div class="explain-row">
            <span class="explain-num">03</span>
            <div>
              <h3>60% unlocks weekly cleanups</h3>
              <p>Once six in ten households are contributing, the crew schedule starts. You watch it happen live on your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <hr class="rule" />

      <section class="block">
        <h2 class="block-title">Questions</h2>
        <div class="faq">
          <details v-for="q in faqs" :key="q.q">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
const plans = [
  {
    name: 'Small Zone',
    fit: 'Single street · 50–80 households',
    range: 'R3,500 – R4,500',
    share: 56,
    includes: [
      'Weekly scheduled cleanup',
      'Hazardous waste disposal',
      'Sanitisation of public spaces',
      'Photo proof of every cleanup',
      'Community progress dashboard'
    ],
    featured: false
  },
  {
    name: 'Medium Zone',
    fit: '2–3 blocks · 150–200 households',
    range: 'R6,500 – R8,000',
    share: 40,
    includes: [
      'Weekly scheduled cleanup',
      'Hazardous waste disposal',
      'Sanitisation of public spaces',
      'Photo proof of every cleanup',
      'Community progress dashboard',
      'Priority crew scheduling'
    ],
    featured: true
  },
  {
    name: 'Large Zone',
    fit: 'Full block · 300+ households',
    range: 'R10,000 – R13,000',
    share: 38,
    includes: [
      'Weekly scheduled cleanup',
      'Hazardous waste disposal',
      'Sanitisation of public spaces',
      'Photo proof of every cleanup',
      'Community progress dashboard',
      'Priority crew scheduling',
      'Quarterly deep-clean included'
    ],
    featured: false
  }
]

const faqs = [
  {
    q: 'Why is it so cheap per household?',
    a: 'Because the zone total is split across every contributing household. A private cleanup contractor charges R500+ per household — pooling brings your share down to a fraction of that.'
  },
  {
    q: 'What happens before the zone reaches 60%?',
    a: 'No money is spent and no cleanup is scheduled until your zone hits the 60% activation threshold. You can watch the progress live on your dashboard.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Card and EFT via PayFast. You\'ll never enter card details on our site — payments are processed on PayFast\'s PCI DSS Level 1 certified page.'
  },
  {
    q: 'Can we cancel?',
    a: 'Yes — contributions are month-to-month with no lock-in. Your zone simply pauses if participation drops below the threshold.'
  }
]
</script>

<style>
.pricing-page {
  position: relative;
  min-height: 100vh;
  background: #0b2a25;
  color: #f4f6f5;
  isolation: isolate;
}

.glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: -1;
}
.glow-a {
  width: 640px; height: 640px;
  top: -220px; right: -140px;
  background: rgba(124, 179, 66, 0.10);
}
.glow-b {
  width: 520px; height: 520px;
  bottom: -160px; left: -180px;
  background: rgba(42, 74, 67, 0.55);
}

.hero {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 1.5rem 3rem;
  text-align: center;
}
.eyebrow {
  margin: 0 0 .7rem;
  font-family: 'Sora', sans-serif;
  font-size: .78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .22em;
  color: #9ccc65;
}
.hero h1 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.06;
  color: #ffffff;
  text-shadow: 0 2px 30px rgba(11, 42, 37, 0.8);
}
.hero-sub {
  margin: 1.2rem auto 0;
  color: #c3d0cb;
  font-size: 1.08rem;
  max-width: 56ch;
}

.rail {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
  display: grid;
  gap: 3.25rem;
}
.block { animation: rise .65s cubic-bezier(.22, 1, .36, 1) both; }
.block:nth-child(2) { animation-delay: .08s; }
.block:nth-child(3) { animation-delay: .16s; }

.block-title {
  margin: 0 0 1.5rem;
  font-family: 'Sora', sans-serif;
  font-size: .92rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
  color: #9ccc65;
}

.rule { border: 0; border-top: 1px solid #1d3b35; margin: 0; }

.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  animation: rise .65s cubic-bezier(.22, 1, .36, 1) both;
}

.plan {
  position: relative;
  padding: 2rem 1.75rem 2.25rem;
  border-radius: 20px;
  background: rgba(18, 51, 45, 0.55);
  border: 1px solid #2a4a43;
  display: flex;
  flex-direction: column;
  transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
}
.plan:hover {
  transform: translateY(-5px);
  border-color: #7cb342;
}
.plan.featured {
  background: linear-gradient(170deg, rgba(124, 179, 66, 0.15), rgba(11, 42, 37, 0.75));
  border-color: rgba(124, 179, 66, 0.5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}
.plan.featured:hover {
  box-shadow: 0 24px 60px rgba(124, 179, 66, 0.2);
}

.plan-flag {
  position: absolute;
  top: -12px; left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: .28rem 1rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  font-family: 'Sora', sans-serif;
  font-size: .72rem; font-weight: 700;
  letter-spacing: .06em;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(124, 179, 66, 0.4);
}

.plan-name {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
}
.plan-fit {
  margin: .5rem 0 0;
  color: #c3d0cb;
  font-size: .88rem;
}

.plan-price { margin: 2rem 0 0; }
.plan-total {
  display: block;
  font-family: 'Sora', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.plan-period {
  display: block;
  color: #c3d0cb;
  font-size: .82rem;
  margin-top: .2rem;
}

.plan-share {
  margin: 1.25rem 0 0;
  padding: .9rem 1.1rem;
  border-radius: 12px;
  background: rgba(124, 179, 66, 0.12);
  border: 1px solid rgba(124, 179, 66, 0.3);
}
.share-amount {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #aed581;
}
.share-label {
  display: block;
  color: #c3d0cb;
  font-size: .78rem;
  margin-top: .15rem;
}

.plan-rule {
  border: 0;
  border-top: 1px solid #2a4a43;
  margin: 1.5rem 0;
}

.plan-includes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: .7rem;
  flex: 1;
}
.plan-includes li {
  font-size: .92rem;
  color: #d7e4de;
  padding-left: 1.5rem;
  position: relative;
}
.plan-includes li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #aed581;
  font-weight: 800;
}

.plan-cta {
  display: block;
  margin-top: 1.75rem;
  padding: .95rem 0;
  border-radius: 999px;
  text-align: center;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: .98rem;
  text-decoration: none;
  transition: all .25s ease;
}
.plan.featured .plan-cta {
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  box-shadow: 0 6px 26px rgba(124, 179, 66, 0.4);
}
.plan.featured .plan-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(124, 179, 66, 0.55);
}
.plan:not(.featured) .plan-cta {
  border: 1.5px solid #2a4a43;
  color: #d7e4de;
}
.plan:not(.featured) .plan-cta:hover {
  border-color: #9ccc65;
  color: #aed581;
}

.explain { display: grid; gap: 2.25rem; }
.explain-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}
.explain-num {
  font-family: 'Sora', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #2a4a43;
  -webkit-text-stroke: 1px #7cb342;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  line-height: 1.3;
}
.explain-row h3 {
  margin: 0 0 .3rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}
.explain-row p {
  margin: 0;
  color: #c3d0cb;
  font-size: .98rem;
  max-width: 64ch;
}

.faq { display: grid; gap: .75rem; }
.faq details {
  border: 1px solid #2a4a43;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  transition: border-color .25s ease;
  background: rgba(18, 51, 45, 0.35);
}
.faq details[open] { border-color: rgba(124, 179, 66, 0.4); }
.faq summary {
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  list-style: none;
  position: relative;
  padding-right: 2rem;
}
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after {
  content: '+';
  position: absolute;
  right: 0;
  color: #aed581;
  font-weight: 800;
  font-size: 1.2rem;
  transition: transform .25s ease;
}
.faq details[open] summary::after { transform: rotate(45deg); }
.faq details p {
  margin: .8rem 0 0;
  color: #c3d0cb;
  font-size: .95rem;
  line-height: 1.6;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
  .hero { padding-top: 3.5rem; }
  .rail { gap: 2.5rem; }
  .explain-row { flex-direction: column; gap: .5rem; }
}
</style>