<template>
  <div class="contact-page">
    <section class="hero-section">
      <h1>Contact Us</h1>
      <p class="hero-sub">Have questions or want to bring CleanSpaces to your street? Get in touch.</p>
    </section>

    <section class="content-section">
      <form class="contact-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Your Name</label>
          <input v-model="form.name" type="text" required placeholder="Full Name" />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="form.email" type="email" required placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input v-model="form.phone" type="tel" required placeholder="082 123 4567" />
        </div>
        <div class="form-group">
          <label>Subject</label>
          <input v-model="form.subject" type="text" required placeholder="Subject" />
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea v-model="form.message" rows="4" required placeholder="Your message..."></textarea>
        </div>
        <p v-if="successMsg" class="success-text">{{ successMsg }}</p>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Message' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import api from '../api.js'

export default {
  name: 'ContactPage',
  data() {
    return {
      form: { name: '', email: '', phone: '', subject: '', message: '' },
      loading: false,
      successMsg: '',
      errorMsg: ''
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.successMsg = ''
      this.errorMsg = ''
      try {
        await api.post('/contact', this.form)
        this.successMsg = 'Thank you! Your message has been sent successfully.'
        this.form = { name: '', email: '', phone: '', subject: '', message: '' }
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Failed to send message.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.contact-page {
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
  max-width: 600px;
  margin: 3rem auto 0;
  padding: 0 1.5rem;
}
.contact-form {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
}
.form-group input, .form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
}
.btn-submit {
  background: #7cb342;
  color: #ffffff;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}
.success-text {
  color: #2e7d32;
  background: #e8f5e9;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}
.error-text {
  color: #c62828;
  background: #ffebee;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}
</style>
