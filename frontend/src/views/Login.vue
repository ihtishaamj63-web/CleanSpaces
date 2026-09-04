<template>
  <section class="login">
    <form @submit.prevent="submit">
      <p>CleanSpaces</p>
      <h1>Log in</h1>
      <label>Email<input v-model.trim="email" required type="email" autocomplete="email" /></label>
      <label>Password<input v-model="password" required type="password" autocomplete="current-password" /></label>
      <p v-if="message" class="error">{{ message }}</p>
      <button :disabled="loading">{{ loading ? 'Logging in...' : 'Log in' }}</button>
      <router-link to="/signup">Need an account?</router-link>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const message = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  message.value = ''
  try {
    const { data } = await api.post('/auth/login', { email: email.value, password: password.value })
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.user.role)
    window.dispatchEvent(new Event('auth-change'))
    router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard')
  } catch (error) {
    message.value = error.response?.data?.message || 'Unable to log in.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login { min-height:65vh; display:grid; place-items:center; padding:2rem; }
.login form { width:min(400px,100%); padding:2rem; background:#fff; border:1px solid var(--border); border-radius:12px; }
.login p { color:var(--green); font-weight:800; }.login h1 { color:var(--green-dark); }
label { display:grid; gap:.35rem; margin:1rem 0; font-weight:700; } input { padding:.7rem; border:1px solid var(--border); border-radius:7px; }
button { width:100%; padding:.75rem; border:0; border-radius:7px; background:var(--green); font-weight:800; color:var(--green-deeper); cursor:pointer; }
.login a { display:block; margin-top:1rem; text-align:center; color:var(--green-dark); }.error { color:#9b2525!important; }
</style>
