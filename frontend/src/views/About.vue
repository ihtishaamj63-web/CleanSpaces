<template>
  <div class="about-page">
    <section class="hero-section">
      <h1>About CleanSpaces</h1>
      <p class="hero-sub">Empowering communities through collective action and clean environment initiatives.</p>
    </section>

    <section class="content-section">
      <div class="card">
        <h2>Our Mission</h2>
        <p>CleanSpaces connects residents, local cleaning crews, and community leaders to build cleaner, safer, and healthier neighborhoods across the Cape Flats.</p>
      </div>

      <div class="card">
        <h2>Community Impact</h2>
        <p>By pooling small monthly contributions, communities maintain consistent waste management, create local jobs, and transform public spaces.</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
.about-page {
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
.content-section {
  max-width: 900px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 1.5rem;
}
.card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.card h2 {
  color: #17332C;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}
.card p {
  color: #5E7269;
  line-height: 1.6;
}
</style>
