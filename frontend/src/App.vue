<template>
  <header class="nav-shell">
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
  </header>

  <main>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="footer">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  token.value = null
  role.value = null
  router.push('/')
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
/* ---------- FLOATING GLASS NAV ---------- */
.nav-shell {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 14px 16px 0;
  /* the shell is transparent; the inner bar is the glass pill */
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

/* brand */
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

/* links */
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
/* active link: green dot + brighter */
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

/* actions */
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

/* ---------- PAGE TRANSITION ---------- */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* ---------- FOOTER ---------- */
.footer {
  background: #0b2a25;
  color: #a0b0ac;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2.5rem 1rem 3rem;
  margin-top: 4rem;
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
}
</style>