<script setup>
import { RouterLink } from 'vue-router'

const plans = [
  {
    name: 'Small Zone',
    desc: 'A single street',
    range: '50–80 households',
    price: 'R3,500',
    priceMax: 'R4,500',
    perHousehold: 'R50–R70 / month',
    popular: false,
    features: ['Weekly cleanup', 'Hazardous waste disposal', 'Sanitisation', 'Photo proof'],
  },
  {
    name: 'Medium Zone',
    desc: '2–3 blocks',
    range: '150–200 households',
    price: 'R6,500',
    priceMax: 'R8,000',
    perHousehold: 'R35–R45 / month',
    popular: true,
    features: ['Weekly cleanup', 'Hazardous waste disposal', 'Sanitisation', 'Photo proof', 'Priority scheduling'],
  },
  {
    name: 'Large Zone',
    desc: 'Full estate or area',
    range: '300+ households',
    price: 'R10,000',
    priceMax: 'R13,000',
    perHousehold: 'R30–R40 / month',
    popular: false,
    features: ['Weekly cleanup', 'Hazardous waste disposal', 'Sanitisation', 'Photo proof', 'Priority scheduling', 'Dedicated crew lead'],
  },
]

const note = [
  'Extra household at no charge',
  'Flexible activation at 60% paid households',
  'Cancel anytime with notice',
]
</script>

<template>
  <div class="pricing">
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow white">Pricing</span>
        <h1>Simple plans that fit <br />your neighbourhood.</h1>
        <p>Every plan includes photo-proven weekly cleanups and full waste care. No hidden fees.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="notes">
          <div v-for="n in note" :key="n" class="note-chip">✓ {{ n }}</div>
        </div>

        <div class="plans">
          <div
            v-for="p in plans"
            :key="p.name"
            class="plan"
            :class="{ popular: p.popular }"
          >
            <div v-if="p.popular" class="ribbon">Most popular</div>
            <div class="plan-head">
              <h2>{{ p.name }}</h2>
              <span class="desc">{{ p.desc }}</span>
              <span class="range">{{ p.range }}</span>
              <div class="price">
                <span class="amount">{{ p.price }}</span>
                <span class="sep">–</span>
                <span class="amount">{{ p.priceMax }}</span>
              </div>
              <span class="per">{{ p.perHousehold }} per household</span>
            </div>
            <ul class="features">
              <li v-for="f in p.features" :key="f">✓ {{ f }}</li>
            </ul>
            <RouterLink to="/signup" class="btn btn-green btn-block">Choose {{ p.name.split(' ')[0] }}</RouterLink>
          </div>
        </div>

        <p class="fineprint">
          All prices in South African Rand (ZAR). Payments are processed securely through
          PayFast <span class="muted">(sandbox in development, live in production)</span>.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.notes {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 44px;
}
.note-chip {
  background: var(--green-chalk);
  color: var(--green-deep);
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
}
.plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}
.plan {
  position: relative;
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.plan:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
.plan.popular {
  border: 2px solid var(--green);
  background: #fff;
}
.ribbon {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--moss);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 7px 18px;
  border-radius: 999px;
}
.plan-head { border-bottom: 1px solid var(--brown-line); padding-bottom: 20px; margin-bottom: 20px; }
.plan-head h2 { font-size: 1.5rem; }
.desc { color: var(--moss); font-weight: 600; display: block; margin-top: 4px; }
.range { color: var(--ink-soft); font-size: 0.9rem; display: block; margin-top: 2px; }
.price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 18px;
}
.amount {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--green-deep);
}
.sep { color: var(--brown); font-size: 1.4rem; }
.per {
  display: inline-block;
  margin-top: 8px;
  background: var(--green-chalk);
  color: var(--green-deep);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
}
.features { list-style: none; margin-bottom: 26px; flex: 1; }
.features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
  border-bottom: 1px dashed var(--brown-line);
}
.features li::before {
  content: '✓';
  width: 20px;
  height: 20px;
  flex: none;
  border-radius: 50%;
  background: var(--green);
  color: var(--cream);
  display: inline-grid;
  place-items: center;
  font-size: 0.7rem;
}
.fineprint {
  text-align: center;
  margin-top: 36px;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.muted { opacity: 0.7; }
@media (max-width: 880px) {
  .plans { grid-template-columns: 1fr; }
}
</style>
