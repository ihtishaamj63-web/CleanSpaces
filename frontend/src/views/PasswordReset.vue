<template>
  <div class="reset-page">
    <div class="reset-card">
      <div class="brand-header">
        <div class="logo-wrapper">
          <img
            src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png"
            alt="CleanSpaces"
            class="logo"
          />
        </div>
        <h1>Reset Password</h1>
        <p>Choose a new password for your account.</p>
      </div>

      <!-- Still checking the token with the server -->
      <div v-if="isVerifying" class="loading-state">
        <div class="spinner"></div>
        <p>Verifying your account...</p>
      </div>

      <!-- No token in the URL -->
      <div v-else-if="!token" class="error-container">
        <div class="error-icon">🔒</div>
        <p class="error-title">No Reset Token Found</p>
        <p class="error-description">
          Please request a new password reset link from the login page.
        </p>
        <router-link class="btn-primary" to="/login">Back to Login</router-link>
      </div>

      <!-- Token was rejected by the server -->
      <div v-else-if="!isTokenValid" class="error-container">
        <div class="error-icon">⛔</div>
        <p class="error-title">Invalid or Expired Link</p>
        <p class="error-description">
          {{ errorMessage || 'This password reset link is invalid or has expired.' }}
        </p>
        <router-link class="btn-primary" to="/login">Request New Link</router-link>
      </div>

      <!-- Reset form -->
      <div v-else-if="viewMode === 'form' && userData">
        <div class="user-info">
          <div class="user-avatar">
            {{ getInitials(userData.name || userData.email) }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ userData.name || 'User' }}</p>
            <p class="user-email">{{ userData.email }}</p>
            <p class="user-role" :class="userData.role">
              {{ userData.role === 'admin' ? 'Administrator' : 'Resident' }}
            </p>
          </div>
        </div>

        <form class="reset-form" @submit.prevent="handleReset">
          <div class="form-group">
            <label for="new-password">New Password</label>
            <div class="password-input-wrapper">
              <input
                id="new-password"
                v-model="password"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="At least 8 characters"
                minlength="8"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="password-requirements">
              <span :class="{ met: password.length >= 8 }">✓ At least 8 characters</span>
              <span :class="{ met: hasUppercase }">✓ Uppercase letter</span>
              <span :class="{ met: hasLowercase }">✓ Lowercase letter</span>
              <span :class="{ met: hasNumber }">✓ Number</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <div class="password-input-wrapper">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter your new password"
                minlength="8"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <p v-if="passwordMismatch" class="error-text">
            ⚠️ Passwords do not match
          </p>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

          <button
            type="submit"
            class="btn-primary"
            :disabled="isLoading || !isFormValid"
          >
            {{ isLoading ? 'Resetting…' : 'Reset Password' }}
          </button>

          <p class="footer-text">
            <router-link to="/login">← Back to Login</router-link>
          </p>
        </form>
      </div>

      <!-- Success -->
      <div v-else-if="viewMode === 'success'" class="success-container">
        <div class="success-icon">✅</div>
        <h3>Password Reset Successful!</h3>
        <p>Your password has been reset successfully. You can now log in with your new password.</p>
        <router-link class="btn-primary" to="/login">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api.js'

