<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand-header">
        <img
          src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png"
          alt="CleanSpaces"
          class="logo"
        />
        <h1>Welcome Back!</h1>
        <p>Sign in to access your CleanSpaces account.</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label for="email">Email *</label>
        <input id="email" v-model="loginForm.email" type="email" autocomplete="email" required />

        <label for="password">Password *</label>
        <div class="password-field">
          <input
            id="password"
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            class="toggle-password"
            type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <label class="remember-me">
          <input v-model="loginForm.rememberMe" type="checkbox" />
          Remember me
        </label>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing In...' : 'Log In' }}
        </button>

        <p class="footer-text">Don't have an account? <router-link to="/signup">Register here</router-link></p>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        email: localStorage.getItem('savedEmail') || '',
        password: '',
        rememberMe: !!localStorage.getItem('savedEmail')
      },
      showPassword: false,
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const { data } = await api.post('/auth/login', {
          email: this.loginForm.email,
          password: this.loginForm.password
        })

        // Store the session (token + role drive the router guards and nav)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)
        if (this.loginForm.rememberMe) localStorage.setItem('savedEmail', this.loginForm.email)
        else localStorage.removeItem('savedEmail')

        // Each role lands on its own home surface
        this.$router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard')
      } catch (error) {
        this.errorMessage = error.response?.data?.message
          || (error.code === 'ERR_NETWORK'
            ? 'Cannot reach the server. Make sure the backend is running.'
            : 'Unable to log in. Please try again.')
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: #f4f6f5; }
.login-card { width: min(100%, 440px); padding: 2.5rem; color: #ffffff; background: #12332d; border-radius: 18px; box-shadow: 0 20px 45px rgba(0, 0, 0, .22); }
.brand-header { text-align: center; margin-bottom: 2rem; }
.logo { width: 76px; height: 76px; object-fit: contain; background: white; border-radius: 50%; padding: 6px; }
h1 { margin: 1rem 0 .4rem; }
.brand-header p, .login-form p { color: #b9c9c2; }
.login-form { display: grid; gap: .7rem; }
.login-form input:not([type='checkbox']) { width: 100%; padding: .8rem; color: white; background: #0b2a25; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; box-sizing: border-box; }
.password-field { display: flex; align-items: stretch; }
.password-field input { flex: 1; min-width: 0; border-radius: 8px 0 0 8px !important; }
.toggle-password { padding: 0 .9rem; color: #8bc34a; background: #0b2a25; border: 1px solid rgba(255,255,255,.2); border-left: 0; border-radius: 0 8px 8px 0; cursor: pointer; }
.remember-me { display: flex; gap: .5rem; align-items: center; margin-top: .4rem; }
.btn-primary { padding: .85rem; border: 0; border-radius: 8px; font-weight: 700; cursor: pointer; color: #0b2a25; background: #7cb342; }
.btn-primary:hover:not(:disabled) { background: #8bc34a; }
.btn-primary:disabled { opacity: .6; cursor: wait; }
.footer-text { text-align: center; }
a { color: #8bc34a; }
.error-text { color: #ff9d91 !important; }
</style>