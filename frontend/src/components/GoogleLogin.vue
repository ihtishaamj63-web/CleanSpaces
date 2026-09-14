<template>
  <div
    class="google-login-wrapper"
    @click="handleClick"
  >
    <slot />
    <div v-if="!hasSlot" ref="buttonRef" class="google-default-button"></div>
    <p v-if="errorMessage" class="google-error">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'GoogleLogin',
  props: {
    clientId: {
      type: String,
      required: true,
    },
    popupType: {
      type: String,
      default: 'TOKEN', // 'CODE' or 'TOKEN'
    },
    callback: {
      type: Function,
      default: () => {},
    },
    error: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      hasSlot: false,
      isLoaded: false,
      errorMessage: '',
    }
  },
  mounted() {
    this.hasSlot = !!this.$slots.default
    this.loadGoogleScript().catch((err) => {
      this.errorMessage = err.message || 'Failed to load Google script.'
      this.error(this.errorMessage)
    })
  },
  methods: {
    loadGoogleScript() {
      return new Promise((resolve, reject) => {
        if (window.google?.accounts) {
          this.isLoaded = true
          return resolve(window.google)
        }

        const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
        if (existing) {
          existing.addEventListener('load', () => {
            this.isLoaded = true
            resolve(window.google)
          })
          existing.addEventListener('error', () => reject(new Error('Failed to load Google script')))
          return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          this.isLoaded = true
          resolve(window.google)
        }
        script.onerror = () => reject(new Error('Failed to load Google script'))
        document.head.appendChild(script)
      })
    },

    async handleClick() {
      if (!this.isLoaded) {
        try {
          await this.loadGoogleScript()
        } catch (error) {
          this.errorMessage = error.message || 'Failed to load Google script.'
          this.error(this.errorMessage)
          return
        }
      }
      this.openPopup()
    },

    openPopup() {
      try {
        if (!this.clientId) {
          throw new Error('Client ID is required.')
        }
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google OAuth client is not available yet.')
        }

        const client = window.google.accounts.oauth2

        const config = {
          client_id: this.clientId,
          scope: 'email profile openid',
          ux_mode: 'popup',
          callback: (response) => {
            this.errorMessage = ''
            // Token flow → { access_token }, Code flow → { code }
            if (response.code || response.access_token) {
              this.callback(response)
            } else if (response.error) {
              this.errorMessage = response.error
              this.error(response)
            } else {
              this.callback(response)
            }
          },
          error_callback: (error) => {
            this.errorMessage = error?.message || 'Google login failed.'
            this.error(error)
          },
        }

        if (this.popupType === 'CODE') {
          client.initCodeClient(config).requestCode()
        } else {
          client.initTokenClient(config).requestAccessToken()
        }
      } catch (error) {
        this.errorMessage = error.message || 'Failed to open Google login.'
        this.error(error)
      }
    },
  },
}
</script>

<style scoped>
.google-login-wrapper {
  display: inline-block;
  width: 100%;
  cursor: pointer;
}

.google-default-button {
  display: none;
}

.google-error {
  margin-top: 0.5rem;
  color: #ff8a80;
  font-size: 0.85rem;
  text-align: center;
}
</style>