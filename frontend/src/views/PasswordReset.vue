<template>
  <div class="login-page">
    <div class="bg-glow"></div>
    <div class="bg-texture"></div>

    <div class="login-card">
      <div class="brand-header">
        <div class="logo-wrapper">
          <img
            src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png"
            alt="CleanSpaces"
            class="logo"
          />
        </div>
        <h1 class="brand-title">Reset Password</h1>
        <p class="brand-subtitle">Choose a new password for your account.</p>
      </div>

      <!-- Loading State -->
      <div v-if="isVerifying" class="loading-state">
        <div class="spinner"></div>
        <p>Verifying your account...</p>
        <p style="font-size: 0.8rem; color: #7C8D86; margin-top: 0.5rem;">
          Token: {{ token ? token.substring(0, 20) + '...' : 'No token' }}
        </p>
      </div>

      <!-- No token -->
      <div v-else-if="!token" class="error-container">
        <div class="error-icon">🔒</div>
        <p class="error-title">No Reset Token Found</p>
        <p class="error-description">
          Please request a new password reset link from the login page.
        </p>
        <router-link class="btn-primary reset-link-btn" to="/login">Back to Login</router-link>
      </div>

      <!-- Invalid token -->
      <div v-else-if="!isTokenValid" class="error-container">
        <div class="error-icon">⛔</div>
        <p class="error-title">Invalid or Expired Link</p>
        <p class="error-description">
          {{ errorMessage || 'This password reset link is invalid or has expired.' }}
        </p>
        <router-link class="btn-primary reset-link-btn" to="/login">Request New Link</router-link>
      </div>

      <!-- Success - Reset Form -->
      <div v-else-if="viewMode === 'form' && userData">
        <!-- User Account Info -->
        <div class="account-info">
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

        <!-- Reset Form -->
        <form class="login-form" @submit.prevent="handleReset">
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

          <p v-if="passwordMismatch && confirmPassword.length > 0" class="error-text">
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

      <!-- Reset Success -->
      <div v-else-if="viewMode === 'success'" class="success-message">
        <div class="success-icon">✅</div>
        <h3 class="success-title">Password Reset Successful!</h3>
        <p class="success-description">
          Your password has been reset successfully.
          You can now log in with your new password.
        </p>
        <router-link class="btn-primary reset-link-btn" to="/login">
          Go to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
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
      viewMode: 'form',
      showNewPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    passwordMismatch() {
      return this.password !== this.confirmPassword && this.confirmPassword.length > 0
    },
    isFormValid() {
      return this.password.length >= 8 &&
             this.confirmPassword.length >= 8 &&
             this.password === this.confirmPassword &&
             this.hasUppercase &&
             this.hasLowercase &&
             this.hasNumber
    },
    hasUppercase() {
      return /[A-Z]/.test(this.password)
    },
    hasLowercase() {
      return /[a-z]/.test(this.password)
    },
    hasNumber() {
      return /[0-9]/.test(this.password)
    }
  },
  async created() {
    // Get token from URL query parameter
    this.token = this.$route.query.token || ''
    
    console.log('🔄 ResetPasswordPage created')
    console.log('📝 Token from URL:', this.token)
    console.log('🔗 Full URL:', window.location.href)
    console.log('📦 Route query:', this.$route.query)

    if (this.token) {
      await this.verifyToken()
    } else {
      console.log('❌ No token found in URL')
      this.isVerifying = false
      this.isTokenValid = false
      this.errorMessage = 'No reset token found in the URL. Please use the link from your email.'
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return 'U'
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    async verifyToken() {
      this.isVerifying = true
      this.errorMessage = ''

      try {
        console.log('🔄 Verifying token:', this.token)

        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: this.token })
        })

        console.log('📡 Response status:', response.status)

        const text = await response.text()
        console.log('📄 Response text:', text)

        if (!text) {
          throw new Error('Server returned an empty response.')
        }

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError)
          throw new Error('Invalid response from server.')
        }

        console.log('📊 Parsed data:', data)

        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token.')
        }

        // Check if the response has the expected structure
        if (!data.user || !data.valid) {
          console.error('❌ Unexpected response structure:', data)
          throw new Error('Invalid response structure from server.')
        }

        // Token is valid - store user data
        this.isTokenValid = true
        this.userData = data.user
        this.viewMode = 'form'
        console.log('✅ Token verified! User:', this.userData)

      } catch (error) {
        console.error('❌ Token verification error:', error)
        this.isTokenValid = false
        this.userData = null
        this.errorMessage = error.message || 'The reset link is invalid or has expired.'
        this.viewMode = 'form'
      } finally {
        this.isVerifying = false
        console.log('🏁 Verification complete. isTokenValid:', this.isTokenValid)
      }
    },

    async handleReset() {
      this.errorMessage = ''

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match. Please try again.'
        return
      }

      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long.'
        return
      }

      if (!this.hasUppercase || !this.hasLowercase || !this.hasNumber) {
        this.errorMessage = 'Password must contain uppercase, lowercase, and a number.'
        return
      }

      this.isLoading = true

      try {
        console.log('🔄 Resetting password for user:', this.userData?.id)

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: this.token,
            password: this.password
          })
        })

        console.log('📡 Reset response status:', response.status)

        const text = await response.text()
        console.log('📄 Reset response text:', text)

        if (!text) {
          throw new Error('Server returned an empty response.')
        }

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError)
          throw new Error('Invalid response from server.')
        }

        console.log('📊 Reset data:', data)

        if (!response.ok) {
          throw new Error(data.message || 'Unable to reset your password.')
        }

        // Success
        this.viewMode = 'success'
        this.password = ''
        this.confirmPassword = ''
        console.log('✅ Password reset successful!')

      } catch (error) {
        console.error('❌ Reset password error:', error)
        this.errorMessage = error.message || 'Something went wrong. Please try again.'

        if (error.message.includes('token') || error.message.includes('expired')) {
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
/* ===== PAGE CONTAINER ===== */
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

.login-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: 2.8rem 2.5rem;
  background: linear-gradient(160deg, #1E4B3D 0%, #122A24 100%);
  border: 1px solid rgba(232, 163, 61, 0.15);
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(10, 24, 20, 0.40);
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

.loading-state {
  text-align: center;
  padding: 2rem 0;
  color: #DCE7E1;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(247, 243, 232, 0.1);
  border-top: 3px solid #E8A33D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.account-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(247, 243, 232, 0.05);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(247, 243, 232, 0.08);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8A33D, #F0B65A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #17332C;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-weight: 600;
  color: #F7F3E8;
  font-size: 1rem;
}

.user-email {
  margin: 0.1rem 0 0.2rem;
  color: #B9C9C2;
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
  background: rgba(232, 163, 61, 0.2);
  color: #F0B65A;
}

.user-role.resident {
  background: rgba(80, 200, 120, 0.2);
  color: #80D8A0;
}

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

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  padding-right: 2.8rem;
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

.toggle-password {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7C8D86;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #DCE7E1;
}

.password-requirements {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1rem;
  margin-top: 0.2rem;
}

.password-requirements span {
  font-size: 0.75rem;
  color: #7C8D86;
  transition: color 0.3s ease;
}

.password-requirements span.met {
  color: #80D8A0;
}

.error-text {
  color: #F19A83;
  font-size: 0.85rem;
  text-align: center;
  margin: -0.3rem 0 0;
  font-weight: 500;
}

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
  cursor: not-allowed;
  transform: none;
}

.error-container {
  text-align: center;
  color: #DCE7E1;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  margin: 0 0 0.5rem;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  color: #F19A83;
}

.error-description {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #B9C9C2;
  line-height: 1.5;
}

.success-message {
  text-align: center;
  color: #DCE7E1;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-title {
  margin: 0 0 0.5rem;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  color: #F7F3E8;
}

.success-description {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #B9C9C2;
  line-height: 1.5;
}

.reset-link-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  text-decoration: none;
  text-align: center;
  width: auto;
}

.footer-text {
  margin: 0.2rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: #B9C9C2;
}

.footer-text a {
  color: #E8A33D;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .brand-title {
    font-size: 1.6rem;
  }

  .password-requirements {
    grid-template-columns: 1fr;
  }
}
</style>