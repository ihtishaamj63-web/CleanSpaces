<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const form = ref({ name: '', email: '', phone: '', password: '', confirm: '' })
const error = ref('')

function submit() {
  if (form.value.password !== form.value.confirm) {
    error.value = 'Passwords do not match.'
    return
  }
  if (!form.value.name || !form.value.email) {
    error.value = 'Please fill in your name and email.'
    return
  }
  error.value = ''
  router.push('/resident')
}
</script>

<template>
  <div class="auth">
    <div class="auth-card card">
      <div class="auth-head">
        <div class="tabs">
          <RouterLink to="/login" class="tab">Sign in</RouterLink>
          <RouterLink to="/signup" class="tab active">Sign up</RouterLink>
        </div>
      </div>

      <div class="auth-body">
        <div class="leaf-badge">🌱</div>
        <h2>Create your account</h2>
        <p class="sub">Every signup creates a resident — no role needed.</p>

        <form class="form" @submit.prevent="submit">
          <label>
            <span>Full name</span>
            <input v-model="form.name" placeholder="Your name" required />
          </label>
          <label>
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Phone</span>
            <input v-model="form.phone" placeholder="082 123 4567" required />
          </label>
          <label>
            <span>Password</span>
            <input v-model="form.password" type="password" placeholder="Choose a password" required />
          </label>
          <label>
            <span>Confirm password</span>
            <input v-model="form.confirm" type="password" placeholder="Repeat password" required />
          </label>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" class="btn btn-green btn-block">Create account</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/auth.css';
</style>
