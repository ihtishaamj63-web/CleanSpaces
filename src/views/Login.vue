<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const form = ref({ email: '', password: '' })
const error = ref('')

function submit() {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please enter your email and password.'
    return
  }
  const admin = form.value.email.toLowerCase() === 'admin@cleanspaces.co.za'
  error.value = ''
  router.push(admin ? '/admin' : '/resident')
}
</script>

<template>
  <div class="auth">
    <div class="auth-card card">
      <div class="auth-head">
        <a class="tabs">
          <RouterLink to="/login" class="tab active">Sign in</RouterLink>
          <RouterLink to="/signup" class="tab">Sign up</RouterLink>
        </a>
      </div>

      <div class="auth-body">
        <div class="leaf-badge">🍃</div>
        <h2>Welcome back</h2>
        <p class="sub">Sign in to your zone dashboard or admin panel.</p>

        <form class="form" @submit.prevent="submit">
          <label>
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input v-model="form.password" type="password" placeholder="••••••••" required />
          </label>
          <div class="row-between">
            <RouterLink to="/login" class="forgot">Forgot password?</RouterLink>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" class="btn btn-green btn-block">Sign in</button>
        </form>

        <div class="hint">
          <strong>Demo accounts</strong>
          <span>Admin: admin@cleanspaces.co.za</span>
          <span>Resident: thandiwe@gmail.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/auth.css';
</style>
