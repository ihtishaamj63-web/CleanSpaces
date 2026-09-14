<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="grid">
        <div class="col">
          <div class="brand">
            <span class="brand-mark">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
                <path d="M16 4c0 7 4 10 10 12-1 6-5 10-10 12-5-2-9-6-10-12 6-2 10-5 10-12z" fill="currentColor" opacity=".9"/>
              </svg>
            </span>
            <strong>CleanSpaces</strong>
          </div>
          <p>Community-led neighbourhood cleaning for the Cape Flats. Cleaner streets, healthier communities.</p>
        </div>

        <div class="col">
          <h4>Explore</h4>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/how-it-works">How It Works</RouterLink>
          <RouterLink to="/pricing">Pricing</RouterLink>
          <RouterLink to="/reviews">Reviews</RouterLink>
        </div>

        <div class="col">
          <h4>Support</h4>
          <RouterLink to="/contact">Contact</RouterLink>
          <RouterLink to="/signup">Join a Zone</RouterLink>
          <RouterLink to="/login">Resident Login</RouterLink>
          <RouterLink to="/login">Admin Login</RouterLink>
        </div>

        <div class="col">
          <h4>Get in touch</h4>
          <a href="mailto:cleanspaces@gmail.com">cleanspaces@gmail.com</a>
          <a href="https://wa.me/27000000000" target="_blank" rel="noopener">WhatsApp us</a>
          <span>Cape Town, South Africa</span>
        </div>
      </div>

      <div class="bottom">
        <span>© 2026 CleanSpaces. All rights reserved.</span>
        <span class="payfast">Payments by PayFast</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--green-dark);
  color: var(--green-chalk);
  padding: 62px 0 30px;
  margin-top: auto;
}
.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
  gap: 32px;
  margin-bottom: 44px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--cream);
  margin-bottom: 14px;
}
.brand-mark { color: var(--lime); }
.brand strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
}
.col p {
  font-size: 0.95rem;
  max-width: 280px;
  color: var(--green-chalk);
}
.col h4 {
  color: var(--cream);
  font-family: var(--font-body);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.col a, .col span {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: var(--green-chalk);
  transition: color 0.15s ease;
}
.col a:hover { color: var(--cream); }
.bottom {
  border-top: 1px solid rgba(220, 233, 212, 0.14);
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--green-chalk);
}
.payfast {
  background: rgba(255,255,255,0.06);
  padding: 4px 12px;
  border-radius: 999px;
}
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
