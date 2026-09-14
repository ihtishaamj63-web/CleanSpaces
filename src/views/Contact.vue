<script setup>
import { ref } from 'vue'

const sent = ref(false)
const form = ref({ name: '', email: '', phone: '', subject: '', message: '' })

const faqs = [
  { q: 'How fast can my zone be activated?', a: 'Most zones go live within a few days of approval. You need at least 60% of households subscribed for the zone to activate.' },
  { q: 'What happens during a weekly cleanup?', a: 'Our crew removes litter and waste, disposes of hazardous items safely, sanitises the area and uploads before/after photos to your zone feed.' },
  { q: 'How do payments work?', a: 'Residents pay a monthly subscription through PayFast. Payments are secure, and admins can track who has paid against the 60% activation target.' },
  { q: 'Can I join if my street is small?', a: 'Absolutely. Our Small Zone plan covers a single street of 50–80 households, from R3,500 per month.' },
  { q: 'How do I see the results?', a: 'Every cleanup is documented with photographed proof that’s visible on the resident dashboard and here on the site.' },
]

const open = ref(0)

function submit() {
  sent.value = true
  form.value = { name: '', email: '', phone: '', subject: '', message: '' }
  setTimeout(() => (sent.value = false), 4000)
}
</script>

<template>
  <div class="contact">
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow white">Contact</span>
        <h1>We’d love to hear <br />from you.</h1>
        <p>Questions, partnerships or ready to register your zone? Reach out — we usually reply within a day.</p>
      </div>
    </section>

    <section class="section">
      <div class="container contact-grid">
        <div class="info">
          <div class="card info-card">
            <span class="ic">📧</span>
            <h3>Email us</h3>
            <a href="mailto:cleanspaces@gmail.com">cleanspaces@gmail.com</a>
          </div>
          <div class="card info-card">
            <span class="ic">💬</span>
            <h3>WhatsApp</h3>
            <a href="https://wa.me/27000000000" target="_blank" rel="noopener" class="btn btn-green">Chat with us</a>
          </div>
          <div class="card info-card">
            <span class="ic">📍</span>
            <h3>Serving</h3>
            <p>Cape Town — Manenberg, Mitchell’s Plain & Khayelitsha</p>
          </div>
        </div>

        <div class="card form-card">
          <h2>Send a message</h2>
          <form class="form" @submit.prevent="submit">
            <div class="row">
              <label>
                <span>Name</span>
                <input v-model="form.name" required placeholder="Your name" />
              </label>
              <label>
                <span>Email</span>
                <input v-model="form.email" type="email" required placeholder="you@example.com" />
              </label>
            </div>
            <div class="row">
              <label>
                <span>Phone</span>
                <input v-model="form.phone" placeholder="082 123 4567" />
              </label>
              <label>
                <span>Subject</span>
                <input v-model="form.subject" required placeholder="What is it about?" />
              </label>
            </div>
            <label>
              <span>Message</span>
              <textarea v-model="form.message" required placeholder="Tell us more…"></textarea>
            </label>
            <button type="submit" class="btn btn-green">Send message</button>
          </form>
          <p v-if="sent" class="success">Message sent! We’ll get back to you soon. 🌿</p>
        </div>
      </div>
    </section>

    <section class="section faq-sec">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">FAQs</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div class="faq">
          <div v-for="(f, i) in faqs" :key="i" class="faq-item" :class="{ open: open === i }">
            <button class="faq-q" @click="open = open === i ? -1 : i">
              <span>{{ f.q }}</span>
              <span class="chev">{{ open === i ? '−' : '+' }}</span>
            </button>
            <div class="faq-a" v-show="open === i">
              <p>{{ f.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 34px;
  align-items: start;
}
.info { display: grid; gap: 18px; }
.info-card { text-align: center; }
.info-card .ic { font-size: 2rem; display: block; margin-bottom: 10px; }
.info-card h3 { font-size: 1.15rem; margin-bottom: 8px; }
.info-card a { color: var(--green-deep); font-weight: 600; }
.info-card p { color: var(--ink-soft); font-size: 0.9rem; }
.info-card .btn { margin-top: 8px; }
.form-card h2 { margin-bottom: 18px; }
.form { display: grid; gap: 16px; }
.form label { display: grid; gap: 6px; }
.form span { font-size: 0.85rem; font-weight: 600; color: var(--green-deep); }
.form input, .form textarea {
  padding: 12px 14px; border-radius: 12px; border: 1px solid var(--brown-line);
  background: var(--white); font-size: 0.95rem; color: var(--ink); outline: none;
  transition: border 0.15s ease, box-shadow 0.15s ease; resize: vertical;
}
.form input:focus, .form textarea:focus {
  border-color: var(--moss); box-shadow: 0 0 0 3px rgba(107,143,78,0.15);
}
.form textarea { min-height: 120px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.success {
  margin-top: 14px; background: var(--green-chalk); color: var(--green-deep);
  padding: 12px; border-radius: 12px; text-align: center; font-weight: 600;
}

.faq-sec { background: var(--cream-deep); }
.faq { max-width: 760px; margin: 0 auto; }
.faq-item {
  background: var(--cream-soft); border: 1px solid var(--brown-line);
  border-radius: 12px; margin-bottom: 12px; overflow: hidden;
}
.faq-q {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  gap: 14px; padding: 18px 20px; background: none; font-size: 1rem;
  font-weight: 600; color: var(--green-deep); text-align: left;
}
.chev {
  width: 26px; height: 26px; flex: none; border-radius: 50%;
  background: var(--green); color: var(--cream); display: grid; place-items: center;
}
.faq-a { padding: 0 20px 18px; color: var(--ink-soft); }
@media (max-width: 800px) {
  .contact-grid { grid-template-columns: 1fr; }
  .row { grid-template-columns: 1fr; }
}
</style>
