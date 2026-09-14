<template>
  <div class="payment-page">
    <section class="hero-section">
      <h1>Contribution Payment</h1>
      <p class="hero-sub">Secure online payment for monthly zone cleanup contributions.</p>
    </section>

    <section class="content-section">
      <div class="payment-card">
        <h3>Zone Contribution</h3>
        <p>R 150.00 / month</p>
        <button class="btn-pay" @click="handlePayment">Proceed to PayFast</button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'PaymentPage',
  methods: {
    handlePayment() {
      alert('Redirecting to PayFast...')
    }
  }
}
</script>

<style scoped>
.payment-page {
  background: #F7F3E8;
  color: #17332C;
  min-height: 100vh;
  padding-bottom: 4rem;
}
.hero-section {
  background: linear-gradient(165deg, #1E4B3D 0%, #122A24 85%);
  color: #ffffff;
  text-align: center;
  padding: calc(100px + 2rem) 1.5rem 4rem;
}
.content-section {
  max-width: 500px;
  margin: 3rem auto 0;
  padding: 0 1.5rem;
}
.payment-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.btn-pay {
  background: #7cb342;
  color: #ffffff;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
