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

      <form v-if="viewMode === 'login'" class="login-form" @submit.prevent="handleLogin">
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
        <button class="text-button" type="button" @click="viewMode = 'forgot'">Forgot your password?</button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing In...' : 'Log In' }}
        </button>

        <div class="divider">Or, Login with</div>
        <GoogleLogin :callback="handleGoogleLogin" :error="handleGoogleError" popup-type="TOKEN">
          <button class="btn-google" type="button" :disabled="isGoogleLoading">
            <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {{ isGoogleLoading ? 'Signing In...' : 'Sign in with Google' }}
          </button>
        </GoogleLogin>
        <p class="footer-text">Don't have an account? <router-link to="/signup">Register here</router-link></p>
      </form>

      <form v-else class="login-form" @submit.prevent="handleForgotPassword">
        <p>Enter your email to generate a password reset link.</p>
        <label for="reset-email">Email address</label>
        <input id="reset-email" v-model="resetEmail" type="email" autocomplete="email" required />
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="resetLink" class="success-text">
          Reset link created: <router-link :to="resetLinkPath">Open reset page</router-link>
        </p>
        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Creating Link...' : 'Create Reset Link' }}
        </button>
        <button class="text-button" type="button" @click="resetView">Back to login</button>
      </form>
    </div>
  </div>
</template>

<script>
import { GoogleLogin } from 'vue3-google-login'

export default {
  name: 'LoginPage',
  components: { GoogleLogin },
  data() {
    return {
      viewMode: 'login',
      loginForm: { email: localStorage.getItem('savedEmail') || '', password: '', rememberMe: !!localStorage.getItem('savedEmail') },
      resetEmail: '',
      resetLink: '',
      showPassword: false,
      isLoading: false,
      isGoogleLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    resetLinkPath() {
      return this.resetLink ? new URL(this.resetLink).pathname + new URL(this.resetLink).search : '/login'
    }
  },
  methods: {
    resetView() {
      this.viewMode = 'login'
      this.errorMessage = ''
      this.resetLink = ''
    },
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: this.loginForm.email, password: this.loginForm.password }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Login failed.')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)
        if (this.loginForm.rememberMe) localStorage.setItem('savedEmail', this.loginForm.email)
        else localStorage.removeItem('savedEmail')
        this.$router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard')
      } catch (error) {
        this.errorMessage = error.message || 'Unable to login. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    async handleForgotPassword() {
      this.isLoading = true
      this.errorMessage = ''
      this.resetLink = ''
      try {
        const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: this.resetEmail }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to create reset link.')
        this.resetLink = data.resetLink || ''
        if (!this.resetLink) this.errorMessage = 'No account was found for that email address.'
      } catch (error) {
        this.errorMessage = error.message || 'Unable to create reset link.'
      } finally {
        this.isLoading = false
      }
    },
    async handleGoogleLogin(response) {
      this.isGoogleLoading = true
      this.errorMessage = ''
      try {
        const credential = response.credential || response.access_token
        if (!credential) throw new Error('No Google credential returned.')
        const body = response.credential ? { credential } : { access_token: credential }
        const apiResponse = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await apiResponse.json()
        if (!apiResponse.ok) throw new Error(data.message || 'Google sign-in failed.')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)
        this.$router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard')
      } catch (error) {
        this.errorMessage = error.message || 'Unable to sign in with Google.'
      } finally {
        this.isGoogleLoading = false
      }
    },
    handleGoogleError() {
      this.isGoogleLoading = false
      this.errorMessage = 'Google sign-in was cancelled or failed.'
    }
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: #f7f3e8; }
.login-card { width: min(100%, 440px); padding: 2.5rem; color: #f7f3e8; background: #12332d; border-radius: 18px; box-shadow: 0 20px 45px rgba(0, 0, 0, .22); }
.brand-header { text-align: center; margin-bottom: 2rem; }
.logo { width: 76px; height: 76px; object-fit: contain; background: white; border-radius: 50%; padding: 6px; }
h1 { margin: 1rem 0 .4rem; }
.brand-header p, .login-form p { color: #b9c9c2; }
.login-form { display: grid; gap: .7rem; }
.login-form input:not([type='checkbox']) { width: 100%; padding: .8rem; color: white; background: #0b2a25; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; box-sizing: border-box; }
.password-field { display: flex; align-items: stretch; }
.password-field input { flex: 1; min-width: 0; border-radius: 8px 0 0 8px !important; }
.toggle-password { padding: 0 .9rem; color: #f0a52b; background: #0b2a25; border: 1px solid rgba(255,255,255,.2); border-left: 0; border-radius: 0 8px 8px 0; cursor: pointer; }
.remember-me { display: flex; gap: .5rem; align-items: center; margin-top: .4rem; }
.text-button { padding: 0; color: #f0a52b; background: none; border: 0; text-align: left; cursor: pointer; }
.btn-primary, .btn-google { padding: .85rem; border: 0; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-primary { color: #12332d; background: #f0a52b; }
.btn-google { display: flex; width: fit-content; min-width: 220px; margin: 0 auto; align-items: center; justify-content: center; gap: .65rem; color: #12332d; background: white; }
.google-icon { width: 20px; height: 20px; flex: 0 0 20px; }
.btn-primary:disabled, .btn-google:disabled { opacity: .6; cursor: wait; }
.divider { margin: .6rem 0; color: #b9c9c2; text-align: center; }
.footer-text { text-align: center; }
a { color: #f0a52b; }
.error-text { color: #ff9d91 !important; }
.success-text { color: #a9e6b4 !important; }
</style>
