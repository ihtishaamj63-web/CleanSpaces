<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Create Your Account</h1>
        <p>Sign up as a resident to join or start a CleanSpaces zone.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSignup">
        <div class="input-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="form.name" type="text" placeholder="Enter your full name" required />
        </div>

        <div class="input-group">
          <label for="email">Email Address</label>
          <input id="email" v-model="form.email" type="email" placeholder="Enter your email address" required />
        </div>

        <div class="input-group">
          <label for="phone">Phone Number</label>
          <input id="phone" v-model="form.phone" type="tel" placeholder="Enter your phone number" required />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="password-field">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              minlength="8"
              placeholder="Create a password"
              required
            />
            <button
              class="toggle-password"
              type="button"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <div class="password-requirements">
            <span :class="{ met: passwordLength }">✓ At least 8 characters</span>
            <span :class="{ met: hasUppercase }">✓ Uppercase letter</span>
            <span :class="{ met: hasLowercase }">✓ Lowercase letter</span>
            <span :class="{ met: hasNumber }">✓ Number</span>
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
          <span v-if="passwordMismatch" class="field-error">Passwords do not match</span>
        </div>

        <p v-if="errorMessage" class="message error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="message success-message">{{ successMessage }}</p>

        <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Log In</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import api from '../api.js'

export default {
  name: 'SignupPage',

  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: '',
      showPassword: false
    }
  },

  computed: {
    passwordLength() {
      return this.form.password.length >= 8
    },
    hasUppercase() {
      return /[A-Z]/.test(this.form.password)
    },
    hasLowercase() {
      return /[a-z]/.test(this.form.password)
    },
    hasNumber() {
      return /[0-9]/.test(this.form.password)
    },
    passwordMismatch() {
      return this.form.password !== this.form.confirmPassword &&
             this.form.confirmPassword.length > 0
    },
    isFormValid() {
      return this.passwordLength &&
             this.hasUppercase &&
             this.hasLowercase &&
             this.hasNumber &&
             !this.passwordMismatch &&
             this.form.password.length > 0
    }
  },

  methods: {
    async handleSignup() {
      this.errorMessage = ''
      this.successMessage = ''

      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = 'Passwords do not match.'
        return
      }

      if (!this.isFormValid) {
        this.errorMessage = 'Please meet all password requirements.'
        return
      }

      this.loading = true

      try {
        const { data } = await api.post('/auth/signup', {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          password: this.form.password
        })

        // Save the session if the backend returned one.
        if (data.token) localStorage.setItem('token', data.token)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('role', data.user.role)
        }

        this.successMessage = data.message || 'Account created successfully!'

        // Clear the form.
        this.form = {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        }

        // Give the user a moment to read the success message, then redirect.
        setTimeout(() => this.$router.push('/resident/dashboard'), 1200)
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          'Something went wrong. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: #f4f6f5;
}

.auth-card {
  width: min(100%, 450px);
  padding: 2.5rem;
  background: #12332d;
  color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.auth-header {
  margin-bottom: 2rem;
}
.auth-header h1 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
}
.auth-header p {
  margin: 0;
  color: #b5c4bf;
  line-height: 1.5;
  font-size: 0.9rem;
}

.auth-form {
  display: grid;
  gap: 1rem;
}

.input-group {
  display: grid;
  gap: 0.45rem;
}
.input-group label {
  font-size: 0.88rem;
  font-weight: 600;
}
.input-group input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: #0b2a25;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}
.input-group input::placeholder {
  color: #81918d;
}
.input-group input:focus {
  outline: none;
  border-color: #7cb342;
  box-shadow: 0 0 0 3px rgba(124, 179, 66, 0.15);
}

.password-field {
  display: flex;
  align-items: stretch;
}
.password-field input {
  flex: 1;
  min-width: 0;
  border-radius: 8px 0 0 8px !important;
}
.toggle-password {
  padding: 0 0.9rem;
  color: #8bc34a;
  background: #0b2a25;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 0;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.password-requirements {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 1rem;
  font-size: 0.75rem;
  color: #7c8d86;
}
.password-requirements span.met {
  color: #80d8a0;
}

.field-error {
  color: #ff9d91;
  font-size: 0.8rem;
}

.message {
  margin: 0;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
}
.error-message {
  color: #ffb4ae;
  background: rgba(255, 100, 100, 0.12);
}
.success-message {
  color: #b5e48c;
  background: rgba(124, 179, 66, 0.15);
}

.submit-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.95rem;
  background: #7cb342;
  color: #0b2a25;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #8bc34a;
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-footer {
  margin: 1.8rem 0 0;
  text-align: center;
  color: #b5c4bf;
  font-size: 0.9rem;
}
.auth-footer a {
  margin-left: 0.3rem;
  color: #8bc34a;
  font-weight: 600;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
  .auth-header h1 {
    font-size: 1.5rem;
  }
  .password-requirements {
    grid-template-columns: 1fr;
  }
}
</style>