<template>
	<section class="hero"><p>CleanSpaces</p><h1>Cleaner communities, together.</h1><span>See where our crews have made a difference and where they are working next.</span><router-link to="/how-it-works">Register your area</router-link></section>
	<section class="map-section">
		<div class="intro">
			<div>
				<p>Live cleanup map</p>
				<h2>Track work across your community.</h2>
			</div>
			<span>Tap a marker to see the area and its current cleanup status.</span>
		</div>
		<!-- Map removed; coworker will add updated map in her branch -->
	</section>
</template>

<script setup>
// ZoneMap component removed — replaced by coworker's implementation in another branch
</script>

<style scoped>.hero{min-height:52vh;display:grid;place-content:center;text-align:center;padding:4rem 1.5rem;color:#fff;background:linear-gradient(125deg,#0b2a25,#236353)}.hero p,.intro p{color:var(--green);font-weight:800;text-transform:uppercase;letter-spacing:.1em;font-size:.76rem}.hero h1{max-width:850px;margin:.3rem auto;font-size:clamp(2.3rem,6vw,4rem);line-height:1.05}.hero span{color:#d7e3df;font-size:1.1rem}.hero a{justify-self:center;margin-top:1.4rem;padding:.75rem 1rem;border-radius:8px;background:var(--green);color:var(--green-deeper);font-weight:800;text-decoration:none}.map-section{width:min(1120px,100%);margin:auto;padding:4rem 1.5rem}.intro{display:flex;justify-content:space-between;align-items:end;gap:1rem;margin-bottom:1.25rem}.intro p{margin:0}.intro h2{color:var(--green-dark);margin:.2rem 0;font-size:2rem}.intro>span{color:var(--text-muted);max-width:320px}@media(max-width:650px){.intro{align-items:start;flex-direction:column}}</style>
