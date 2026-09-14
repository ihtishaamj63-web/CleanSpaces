<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const open = ref(false)
const scrolled = ref(false)

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
]

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner container">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" aria-hidden="true">
            <path d="M16 4c0 7 4 10 10 12-1 6-5 10-10 12-5-2-9-6-10-12 6-2 10-5 10-12z" fill="currentColor" opacity=".9"/>
            <path d="M16 8c0 5 3 7 8 9" stroke="#f6efe3" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>
          </svg>
        </span>
        <span class="brand-text">
          <strong>CleanSpaces</strong>
          <span>Cape Flats • Waste Care</span>
        </span>
      </RouterLink>

      <nav class="links" :class="{ open }">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="link"
          @click="open = false"
        >
          {{ l.label }}
        </RouterLink>
      </nav>

      <div class="actions">
        <RouterLink to="/login" class="link ghost">Sign in</RouterLink>
        <RouterLink to="/signup" class="btn btn-lime cta">Get Started</RouterLink>
        <button class="burger" :class="{ open }" @click="open = !open" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--green-dark);
  color: var(--cream);
  transition: box-shadow 0.2s ease, background 0.2s ease;
}
.nav.scrolled {
  box-shadow: 0 8px 30px -14px rgba(0, 0, 0, 0.6);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 72px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--cream);
}
.brand-mark {
  color: var(--lime);
  display: grid;
  place-items: center;
}
.brand-text strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  display: block;
  line-height: 1.1;
}
.brand-text span {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--green-chalk);
}
.links {
  display: flex;
  gap: 4px;
  align-items: center;
}
.link {
  padding: 8px 13px;
  border-radius: 999px;
  color: var(--green-chalk);
  font-size: 0.92rem;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;
}
.link:hover {
  color: var(--cream);
  background: rgba(255, 255, 255, 0.07);
}
.links .link.router-link-active,
.links .link.router-link-exact-active {
  color: var(--cream);
  background: rgba(255, 255, 255, 0.1);
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.actions .ghost {
  color: var(--cream);
}
.actions .ghost:hover {
  background: rgba(255, 255, 255, 0.07);
}
.cta {
  padding: 10px 20px;
  font-size: 0.9rem;
}
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  padding: 8px;
}
.burger span {
  width: 24px;
  height: 2px;
  background: var(--cream);
  border-radius: 2px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger.open span:nth-child(2) { opacity: 0; }
.burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 900px) {
  .links {
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    background: var(--green-dark);
    padding: 12px 6%;
    display: none;
    box-shadow: 0 20px 30px -18px rgba(0,0,0,0.6);
  }
  .links.open { display: flex; }
  .links .link { padding: 12px 14px; font-size: 1rem; }
  .actions .ghost { display: none; }
  .burger { display: flex; }
}
</style>
