<template>
  <div class="login-page">
    <!-- Background Effects -->
    <div class="bg-glow"></div>
    <div class="bg-texture"></div>

    <!-- Login Card -->
    <div class="login-card">
      <!-- Brand Header -->
      <div class="brand-header">
        <div class="logo-wrapper">
          <img
            src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png"
            alt="CleanSpaces"
            class="logo"
          />
        </div>
        <h1 class="brand-title">Welcome Back!</h1>
        <p class="brand-subtitle">Enter to get unlimited access to data &amp; information.</p>
      </div>

      <!-- Login Form -->
      <form v-if="viewMode === 'login'" class="login-form" @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            placeholder="Enter your mail address"
            autocomplete="off"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password *</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              autocomplete="new-password"
              required
            />
            <button
              type="button"
              class="toggle-btn"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <!-- Options -->
        <div class="form-options">
          <label class="remember-me">
            <input v-model="loginForm.rememberMe" type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" @click.prevent="switchMode('forgot')">Forgot your password?</a>
        </div>

        <!-- Error -->
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <!-- Submit -->
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Signing In…' : 'Log In' }}
        </button>

        <!-- Divider -->
        <div class="divider"><span>Or, Login with</span></div>

        <!-- Google -->
        <GoogleLogin :callback="handleGoogleLogin" :error="handleGoogleError" popup-type="TOKEN">
          <button type="button" class="btn-google" :disabled="isGoogleLoading">
            <svg viewBox="0 0 48 48" width="20" height="20">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.97-5.97z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {{ isGoogleLoading ? 'Signing In…' : 'Sign in with Google' }}
          </button>
        </GoogleLogin>

        <!-- Footer -->
        <p class="footer-text">
          Don't have an account? <router-link to="/signup">Register here</router-link>
        </p>
      </form>

      <!-- Forgot Password -->
      <form v-else-if="viewMode === 'forgot'" class="login-form" @submit.prevent="handleResetPassword">
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        <div class="form-group">
          <label for="reset-email">Email address</label>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="Enter your mail address"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Sending…' : 'Send Reset Link' }}
        </button>

        <p class="footer-text">
          Remembered? <a href="#" @click.prevent="switchMode('login')">Back to log in</a>
        </p>
      </form>

      <!-- Success -->
      <div v-else-if="viewMode === 'success'" class="success-message">
        <div class="success-icon">✅</div>
        <p>If an account exists for <strong>{{ resetEmail }}</strong>, a reset link is on its way.</p>
        <button class="btn-primary" type="button" @click="switchMode('login')">Back to log in</button>
      </div>
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
      loginForm: {
        email: localStorage.getItem('savedEmail') || '',
        password: '',
        rememberMe: !!localStorage.getItem('savedEmail')
      },
      resetEmail: '',
      showPassword: true,
      isLoading: false,
      isGoogleLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    switchMode(mode) {
      this.viewMode = mode
      this.errorMessage = ''
      this.isLoading = false
    },

    // HANDLE LOGIN
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.loginForm.email,
            password: this.loginForm.password
          })
        })

        // Check if response is empty
        const text = await response.text()
        if (!text) {
          throw new Error('Server returned an empty response. Make sure the backend is running.')
        }

        const data = JSON.parse(text)

        if (!response.ok) {
          throw new Error(data.message || 'Login failed.')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('role', data.user.role)

        if (this.loginForm.rememberMe) {
          localStorage.setItem('savedEmail', this.loginForm.email)
        } else {
          localStorage.removeItem('savedEmail')
        }

        this.$router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/resident/dashboard')
      } catch (error) {
        this.errorMessage = error.message || 'Unable to login. Please try again.'
      } finally {
        this.isLoading = false
      }
    },

    // HANDLE RESET PASSWORD 
    async handleResetPassword() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.resetEmail })
        })

        const text = await response.text()
        if (!text) {
          throw new Error('Server returned an empty response.')
        }

        const data = JSON.parse(text)

        if (!response.ok) {
          throw new Error(data.message || 'Unable to send reset email.')
        }

        this.isLoading = false
        this.switchMode('success')
      } catch (error) {
        this.isLoading = false
        this.errorMessage = error.message || 'Something went wrong. Please try again.'
      }
    },

    // HANDLE GOOGLE LOGIN
    // Custom Google buttons return an access_token (not a credential
    // JWT), so we send that to the backend for verification instead.
    async handleGoogleLogin(response) {
      this.isGoogleLoading = true
      this.errorMessage = ''

      try {
        const accessToken = response.access_token
        if (!accessToken) {
          throw new Error('No access token returned from Google.')
        }

        const apiResponse = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken })
        })

        const text = await apiResponse.text()
        if (!text) {
          throw new Error('Server returned an empty response. Make sure the backend is running.')
        }

        const data = JSON.parse(text)

        if (!apiResponse.ok) {
          throw new Error(data.message || 'Google sign-in failed.')
        }

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
      this.errorMessage = 'Google sign-in was cancelled or failed. Please try again.'
    }
  }
}
</script>

