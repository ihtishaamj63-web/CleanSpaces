<template>
  <div class="pricing-page">
    <header class="hero">
      <p class="eyebrow">Pricing</p>
      <h1>One street. One price.<br />Split across your block.</h1>
      <p class="hero-sub">
        Zones are funded collectively — each household's share is set so the zone
        is fully funded once 60% of households are contributing.
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
            <span class="share-amount">{{ plan.share }}</span>
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
              <p>A single street (Small) up to a neighbourhood section (Large) — sized to what your community needs. Households include backyard dwellings and flats, so streets hold more contributors than they look.</p>
            </div>
          </div>
          <div class="explain-row">
            <span class="explain-num">02</span>
            <div>
              <h3>The total is split</h3>
              <p>Each household's share is set so the zone is fully funded at 60% — roughly R105 each on a 65-household street. Nobody carries it alone.</p>
            </div>
          </div>
          <div class="explain-row">
            <span class="explain-num">03</span>
            <div>
              <h3>60% unlocks weekly cleanups</h3>
              <p>Once six in ten households are contributing, the zone is fully funded and the crew schedule starts. You watch it happen live on your dashboard.</p>
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
// Share ranges use threshold pricing (plan total ÷ 60% of households),
// consistent with the backend's config/plans.js and the proposal document.
const plans = [
  {
    name: 'Small Zone',
    fit: 'Single street · 50–80 households',
    range: 'R3,500 – R4,500',
    share: '±R85 – R130',
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
    fit: '2–3 streets · 150–200 households',
    range: 'R6,500 – R8,000',
    share: '±R60 – R80',
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
    fit: 'Neighbourhood section · 300+ households',
    range: 'R10,000 – R13,000',
    share: 'from R64',
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
    a: 'Because the zone total is split across the households needed to reach the 60% activation threshold — and Cape Flats streets hold more households than they look, once backyard dwellings and flats are counted. A private cleanup contractor charges R500+ per household; pooling brings your share down to a fraction of that.'
  },
  {
    q: 'What happens before the zone reaches 60%?',
    a: 'No money is spent and no cleanup is scheduled until your zone hits the 60% activation threshold. You can watch the progress live on your dashboard — and at 60%, your zone is fully funded for the month.'
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

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: #f7faf8;
  color: #183b28;
}

/* HERO — the same gradient band as the other public pages */
.hero {
  position: relative;
  text-align: center;
  padding: 90px 8% 70px;
  background: linear-gradient(135deg, #eaf6ed 0%, #f7fbf8 55%, #dff0e5 100%);
  overflow: hidden;
}

/* decorative circles, matching the About/Reviews heroes */
.hero::before {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(76, 175, 112, 0.08);
  right: -80px;
  top: -80px;
}
.hero::after {
  content: "";
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(76, 175, 112, 0.15);
  right: 12%;
  bottom: -60px;
}

.eyebrow {
  position: relative;
  margin: 0 0 16px;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero h1 {
  position: relative;
  margin: 0;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1.05;
  letter-spacing: -3px;
  font-weight: 800;
  color: #173b27;
}

.hero-sub {
  position: relative;
  margin: 22px auto 0;
  color: #5e7165;
  font-size: 17px;
  line-height: 1.7;
  max-width: 56ch;
}

.rail {
  position: relative;
  max-width: 1150px;
  margin: 0 auto;
  padding: 70px 20px 90px;
  display: grid;
  gap: 70px;
}
.block { animation: rise .65s cubic-bezier(.22, 1, .36, 1) both; }
.block:nth-child(2) { animation-delay: .08s; }
.block:nth-child(3) { animation-delay: .16s; }

.block-title {
  margin: 0 0 32px;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.rule { border: 0; border-top: 1px solid #e6eee8; margin: 0; }

/* PLAN CARDS — white cards on the light background */
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  animation: rise .65s cubic-bezier(.22, 1, .36, 1) both;
}

.plan {
  position: relative;
  padding: 2rem 1.75rem 2.25rem;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e4eee7;
  box-shadow: 0 8px 22px rgba(31, 89, 54, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
}
.plan:hover {
  transform: translateY(-5px);
  border-color: #62b987;
  box-shadow: 0 18px 40px rgba(31, 89, 54, 0.12);
}
.plan.featured {
  background: linear-gradient(170deg, #e9f7ed 0%, #ffffff 65%);
  border-color: #bfe3cc;
  box-shadow: 0 20px 50px rgba(31, 89, 54, 0.12);
}
.plan.featured:hover {
  box-shadow: 0 24px 60px rgba(31, 89, 54, 0.16);
}

.plan-flag {
  position: absolute;
  top: -12px; left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: .28rem 1rem;
  border-radius: 999px;
  background: #176b3a;
  color: #ffffff;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .06em;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(23, 107, 58, 0.3);
}

.plan-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #173b27;
}
.plan-fit {
  margin: .5rem 0 0;
  color: #718077;
  font-size: .88rem;
}

.plan-price { margin: 2rem 0 0; }
.plan-total {
  display: block;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #173b27;
}
.plan-period {
  display: block;
  color: #8a978f;
  font-size: .82rem;
  margin-top: .2rem;
}

.plan-share {
  margin: 1.25rem 0 0;
  padding: .9rem 1.1rem;
  border-radius: 12px;
  background: #e9f7ed;
  border: 1px solid #bfe3cc;
}
.share-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #176b3a;
}
.share-label {
  display: block;
  color: #66736b;
  font-size: .78rem;
  margin-top: .15rem;
}

.plan-rule {
  border: 0;
  border-top: 1px solid #e6eee8;
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
  color: #294635;
  padding-left: 1.5rem;
  position: relative;
}
.plan-includes li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #198044;
  font-weight: 800;
}

.plan-cta {
  display: block;
  margin-top: 1.75rem;
  padding: .95rem 0;
  border-radius: 999px;
  text-align: center;
  font-weight: 700;
  font-size: .98rem;
  text-decoration: none;
  transition: all .25s ease;
}
.plan.featured .plan-cta {
  background: #176b3a;
  color: #ffffff;
  box-shadow: 0 6px 26px rgba(23, 107, 58, 0.25);
}
.plan.featured .plan-cta:hover {
  transform: translateY(-2px);
  background: #1e6040;
  box-shadow: 0 10px 32px rgba(23, 107, 58, 0.3);
}
.plan:not(.featured) .plan-cta {
  border: 2px solid #bfe3cc;
  color: #176b3a;
}
.plan:not(.featured) .plan-cta:hover {
  border-color: #198044;
  background: rgba(25, 128, 68, 0.06);
}

/* HOW THE PRICE WORKS */
.explain { display: grid; gap: 2.25rem; }
.explain-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}
.explain-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: #d5ecdd;
  -webkit-text-stroke: 1px #62b987;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  line-height: 1.3;
}
.explain-row h3 {
  margin: 0 0 .3rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #173b27;
}
.explain-row p {
  margin: 0;
  color: #66736b;
  font-size: .98rem;
  max-width: 64ch;
  line-height: 1.7;
}

/* FAQ — white cards */
.faq { display: grid; gap: .75rem; }
.faq details {
  border: 1px solid #e0e8e2;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  transition: border-color .25s ease, box-shadow .25s ease;
  background: #ffffff;
}
.faq details[open] {
  border-color: #62b987;
  box-shadow: 0 12px 30px rgba(37, 91, 60, 0.08);
}
.faq summary {
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  color: #173b27;
  list-style: none;
  position: relative;
  padding-right: 2rem;
}
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after {
  content: '+';
  position: absolute;
  right: 0;
  color: #198044;
  font-weight: 800;
  font-size: 1.2rem;
  transition: transform .25s ease;
}
.faq details[open] summary::after { transform: rotate(45deg); }
.faq details p {
  margin: .8rem 0 0;
  color: #66736b;
  font-size: .95rem;
  line-height: 1.7;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
  .hero { padding: 70px 7% 55px; }
  .rail { gap: 50px; padding-top: 55px; }
  .explain-row { flex-direction: column; gap: .5rem; }
}
</style>