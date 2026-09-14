<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const steps = [
  {
    icon: '🤝',
    title: 'Gather your community',
    text: 'Talk to your neighbours and identify the streets or blocks that need the most care. All you need is a shared goal and a WhatsApp group.',
  },
  {
    icon: '🗺️',
    title: 'Choose your plan',
    text: 'Pick the zone size that fits — a single street, a few blocks, or a full estate. Each plan covers weekly cleans, hazardous waste, sanitisation and photo proof.',
  },
  {
    icon: '📝',
    title: 'Register your zone',
    text: 'Submit your zone name, suburb, household count and contact details. Our team reviews and activates your zone so residents can start paying in.',
  },
  {
    icon: '🧹',
    title: 'Weekly cleanups',
    text: 'Our crew runs the cleanup every week. Before and after photos are uploaded so everyone in your zone can see the progress in real time.',
  },
]

const showRegister = ref(false)

const form = ref({
  zoneName: '',
  suburb: '',
  households: '',
  plan: 'small',
  contactName: '',
  contactPhone: '',
})

function submit() {
  showRegister.value = true
  form.value = { zoneName: '', suburb: '', households: '', plan: 'small', contactName: '', contactPhone: '' }
  setTimeout(() => (showRegister.value = false), 4000)
}
</script>

<template>
  <div class="hiw">
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow white">How it works</span>
        <h1>From dirty streets to <br />clean neighbourhoods.</h1>
        <p>Four simple steps turn your community into the driving force behind its own weekly cleanups.</p>
      </div>
    </section>

    <section class="section">
      <div class="container steps">
        <div v-for="(s, i) in steps" :key="i" class="step">
          <div class="step-top">
            <span class="icon">{{ s.icon }}</span>
            <span class="num">0{{ i + 1 }}</span>
          </div>
          <h2>{{ s.title }}</h2>
          <p>{{ s.text }}</p>
        </div>
      </div>
    </section>

    <section class="section register">
      <div class="container">
        <div class="reg-grid">
          <div class="reg-copy">
            <span class="eyebrow">Get started</span>
            <h2>Register your zone today</h2>
            <p>Tell us a little about your neighbourhood and we’ll get your zone set up. New zones start as
            pending and are activated once approved by our team.</p>
            <ul>
              <li>No upfront hardware or long contracts</li>
              <li>Photo proof after every cleanup</li>
              <li>Support from our local crew</li>
            </ul>
          </div>
          <div class="reg-card">
            <form class="form" @submit.prevent="submit">
              <label>
                <span>Zone name</span>
                <input v-model="form.zoneName" required placeholder="e.g. Manenberg Zone A" />
              </label>
              <label>
                <span>Suburb</span>
                <input v-model="form.suburb" required placeholder="e.g. Manenberg" />
              </label>
              <div class="row">
                <label>
                  <span>Households</span>
                  <input v-model="form.households" type="number" required placeholder="e.g. 80" />
                </label>
                <label>
                  <span>Plan</span>
                  <select v-model="form.plan">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Contact name</span>
                <input v-model="form.contactName" required placeholder="Your name" />
              </label>
              <label>
                <span>Contact phone</span>
                <input v-model="form.contactPhone" required placeholder="e.g. 082 123 4567" />
              </label>
              <button type="submit" class="btn btn-green btn-block">Register zone</button>
            </form>
            <p v-if="showRegister" class="success">Zone submitted! Our team will review it shortly. 🌿</p>
          </div>
        </div>
        <div class="center" style="margin-top:44px;">
          <RouterLink to="/pricing" class="btn btn-green">Compare plans & pricing</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}
.step {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}
.step-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.icon {
  font-size: 2.2rem;
  background: var(--green-dark);
  width: 62px;
  height: 62px;
  border-radius: 16px;
  display: grid;
  place-items: center;
}
.num {
  font-family: var(--font-display);
  font-size: 2.4rem;
  color: var(--brown-line);
  font-weight: 700;
}
.step h2 { font-size: 1.4rem; margin-bottom: 10px; }
.step p { color: var(--ink-soft); }

.register { background: var(--cream-deep); }
.reg-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 46px;
  align-items: start;
}
.reg-copy h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); margin-bottom: 14px; }
.reg-copy p { color: var(--ink-soft); margin-bottom: 20px; max-width: 480px; }
.reg-copy ul { list-style: none; }
.reg-copy li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: var(--green-deep);
  font-weight: 500;
}
.reg-copy li::before {
  content: '✓';
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--green);
  color: var(--cream);
  display: inline-grid;
  place-items: center;
  font-size: 0.75rem;
  flex: none;
}
.reg-card {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius-lg);
  padding: 30px;
  box-shadow: var(--shadow);
}
.form { display: grid; gap: 16px; }
.form label { display: grid; gap: 6px; }
.form span { font-size: 0.85rem; font-weight: 600; color: var(--green-deep); }
.form input, .form select {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--brown-line);
  background: var(--white);
  font-size: 0.95rem;
  color: var(--ink);
  outline: none;
  transition: border 0.15s ease, box-shadow 0.15s ease;
}
.form input:focus, .form select:focus {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(107, 143, 78, 0.15);
}
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.success {
  margin-top: 14px;
  background: var(--green-chalk);
  color: var(--green-deep);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
}
@media (max-width: 880px) {
  .steps { grid-template-columns: 1fr; }
  .reg-grid { grid-template-columns: 1fr; }
}
</style>
