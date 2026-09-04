<template>
  <header class="site-header">
    <div class="header-inner">
      <router-link to="/" class="logo-brand">
        <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces Logo" class="logo" />
        <span class="brand-title">CLEAN<span>SPACES</span></span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/pricing">Pricing</router-link>
        <router-link to="/how-it-works">How It Works</router-link>
        <router-link to="/reviews">Reviews</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>

      <div class="header-actions">
        <router-link v-if="role === 'admin'" to="/admin/dashboard" class="action-btn">Admin</router-link>
        <router-link v-else-if="token" to="/resident/dashboard" class="action-btn">My Dashboard</router-link>
        <router-link v-else to="/login" class="action-btn">Log In</router-link>
        <a v-if="token" href="#" class="action-btn outline" @click.prevent="logout">Log Out</a>
      </div>
    </div>
  </header>

  <main>
    <router-view />
  </main>

  <footer class="site-footer">
    <p>CleanSpaces — Community-Powered Cleanup Service</p>
    <p class="footer-muted">Manenberg · Mitchell's Plain · Khayelitsha</p>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  token.value = null
  role.value = null
  router.push('/')
}
</script>

<style scoped>
.site-header { color: #f4f6f5; background: #12332d; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,.15); }
.header-inner { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; max-width: 1200px; margin: 0 auto; padding: .8rem 1.5rem; flex-wrap: wrap; }
.logo-brand { display: flex; align-items: center; gap: .75rem; text-decoration: none; }
.logo { width: 44px; height: 44px; object-fit: contain; background: white; padding: 3px; border-radius: 50%; }
.brand-title { font-size: 1.25rem; font-weight: 800; letter-spacing: .5px; color: #f4f6f5; text-transform: uppercase; }
.brand-title span { color: #7cb342; }
.nav-links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.nav-links a { color: #a0b0ac; text-decoration: none; font-size: .95rem; font-weight: 500; }
.nav-links a:hover, .nav-links a.router-link-active { color: #7cb342; }
.header-actions { display: flex; gap: .75rem; }
.action-btn { padding: .5rem 1.1rem; color: #7cb342; background: transparent; border: 2px solid #7cb342; border-radius: 8px; font-weight: 700; font-size: .9rem; text-decoration: none; }
.action-btn:hover { color: #0b2a25; background: #7cb342; }
.action-btn.outline { color: #a0b0ac; border-color: #a0b0ac; }
.action-btn.outline:hover { color: #12332d; background: #a0b0ac; }
.site-footer { background: #12332d; color: #a0b0ac; padding: 1.5rem 1rem; text-align: center; }
.site-footer p { margin: .2rem 0; font-size: .9rem; }
.footer-muted { font-size: .8rem; }
</style>