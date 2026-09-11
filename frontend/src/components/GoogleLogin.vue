<template>
  <div 
    class="google-login-wrapper" 
    @click="handleClick"
  >
    <slot />
    <div v-if="!hasSlot" ref="buttonRef" class="google-default-button"></div>
  </div>
</template>

<script>
export default {
  name: 'GoogleLogin',
  props: {
    clientId: {
      type: String,
      required: true
    },
    popupType: {
      type: String,
      default: 'TOKEN' // 'CODE' or 'TOKEN'
    },
    callback: {
      type: Function,
      default: () => {}
    },
    error: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      hasSlot: true,
      isLoaded: false
    }
  },
  mounted() {
    // Check if slot is used
    this.hasSlot = !!this.$slots.default
    // Load Google script
    this.loadGoogleScript()
  },
  methods: {
    loadGoogleScript() {
      return new Promise((resolve, reject) => {
        if (window.google) {
          this.isLoaded = true
          resolve(window.google)
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
        
        script.onerror = () => {
          reject('Failed to load Google script')
        }
        
        document.head.appendChild(script)
      })
    },

    async handleClick() {
      if (!this.isLoaded) {
        try {
          await this.loadGoogleScript()
        } catch (error) {
          this.error(error)
          return
        }
      }
      this.openPopup()
    },

    openPopup() {
      try {
        if (!this.clientId) {
          throw new Error('Client ID is required')
        }

        const client = window.google.accounts.oauth2
        
        const config = {
          client_id: this.clientId,
          scope: 'email profile openid',
          ux_mode: 'popup',
          callback: (response) => {
            if (response.code) {
              this.callback(response)
            } else if (response.access_token) {
              this.callback(response)
            } else if (response.error) {
              this.error(response)
            } else {
              this.callback(response)
            }
          },
          error_callback: (error) => {
            this.error(error)
          }
        }

        if (this.popupType === 'CODE') {
          client.initCodeClient(config).requestCode()
        } else {
          client.initTokenClient(config).requestAccessToken()
        }
      } catch (error) {
        this.error(error.message || 'Failed to open Google login')
      }
    }
  }
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
</style>