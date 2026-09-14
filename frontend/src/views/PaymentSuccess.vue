<template>
  <div class="payment-success-page">
    <div class="success-card">
      <div class="icon">✅</div>
      <h1>Payment Successful!</h1>
      <p>Thank you for contributing to your CleanSpaces zone.</p>
      <router-link to="/resident/dashboard" class="btn-home">Back to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccessPage'
}
</script>

<style scoped>
.payment-success-page {
  background: #F7F3E8;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.success-card {
  background: #ffffff;
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  max-width: 440px;
}
.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.btn-home {
  display: inline-block;
  margin-top: 1.5rem;
  background: #7cb342;
  color: #ffffff;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}
</style>
