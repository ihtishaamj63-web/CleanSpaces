<template>
  <div id="app">
    <!-- Header / Navbar - Hidden on Login and Signup -->
    <header v-if="!hideNavbar" class="site-header">
      <div class="header-inner">
        <router-link to="/" class="logo-brand">
          <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces Logo" class="logo" />
          <span class="brand-title">CLEAN<span>SPACES</span></span>
        </router-link>

        <!-- ===== NAV LINKS ===== -->
        <nav class="nav-links">
          <router-link
            v-if="token"
            :to="role === 'admin' ? '/admin/dashboard' : '/resident/dashboard'"
          >
            Dashboard
          </router-link>
          <router-link to="/pricing">Pricing</router-link>
          <router-link to="/how-it-works">How It Works</router-link>
          <router-link to="/reviews">Reviews</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>

        <!-- ===== HEADER ACTIONS ===== -->
        <!-- Admin link ONLY appears here when user is admin -->
        <div class="header-actions">
          <template v-if="!token">
            <router-link to="/login" class="action-btn">Log In</router-link>
          </template>
          <template v-else>
            <router-link v-if="role === 'admin'" to="/admin/dashboard" class="action-btn admin-btn">
              Admin
            </router-link>
            <span v-if="role !== 'admin'" class="user-name">{{ userName }}</span>
            <a href="#" class="action-btn outline" @click.prevent="logout">Log Out</a>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main :class="{ 'no-navbar': hideNavbar }">
      <router-view />
    </main>

    <!-- Footer -->
    <footer v-if="!hideNavbar" class="site-footer">
      <p>CleanSpaces — Community-Powered Cleanup Service</p>
      <p class="footer-muted">Manenberg · Mitchell's Plain · Khayelitsha</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))

// Hide navbar on login/signup pages
const hideNavbar = computed(() => {
  const hiddenRoutes = ['/login', '/signup']
  return hiddenRoutes.includes(route.path)
})

// Get user name
const userName = computed(() => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const parsed = JSON.parse(user)
      return parsed.name || parsed.email || 'User'
    } catch {
      return 'User'
    }
  }
  return ''
})

// Sync on route change
watch(
  () => route.fullPath,
  () => {
    token.value = localStorage.getItem('token')
    role.value = localStorage.getItem('role')
  }
)

// Listen for storage changes
window.addEventListener('storage', () => {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role')
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  token.value = null
  role.value = null
  router.push('/')
}
</script>

<style>
/* ===== RESET & BASE ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Work Sans', sans-serif;
  background: #F7F3E8;
  color: #122A24;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== MAIN CONTENT ===== */
main {
  flex: 1;
  padding-top: 72px;
  min-height: calc(100vh - 72px - 100px);
}

main.no-navbar {
  padding-top: 0;
  min-height: 100vh;
}

.site-header {
  color: #f4f6f5;
  background: #12332d;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  height: 72px;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.8rem 1.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.logo-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  background: white;
  padding: 3px;
  border-radius: 50%;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #f4f6f5;
  text-transform: uppercase;
}

.brand-title span {
  color: #7cb342;
}

.nav-links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: #a0b0ac;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #e68517;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.5rem 1.1rem;
  color: #e68517;
  background: transparent;
  border: 2px solid #e68517;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  color: #0b2a25;
  background: #e68517;
}

.action-btn.outline {
  color: #a0b0ac;
  border-color: #a0b0ac;
}

.action-btn.outline:hover {
  color: #12332d;
  background: #a0b0ac;
}

/* Admin Button - Only in header-actions */
.admin-btn {
  color: #7cb342;
  border-color: #7cb342;
}

.admin-btn:hover {
  color: #12332d;
  background: #7cb342;
}

/* User Name */
.user-name {
  color: #f4f6f5;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* ============================================================ */
/* ===== FOOTER ===== */
/* ============================================================ */
.site-footer {
  background: #12332d;
  color: #a0b0ac;
  padding: 1.5rem 1rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.site-footer p {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.footer-muted {
  font-size: 0.8rem;
  opacity: 0.7;
}

@media (max-width: 820px) {
  .nav-links {
    display: none;
  }

  .site-header {
    height: 68px;
  }

  .header-inner {
    padding: 0.6rem 1.25rem;
  }

  .brand-title {
    font-size: 1rem;
  }

  .logo {
    width: 36px;
    height: 36px;
  }

  main {
    padding-top: 68px;
  }
}

@media (max-width: 500px) {
  .header-actions .action-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .user-name {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>