<template>
  <header class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="logo">Clean<span>Spaces</span></router-link>
      <nav class="nav-links">
        <router-link to="/pricing">Pricing</router-link>
        <router-link to="/how-it-works">How It Works</router-link>
        <router-link to="/reviews">Reviews</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>
      <router-link v-if="role === 'admin'" to="/admin/dashboard" class="btn btn-secondary">Admin</router-link>
      <router-link v-else-if="token" to="/resident/dashboard" class="btn btn-secondary">My Dashboard</router-link>
      <router-link v-else to="/login" class="btn btn-secondary">Log In</router-link>
    </div>
  </header>

  <main class="page">
    <router-view />
  </main>

  <footer class="footer">
    <div class="container">
      <p>CleanSpaces — Community-Powered Cleanup Service</p>
      <p class="muted">Manenberg · Mitchell's Plain · Khayelitsha</p>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))
</script>