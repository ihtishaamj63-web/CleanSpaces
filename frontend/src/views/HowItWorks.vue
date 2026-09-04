<template>
  <section class="hero"><div><p class="eyebrow">A cleaner neighbourhood starts together</p><h1>From community commitment to weekly cleanups.</h1><p>CleanSpaces helps neighbours organize, activate a zone and keep it cared for.</p><a href="#register" class="hero-button">Start your zone</a></div></section>
  <section class="steps"><div class="section-heading"><h2>How it works</h2><p>Four simple steps toward a cleaner shared space.</p></div><div class="step-grid"><article v-for="(step,index) in steps" :key="step.title" class="step"><span>0{{ index + 1 }}</span><h3>{{ step.title }}</h3><p>{{ step.description }}</p></article></div></section>
  <section id="register" class="register"><div class="register-copy"><p class="eyebrow">Register a zone</p><h2>Bring your street together.</h2><p>Tell us about your area and a local contact. Every registration is reviewed by the CleanSpaces team before activation.</p><ul><li>Registrations begin as pending</li><li>Choose the plan that fits your area</li><li>We'll contact you after review</li></ul></div><ZoneRegisterForm /></section>
</template>

<script setup>
import ZoneRegisterForm from '../components/ZoneRegisterForm.vue'
const steps = [
  { title: 'Gather Your Community', description: 'Speak to neighbours and build support for a cleaner street.' },
  { title: 'Choose Your Plan', description: 'Select a small, medium or large zone plan for your needs.' },
  { title: 'Register Your Zone', description: 'Send us your zone details and nominated community contact.' },
  { title: 'Employ Yourself', description: 'Regiester and employ yourself as a employee for CleanSpaces and work for your community .' }
]
</script>

<style scoped>
.hero { min-height:360px; display:grid; place-items:center; padding:4rem 1.5rem; color:#fff; background:linear-gradient(120deg,rgba(11,42,37,.96),rgba(18,51,45,.72)),url('https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1800&q=80') center/cover; }.hero>div,.steps,.register{width:min(1120px,100%);margin:auto}.hero>div{max-width:720px}.hero h1{font-size:clamp(2.25rem,5vw,4rem);line-height:1.08;margin:.2rem 0 1rem}.hero p:not(.eyebrow){font-size:1.12rem;color:#e4ece9;max-width:600px}.eyebrow{text-transform:uppercase;font-size:.76rem;letter-spacing:.12em;font-weight:800;color:var(--green);margin:0 0 .5rem}.hero-button{display:inline-block;margin-top:.8rem;padding:.75rem 1.2rem;border-radius:8px;background:var(--green);color:var(--green-deeper);font-weight:800;text-decoration:none}.steps{padding:4rem 1.5rem}.step-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.step{padding:1.4rem;background:#fff;border:1px solid var(--border);border-radius:12px}.step span{color:var(--green);font-size:1.35rem;font-weight:900}.step h3{color:var(--green-dark);margin:.5rem 0}.step p{color:var(--text-muted);margin:0}.register{padding:3.5rem 1.5rem 5rem;display:grid;grid-template-columns:.85fr 1.15fr;align-items:center;gap:3rem}.register h2{font-size:2.3rem;line-height:1.1;color:var(--green-dark);margin:.2rem 0 1rem}.register-copy>p:not(.eyebrow),li{color:var(--text-muted)}ul{padding-left:1.15rem}@media(max-width:800px){.step-grid{grid-template-columns:repeat(2,1fr)}.register{grid-template-columns:1fr;gap:1.5rem}}@media(max-width:460px){.step-grid{grid-template-columns:1fr}}
</style>
