<template>
  <div class="how-it-works">
    <section class="hero-section">
      <h1>How CleanSpaces Works</h1>
      <p class="hero-sub">Community-powered neighbourhood cleaning in 4 simple steps.</p>
    </section>

    <section class="steps-section">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Create or Join a Zone</h3>
        <p>Residents sign up and join their local neighborhood zone or create a new cleanup zone.</p>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Pool Monthly Contributions</h3>
        <p>Community members contribute a small monthly fee to fund dedicated local cleaning crews.</p>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <h3>Regular Cleanup Days</h3>
        <p>Employed local crews perform weekly waste collection and neighbourhood maintenance.</p>
      </div>

      <div class="step-card">
        <div class="step-number">4</div>
        <h3>Transparent Photo Reports</h3>
        <p>Crew leaders upload before-and-after photo reports for residents and admins to verify progress.</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HowItWorksPage'
}
</script>

<style scoped>
.how-it-works {
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
.hero-section h1 {
  font-family: 'Fraunces', serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.hero-sub {
  color: #B9C9C2;
  font-size: 1.1rem;
}
.steps-section {
  max-width: 1000px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0 1.5rem;
}
.step-card {
  background: #ffffff;
  padding: 2rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  text-align: center;
}
.step-number {
  width: 48px;
  height: 48px;
  line-height: 48px;
  border-radius: 50%;
  background: #7cb342;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 auto 1rem;
}
.step-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #17332C;
}
.step-card p {
  color: #5E7269;
  font-size: 0.95rem;
  line-height: 1.4;
}
</style>
