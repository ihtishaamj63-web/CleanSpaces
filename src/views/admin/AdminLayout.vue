<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router = useRouter()
const user = { name: 'Administrator', email: 'admin@cleanspaces.co.za', initials: 'AD' }

const links = [
  { to: '/admin', label: 'Dashboard', ico: '📊', exact: true },
  { to: '/admin/zones', label: 'Zones', ico: '🗺️' },
  { to: '/admin/employees', label: 'Employees', ico: '🧑‍🔧' },
  { to: '/admin/payroll', label: 'Payroll', ico: '💵' },
  { to: '/admin/cleanup-reports', label: 'Cleanup Reports', ico: '🧹' },
]

function logout() {
  router.push('/login')
}
</script>

<template>
  <div class="dash">
    <aside class="dash-side">
      <RouterLink to="/" class="side-brand">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
          <path d="M16 4c0 7 4 10 10 12-1 6-5 10-10 12-5-2-9-6-10-12 6-2 10-5 10-12z" fill="currentColor" opacity=".9"/>
        </svg>
        <span><strong>CleanSpaces</strong><span>Admin</span></span>
      </RouterLink>

      <nav class="side-nav">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="side-link"
          :class="{ active: l.exact ? $route.path === l.to : $route.path.startsWith(l.to) }"
        >
          <span class="ico">{{ l.ico }}</span>{{ l.label }}
        </RouterLink>
        <RouterLink to="/" class="side-link"><span class="ico">🌐</span>View site</RouterLink>
      </nav>

      <div class="side-user">
        <div class="who">
          <span class="av">{{ user.initials }}</span>
          <span><strong>{{ user.name }}</strong><small>{{ user.email }}</small></span>
        </div>
        <button class="side-logout" @click="logout">Sign out</button>
      </div>
    </aside>

    <main class="dash-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
@import '../../assets/dash.css';
</style>
