<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Create Your Account</h1>
        <p>
          Sign up as a resident to join or start a CleanSpaces zone.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSignup">
        <div class="input-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div class="input-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>

        <div class="input-group">
          <label for="phone">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            minlength="8"
            placeholder="Create a password"
            required
          />
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
        </div>

        <p v-if="errorMessage" class="message error-message">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="message success-message">
          {{ successMessage }}
        </p>

        <button
          type="submit"
          class="submit-btn"
          :disabled="loading"
        >
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?

        <router-link to="/login">
          Log In
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
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
      successMessage: ''
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

      this.loading = true

      try {
        const response = await fetch(
          '/api/auth/signup',
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              name: this.form.name,
              email: this.form.email,
              phone: this.form.phone,
              password: this.form.password
            })
          }
        )

        const responseText = await response.text()
        let data = {}

        if (responseText) {
          try {
            data = JSON.parse(responseText)
          } catch {
            throw new Error(`Signup failed (HTTP ${response.status}).`)
          }
        }

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to create your account.'
          )
        }

        if (data.token) {
          localStorage.setItem('token', data.token)
        }

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('role', data.user.role)
        }

        this.successMessage =
          data.message || 'Account created successfully!'

        this.form = {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        }

        setTimeout(() => {
          this.$router.push('/resident/dashboard')
        }, 1500)

      } catch (error) {
        console.error('Signup error:', error)

        this.errorMessage =
          error.message || 'Something went wrong. Please try again.'

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
}
</style>