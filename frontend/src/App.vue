<template>
  <!-- PUBLIC SITE CHROME — hidden on /admin routes, which get their own topbar -->
  <div v-if="!isAdmin" class="nav-shell">
    <header class="nav" :class="{ scrolled }">
      <router-link to="/" class="brand">
        <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces" class="logo" />
        <span class="brand-name">CLEAN<em>SPACES</em></span>
      </router-link>

      <nav class="links">
        <router-link to="/pricing">Pricing</router-link>
        <router-link to="/how-it-works">How It Works</router-link>
        <router-link to="/reviews">Reviews</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>

      <div class="actions">
        <template v-if="role === 'admin'">
          <router-link to="/admin/dashboard" class="nav-btn solid">Admin</router-link>
          <a href="#" class="nav-btn ghost" @click.prevent="logout">Log Out</a>
        </template>
        <template v-else-if="token">
          <router-link to="/resident/dashboard" class="nav-btn solid">My Zone</router-link>
          <a href="#" class="nav-btn ghost" @click.prevent="logout">Log Out</a>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-btn ghost">Log In</router-link>
          <router-link to="/signup" class="nav-btn solid">Get Started</router-link>
        </template>
      </div>
    </header>
  </div>

  <!-- ADMIN TOPBAR — replaces the marketing nav on admin routes so the
       admin panel doesn't stack two navbars. Keeps brand, a way back to
       the public site, and the logout button. -->
  <header v-else class="admin-topbar">
    <router-link to="/admin/dashboard" class="admin-brand">
      <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="CleanSpaces" class="admin-logo" />
      <span class="admin-wordmark">CLEAN<em>SPACES</em><small>Admin</small></span>
    </router-link>
    <div class="admin-topbar-actions">
      <router-link to="/" class="admin-top-link">View site</router-link>
      <a href="#" class="admin-top-link logout" @click.prevent="logout">Log Out</a>
    </div>
  </header>

  <main>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer v-if="!isAdmin" class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="https://i.ibb.co/RpJFKCJX/cleanspaces-removebg-preview.png" alt="" class="footer-logo" />
        <span class="brand-name small">CLEAN<em>SPACES</em></span>
      </div>
      <p>Community-powered cleanup service</p>
      <nav class="footer-links">
        <router-link to="/pricing">Pricing</router-link>
        <router-link to="/reviews">Reviews</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))
const scrolled = ref(false)

// Admin routes get their own chrome (topbar + no marketing footer)
const isAdmin = computed(() => route.path.startsWith('/admin'))

// Keeps the nav in sync with login/logout happening anywhere
// (same tab via route changes, other tabs via the storage event).
function syncSession() {
  token.value = localStorage.getItem('token')
  role.value = localStorage.getItem('role')
}

function onScroll() {
  scrolled.value = window.scrollY > 12
}

function logout() {
  // clear the full session, not just the token
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  token.value = null
  role.value = null
  router.push('/')
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onMounted(() => {
  window.addEventListener('storage', syncSession)
  syncSession()
})
watch(() => route.fullPath, syncSession)
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('storage', syncSession)
})
</script>

<style scoped>
/* ---------- FLOATING GLASS NAV (public site) ---------- */
.nav-shell {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 14px 16px 0;
}

.nav {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 10px 18px 10px 14px;
  border-radius: 18px;
  background: rgba(11, 42, 37, 0.72);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
  transition: padding 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.nav.scrolled {
  padding: 6px 18px 6px 14px;
  background: rgba(11, 42, 37, 0.88);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
  background: #fff;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.brand:hover .logo {
  transform: rotate(-8deg) scale(1.06);
}
.brand-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #f4f6f5;
  white-space: nowrap;
}
.brand-name em {
  font-style: normal;
  color: #7cb342;
}

.links {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}
.links a {
  position: relative;
  color: #c3d0cb;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 10px;
  transition: color 0.2s, background 0.2s;
}
.links a:hover {
  color: #f4f6f5;
  background: rgba(255, 255, 255, 0.07);
}
.links a.router-link-active {
  color: #7cb342;
  font-weight: 600;
}
.links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #7cb342;
}

.actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}
.nav-btn {
  display: inline-block;
  padding: 9px 20px;
  border-radius: 999px;
  font-family: 'Sora', sans-serif;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}
.nav-btn.solid {
  background: linear-gradient(135deg, #7cb342, #689f38);
  color: #0b2a25;
  box-shadow: 0 4px 16px rgba(124, 179, 66, 0.35);
}
.nav-btn.solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 22px rgba(124, 179, 66, 0.5);
}
.nav-btn.ghost {
  color: #c3d0cb;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
}
.nav-btn.ghost:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

/* ---------- ADMIN TOPBAR (replaces the marketing nav on /admin) ----------
   Light theme to match the admin pages below it. */
.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid var(--border);
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.admin-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  background: var(--green-tint);
  padding: 4px;
  border-radius: 8px;
}
.admin-wordmark {
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: var(--green-dark);
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.admin-wordmark em {
  font-style: normal;
  color: var(--green);
}
.admin-wordmark small {
  margin-left: 0.6rem;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  background: var(--green-tint);
  color: var(--green-deep);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.admin-topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}
.admin-top-link {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--green-dark);
}
.admin-top-link:hover { background: var(--green-tint); }
.admin-top-link.logout { color: #962a2a; }
.admin-top-link.logout:hover { background: #f9e4e4; }

/* ---------- PAGE TRANSITION ---------- */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* ---------- FOOTER (public site only) ---------- */
.footer {
  background: #0b2a25;
  color: #a0b0ac;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2.5rem 1rem 3rem;
  margin-top: 0;
}
.footer-inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.footer-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
  background: #fff;
  padding: 3px;
  border-radius: 8px;
}
.brand-name.small {
  font-size: 1rem;
  color: #f4f6f5;
}
.footer-inner > p {
  margin: 0;
  font-size: 0.88rem;
}
.footer-links {
  display: flex;
  gap: 1.25rem;
  margin-left: auto;
}
.footer-links a {
  color: #a0b0ac;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #7cb342;
}

@media (max-width: 900px) {
  .links { order: 3; width: 100%; justify-content: center; }
  .nav { flex-wrap: wrap; gap: 0.75rem; }
  .actions { margin-left: auto; }
}
@media (max-width: 600px) {
  .brand-name { display: none; }
  .links a { padding: 7px 10px; font-size: 0.85rem; }
  .nav-btn { padding: 8px 14px; font-size: 0.8rem; }
  .admin-wordmark small { display: none; }
}
</style>