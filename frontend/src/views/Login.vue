<template>
  <div class="login-page">
    <!-- Background Blur Overlay (click to close) -->
    <div class="modal-overlay" @click="closeLogin"></div>

    <div class="login-card">
      <!-- CLOSE (X) BUTTON -->
      <router-link to="/" class="close-btn" aria-label="Close login">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </router-link>

      <div class="brand-header">
        <img
          src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png"
          alt="CleanSpaces"
          class="logo"
        />
        <h1>Welcome Back</h1>
        <p>Sign in to your CleanSpaces account</p>
      </div>

      <!-- LOGIN FORM -->
      <form v-if="viewMode === 'login'" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-field">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <button class="toggle-password" type="button" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="loginForm.rememberMe" type="checkbox" />
            Remember me
          </label>
          <button class="text-button" type="button" @click="viewMode = 'forgot'">
            Forgot password?
          </button>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing In...' : 'Log In' }}
        </button>

        <div class="divider">
          <span>Or continue with</span>
        </div>

        <!-- Google Login (slot-based custom button, OAuth2 flow) -->
        <GoogleLogin
          :client-id="googleClientId"
          :callback="handleGoogleLogin"
          :error="handleGoogleError"
          popup-type="TOKEN"
        >
          <button class="btn-google" type="button" :disabled="isGoogleLoading">
            <svg class="google-icon" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {{ isGoogleLoading ? 'Signing In...' : 'Sign in with Google' }}
          </button>
        </GoogleLogin>

        <p class="footer-text">
          New to CleanSpaces? <router-link to="/signup">Create an account</router-link>
        </p>
      </form>

      <!-- FORGOT PASSWORD FORM -->
      <form v-else class="login-form" @submit.prevent="handleForgotPassword">
        <p class="reset-instruction">Enter your email to receive a secure password reset link.</p>

        <div class="form-group">
          <label for="reset-email">Email address</label>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="resetRequested" class="success-text">
          If an account exists for that email, a reset link has been sent.
        </p>

        <button class="btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <button class="text-button back-btn" type="button" @click="resetView">
          Back to login
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api.js'
import GoogleLogin from '../components/GoogleLogin.vue'