export default {
  name: 'ResetPasswordPage',

  data() {
    return {
      token: '',
      isVerifying: true,
      isTokenValid: false,
      userData: null,
      password: '',
      confirmPassword: '',
      isLoading: false,
      errorMessage: '',
      viewMode: 'form', // 'form' or 'success'
      showNewPassword: false,
      showConfirmPassword: false
    }
  },

  computed: {
    /** Do the two password fields disagree? */
    passwordMismatch() {
      return this.password !== this.confirmPassword && this.confirmPassword.length > 0
    },

    hasUppercase() {
      return /[A-Z]/.test(this.password)
    },

    hasLowercase() {
      return /[a-z]/.test(this.password)
    },

    hasNumber() {
      return /[0-9]/.test(this.password)
    },

    /** All password rules satisfied and both fields match? */
    isFormValid() {
      return (
        this.password.length >= 8 &&
        this.confirmPassword.length >= 8 &&
        this.password === this.confirmPassword &&
        this.hasUppercase &&
        this.hasLowercase &&
        this.hasNumber
      )
    }
  },

  async created() {
    // Pull the token out of ?token=... in the URL.
    this.token = this.$route.query.token || ''

    if (this.token) {
      await this.verifyToken()
    } else {
      this.isVerifying = false
      this.isTokenValid = false
      this.errorMessage = 'No reset token found in the URL. Please use the link from your email.'
    }
  },

  methods: {
    /** First letters of the user's name, for the avatar circle. */
    getInitials(name) {
      if (!name) return 'U'
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    /** Ask the server whether this token is still valid. */
    async verifyToken() {
      this.isVerifying = true
      this.errorMessage = ''

      try {
        const { data } = await api.post('/auth/verify-reset-token', {
          token: this.token
        })

        if (!data.user || !data.valid) {
          throw new Error('Invalid response from server.')
        }

        this.isTokenValid = true
        this.userData = data.user
        this.viewMode = 'form'
      } catch (error) {
        this.isTokenValid = false
        this.userData = null
        this.errorMessage =
          error.response?.data?.message ||
          'The reset link is invalid or has expired.'
      } finally {
        this.isVerifying = false
      }
    },

    /** Submit the new password to the server. */
    async handleReset() {
      this.errorMessage = ''

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match. Please try again.'
        return
      }

      if (!this.isFormValid) {
        this.errorMessage = 'Please meet all password requirements.'
        return
      }

      this.isLoading = true

      try {
        await api.post('/auth/reset-password', {
          token: this.token,
          password: this.password
        })

        this.viewMode = 'success'
        this.password = ''
        this.confirmPassword = ''
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          'Something went wrong. Please try again.'

        if (error.response?.data?.message?.toLowerCase().includes('token')) {
          this.isTokenValid = false
        }
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f4f6f5;
}

.reset-card {
  width: 100%;
  max-width: 480px;
  padding: 2.8rem 2.5rem;
  background: #12332d;
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(10, 24, 20, 0.40);
  color: #ffffff;
}

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
  box-shadow: 0 0 0 3px rgba(124, 179, 66, 0.30);
}
h1 {
  margin: 0 0 0.3rem;
  font-size: 2rem;
}
.brand-header p {
  margin: 0;
  color: #b9c9c2;
}

.loading-state {
  text-align: center;
  padding: 2rem 0;
  color: #b9c9c2;
}
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #7cb342;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7cb342, #689f38);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #0b2a25;
  flex-shrink: 0;
}
.user-details {
  flex: 1;
  min-width: 0;
}
.user-name {
  margin: 0;
  font-weight: 600;
  color: #ffffff;
  font-size: 1rem;
}
.user-email {
  margin: 0.1rem 0 0.2rem;
  color: #b9c9c2;
  font-size: 0.85rem;
  word-break: break-all;
}
.user-role {
  display: inline-block;
  padding: 0.1rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}
.user-role.admin {
  background: rgba(124, 179, 66, 0.2);
  color: #9ccc65;
}
.user-role.resident {
  background: rgba(80, 200, 120, 0.2);
  color: #80d8a0;
}

.reset-form {
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
  color: #b9c9c2;
}
.password-input-wrapper {
  position: relative;
  width: 100%;
}
.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  padding-right: 2.8rem;
  background: #0b2a25;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}
.form-group input:focus {
  outline: none;
  border-color: #7cb342;
}
.toggle-password {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7c8d86;
  cursor: pointer;
  font-size: 1.2rem;
}

.password-requirements {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1rem;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: #7c8d86;
}
.password-requirements span.met {
  color: #80d8a0;
}

.error-text {
  color: #ff9d91;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

.btn-primary {
  display: inline-block;
  padding: 0.9rem 1.4rem;
  background: #7cb342;
  border: none;
  border-radius: 10px;
  color: #0b2a25;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #8bc34a;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-container,
.success-container {
  text-align: center;
  color: #b9c9c2;
}
.error-icon,
.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.error-title {
  margin: 0 0 0.5rem;
  color: #ff9d91;
}
.error-description,
.success-container p {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #b9c9c2;
  line-height: 1.5;
}
.success-container h3 {
  margin: 0 0 0.5rem;
  color: #ffffff;
}

.footer-text {
  margin: 0.2rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #b9c9c2;
}
.footer-text a {
  color: #8bc34a;
  text-decoration: none;
}
.footer-text a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .reset-card {
    padding: 2rem 1.5rem;
  }
  h1 {
    font-size: 1.6rem;
  }
  .password-requirements {
    grid-template-columns: 1fr;
  }
}
</style>