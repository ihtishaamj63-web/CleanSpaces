<template>
  <div class="container center">
    <div v-if="payment" class="card success-card">
      <div class="check">✓</div>
      <h1>Payment Successful</h1>
      <p>Thank you! Your contribution to your zone has been received.</p>
      <div class="details">
        <div class="row">
          <span>Reference</span>
          <span>#CS-{{ String(payment.id).padStart(5, '0') }}</span>
        </div>
        <div class="row">
          <span>Amount</span>
          <span>R{{ payment.amount }}</span>
        </div>
        <div class="row">
          <span>Method</span>
          <span>{{ payment.method }}</span>
        </div>
      </div>
      <router-link to="/resident/dashboard" class="btn">Go to My Dashboard</router-link>
    </div>
    <p v-else class="muted">Loading your payment…</p>
  </div>
</template>