export default {
  name: 'LoginPage',
  components: { GoogleLogin },

  data() {
    return {
      viewMode: 'login', // 'login' or 'forgot'
      loginForm: {
        email: localStorage.getItem('savedEmail') || '',
        password: '',
        rememberMe: !!localStorage.getItem('savedEmail')
      },
      resetEmail: '',
      resetRequested: false,
      showPassword: false,
      isLoading: false,
      isGoogleLoading: false,
      errorMessage: '',
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      // Remember the body's overflow style so we can restore it later.
      previousBodyOverflow: ''
    }
  },

  mounted() {
    // Lock scrolling behind the modal.
    this.previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Close on Escape. This is a window listener, so it fires no matter
    // which element has focus.
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeUnmount() {
    // Clean up everything we added.
    document.body.style.overflow = this.previousBodyOverflow
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    onKeyDown(event) {
      if (event.key === 'Escape') this.closeLogin()
    },

    closeLogin() {
      // Send the user back to the home page (predictable, always works).
      this.$router.push('/')
    },

    resetView() {
      this.viewMode = 'login'
      this.errorMessage = ''
      this.resetRequested = false
    },

    /** Try to log in with email + password. */
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const { data } = await api.post('/auth/login', {
          email: this.loginForm.email,
          password: this.loginForm.password
        })

        if (!data.token || !data.user) {
          throw new Error('Invalid response from server')
        }

        // Store the session.
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)

        // Optionally remember the email so it pre-fills next time.
        if (this.loginForm.rememberMe) {
          localStorage.setItem('savedEmail', this.loginForm.email)
        } else {
          localStorage.removeItem('savedEmail')
        }

        // Send the user to their dashboard.
        this.$router.push(
          data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard'
        )
      } catch (error) {
        console.error('Login error:', error)
        this.errorMessage =
          error.response?.data?.message || 'Unable to log in. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    /** Request a password reset link. */
    async handleForgotPassword() {
      this.isLoading = true
      this.errorMessage = ''
      this.resetRequested = false

      try {
        await api.post('/auth/forgot-password', { email: this.resetEmail })
        this.resetRequested = true
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || 'Unable to send reset link. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Google sign-in handler.
     * Our GoogleLogin component uses the OAuth2 flow (access_token or code),
     * but we also accept a modern `credential` for forward-compatibility.
     */
    async handleGoogleLogin(response) {
      this.isGoogleLoading = true
      this.errorMessage = ''

      try {
        let payload = null
        if (response?.access_token) payload = { access_token: response.access_token }
        else if (response?.code)    payload = { code: response.code }
        else if (response?.credential) payload = { credential: response.credential }

        if (!payload) {
          throw new Error('No Google credential returned.')
        }

        const { data } = await api.post('/auth/google', payload)

        if (!data.token || !data.user) {
          throw new Error('Invalid response from Google auth')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)

        this.$router.push(
          data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard'
        )
      } catch (error) {
        console.error('Google login error:', error)
        this.errorMessage =
          error.response?.data?.message || 'Unable to sign in with Google.'
      } finally {
        this.isGoogleLoading = false
      }
    },

    /** Called by GoogleLogin when the popup fails or is cancelled. */
    handleGoogleError(error) {
      console.error('Google auth error:', error)
      this.isGoogleLoading = false
      this.errorMessage = 'Google sign-in was cancelled or failed.'
    }
  }
}
</script>

<style scoped>
/* --- The full-screen overlay --- */
.login-page {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 99999 !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* The blurred backdrop */
.modal-overlay {
  position: absolute !important;
  inset: 0 !important; /* top/right/bottom/left: 0 */
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

/* The login card */
.login-card {
  position: relative !important;
  width: 100% !important;
  max-width: 440px !important;
  padding: 2.5rem !important;
  background-color: #0b2b26 !important;
  border-radius: 16px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
  color: #ffffff !important;
  z-index: 10 !important;
  animation: cardPopIn 0.3s ease-out forwards;
}

@keyframes cardPopIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Close (X) button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 20;
  text-decoration: none;
}
.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* --- Brand header --- */
.brand-header {
  text-align: center;
  margin-bottom: 2rem;
}
.logo {
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.login-card h1 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  margin: 1rem 0 0.4rem !important;
  color: #ffffff !important;
}
.brand-header p {
  color: #a0aec0 !important;
  font-size: 0.9rem !important;
  margin: 0 !important;
}

/* --- Form fields --- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.login-form label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0 !important;
  text-align: left;
}
.login-form input:not([type='checkbox']) {
  width: 100%;
  padding: 0.85rem 1rem;
  color: #ffffff !important;
  background-color: #07201c !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  outline: none;
}
.login-form input:not([type='checkbox'])::placeholder {
  color: #718096 !important;
}
.login-form input:not([type='checkbox']):focus {
  border-color: #7cb342 !important;
}

/* Password field with the show/hide toggle */
.password-field {
  display: flex;
  align-items: stretch;
  position: relative;
}
.password-field input {
  padding-right: 3rem !important;
}
.toggle-password {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 1rem;
  color: #a0aec0 !important;
  background: transparent;
  border: none;
  cursor: pointer;
}
.toggle-password:hover {
  color: #7cb342 !important;
}

/* --- Remember me / Forgot password --- */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.remember-me {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  color: #a0aec0 !important;
}
.remember-me input[type="checkbox"] {
  accent-color: #7cb342 !important;
  cursor: pointer;
}
.text-button {
  color: #7cb342 !important;
  background: none;
  border: 0;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.text-button:hover {
  text-decoration: underline;
}

/* --- Primary button --- */
.btn-primary {
  padding: 0.9rem;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  color: #07201c !important;
  background-color: #7cb342 !important;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}
.btn-primary:hover:not(:disabled) {
  background-color: #8bc34a !important;
  transform: translateY(-2px);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* --- Divider --- */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  color: #a0aec0 !important;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* --- Google button (inside GoogleLogin slot) --- */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  background: transparent;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.btn-google:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}
.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* --- Messages & footer --- */
.footer-text {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #a0aec0 !important;
}
.footer-text a {
  color: #7cb342 !important;
  text-decoration: none;
  font-weight: 600;
}
.footer-text a:hover {
  text-decoration: underline;
}
.error-text {
  color: #ff9d91 !important;
  padding: 0.75rem;
  background: rgba(255, 100, 100, 0.1) !important;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}
.success-text {
  color: #a9e6b4 !important;
  padding: 0.75rem;
  background: rgba(124, 179, 66, 0.15) !important;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
}
.reset-instruction {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #a0aec0 !important;
  text-align: center;
}
.back-btn {
  margin-top: 0.5rem;
  text-align: center;
  color: #a0aec0 !important;
}
.back-btn:hover {
  color: #ffffff !important;
}
</style>