<style scoped>
/* PAGE CONTAINER */
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #F7F3E8;
  overflow: hidden;
}

/* BACKGROUND EFFECTS */
.bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 400px at 10% 0%, rgba(232, 163, 61, 0.20), transparent 60%),
    radial-gradient(600px 400px at 90% 100%, rgba(30, 75, 61, 0.15), transparent 60%);
  pointer-events: none;
}

.bg-texture {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image: radial-gradient(rgba(18, 42, 36, 0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* LOGIN CARD */
.login-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 2.8rem 2.5rem;
  background: linear-gradient(160deg, #1E4B3D 0%, #122A24 100%);
  border: 1px solid rgba(232, 163, 61, 0.15);
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(10, 24, 20, 0.40);
}

/* BRAND HEADER */
.brand-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo {
  width: 76px;
  height: 76px;
  object-fit: contain;
  background: #fff;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 0 0 3px rgba(232, 163, 61, 0.30);
}

.brand-title {
  margin: 0 0 0.3rem;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 2rem;
  color: #F7F3E8;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #B9C9C2;
}

/* FORM */
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

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #DCE7E1;
  letter-spacing: 0.02em;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(247, 243, 232, 0.06);
  border: 1px solid rgba(247, 243, 232, 0.14);
  border-radius: 10px;
  color: #F7F3E8;
  font-size: 0.95rem;
  font-family: 'Work Sans', sans-serif;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.form-group input::placeholder {
  color: #7C8D86;
}

.form-group input:focus {
  outline: none;
  border-color: #E8A33D;
  background: rgba(247, 243, 232, 0.08);
}

/* PASSWORD TOGGLE */
.password-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-wrapper input {
  flex: 1;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #B9C9C2;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  font-family: 'Work Sans', sans-serif;
}

.toggle-btn:hover {
  background: rgba(247, 243, 232, 0.08);
}

/* FORM OPTIONS */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #B9C9C2;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.remember-me input {
  accent-color: #E8A33D;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-options a {
  color: #E8A33D;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.form-options a:hover {
  opacity: 0.8;
}

/* ERROR */
.error-text {
  color: #F19A83;
  font-size: 0.85rem;
  text-align: center;
  margin: -0.3rem 0 0;
  font-weight: 500;
}

/* PRIMARY BUTTON */
.btn-primary {
  padding: 0.9rem;
  background: linear-gradient(135deg, #F0B65A, #E0952E);
  border: none;
  border-radius: 10px;
  color: #17332C;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(224, 149, 46, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}

/* DIVIDER */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #7C8D86;
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(247, 243, 232, 0.10);
}

/* GOOGLE BUTTON */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #F7F3E8;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-google:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.20);
}

/* ===== FOOTER ===== */
.footer-text {
  margin: 0.2rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #B9C9C2;
}

.footer-text a,
.footer-text router-link {
  color: #E8A33D;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}

/* ===== FORGOT PASSWORD ===== */
.auth-subtitle {
  color: #B9C9C2;
  font-size: 0.9rem;
  margin: 0 0 0.2rem;
}

/* ===== SUCCESS ===== */
.success-message {
  text-align: center;
  color: #DCE7E1;
}

.success-message .btn-primary {
  margin-top: 1rem;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 500px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .brand-title {
    font-size: 1.6rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
}
</style>