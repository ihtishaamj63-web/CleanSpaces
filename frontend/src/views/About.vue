<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="hero-content">
        <span class="hero-tag">ABOUT CLEANSPACES</span>

        <h1>
          Creating Cleaner Spaces,
          <span>Building Better Communities.</span>
        </h1>

        <p>
          CleanSpaces is dedicated to creating cleaner, healthier and more
          sustainable communities through smarter waste management and
          meaningful community action.
        </p>
      </div>
    </section>

    <section class="story-section">
      <div class="story-content">
        <div class="section-heading">
          <span class="section-tag">OUR STORY</span>
          <h2>Where Clean Spaces Become Stronger Communities</h2>
        </div>

        <div class="story-text">
          <p>
            CleanSpaces was created from a simple idea: everyone deserves to
            live in a clean, safe and healthy environment.
          </p>

          <p>
            We saw how unmanaged waste can affect communities, public spaces and
            the people who live in them. Instead of simply identifying these
            problems, we wanted to create a platform that helps people take
            action.
          </p>

          <p>
            CleanSpaces connects residents, communities and waste management
            services to make reporting waste issues easier, encourage
            responsible waste practices and help create cleaner spaces for
            everyone.
          </p>
        </div>
      </div>
    </section>

    <section class="mission-section">
      <div class="mission-card">
        <div class="mission-icon">♻</div>

        <div class="mission-content">
          <span class="section-tag">OUR MISSION</span>

          <h2>Making every community cleaner, one space at a time.</h2>

          <p>
            Our mission is to empower communities with accessible tools and
            information that make it easier to report waste problems, promote
            responsible waste management and contribute to cleaner, healthier
            environments.
          </p>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="team-heading">
        <span class="section-tag">MEET THE TEAM</span>

        <h2>The People Behind CleanSpaces</h2>

        <p>
          Meet the founders working together to make cleaner communities
          possible.
        </p>
      </div>

      <div class="team-grid">
        <!-- Ihtishaam -->
        <article class="team-card">
          <div class="team-image">
            <div class="initials-avatar">I</div>
          </div>

          <div class="team-info">
            <h3>Ihtishaam</h3>
            <span>Co-Founder & Operations Director</span>
            <p>
              Ensures CleanSpaces operates efficiently and turns ideas into
              meaningful action.
            </p>
          </div>
        </article>

        <!-- Krishendree -->
        <article class="team-card">
          <div class="team-image">
            <div class="initials-avatar">K</div>
          </div>

          <div class="team-info">
            <h3>Krishendree</h3>
            <span>Co-Founder & Strategy Director</span>
            <p>
              Shapes the direction of CleanSpaces and helps turn our vision into
              long-term goals.
            </p>
          </div>
        </article>

        <!-- Sibongile -->
        <article class="team-card">
          <div class="team-image">
            <div class="initials-avatar">S</div>
          </div>

          <div class="team-info">
            <h3>Sibongile</h3>
            <span>Co-Founder & Marketing Director</span>
            <p>
              Builds awareness around CleanSpaces and connects our mission with
              the communities we serve.
            </p>
          </div>
        </article>

        <!-- Mubaarik -->
        <article class="team-card">
          <div class="team-image">
            <div class="initials-avatar">M</div>
          </div>

          <div class="team-info">
            <h3>Mubaarik</h3>
            <span>Co-Founder & Customer Experience Director</span>
            <p>
              Focuses on creating a positive, accessible and helpful experience
              for every CleanSpaces user.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="reviews-cta">
      <div class="reviews-content">
        <span class="section-tag">OUR COMMUNITY</span>

        <h2>See What Our Community Has to Say</h2>

        <p>
          Discover experiences and feedback from people who are part of the
          CleanSpaces community.
        </p>

        <router-link to="/reviews" class="reviews-button">
          Explore Reviews
          <span>→</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
// Static About page — no backend logic required.
</script>

<style scoped>
.about-page {
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  color: #17251d;
}

.about-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  padding: 100px 8%;
  background:
    radial-gradient(
      circle at 85% 25%,
      rgba(92, 180, 126, 0.18),
      transparent 30%
    ),
    linear-gradient(135deg, #f3faf5 0%, #ffffff 55%, #eef8f1 100%);
}

.about-hero::before {
  content: "";
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: rgba(76, 175, 112, 0.08);
  right: -120px;
  top: -100px;
}

.about-hero::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px solid rgba(76, 175, 112, 0.15);
  right: 13%;
  bottom: -70px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 850px;
}

.hero-tag,
.section-tag {
  display: inline-block;
  margin-bottom: 16px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #32945a;
}

.hero-content h1 {
  margin: 0;
  max-width: 850px;
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
  font-weight: 850;
}

.hero-content h1 span {
  display: block;
  color: #3aa465;
}

.hero-content p {
  max-width: 680px;
  margin-top: 30px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #607066;
}

.story-section {
  padding: 110px 8%;
  background: #ffffff;
}

.story-content {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 90px;
  max-width: 1250px;
  margin: 0 auto;
  align-items: start;
}

.section-heading h2,
.team-heading h2,
.reviews-content h2 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #17251d;
}

.story-text {
  position: relative;
  padding-left: 35px;
  border-left: 3px solid #d8efdf;
}

.story-text p {
  margin: 0 0 24px;
  font-size: 1.05rem;
  line-height: 1.85;
  color: #66736b;
}

.story-text p:last-child {
  margin-bottom: 0;
}

.mission-section {
  padding: 30px 8% 110px;
}

.mission-card {
  position: relative;
  max-width: 1250px;
  margin: 0 auto;
  padding: 65px 70px;
  display: flex;
  align-items: center;
  gap: 55px;
  border-radius: 32px;
  background: #173b27;
  color: white;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(23, 59, 39, 0.15);
}

.mission-card::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  right: -100px;
  bottom: -150px;
  border-radius: 50%;
  border: 60px solid rgba(255, 255, 255, 0.05);
}

.mission-icon {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 105px;
  height: 105px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 3.3rem;
}

.mission-content {
  position: relative;
  z-index: 1;
}

.mission-content .section-tag {
  color: #7ee19e;
}

.mission-content h2 {
  max-width: 850px;
  margin: 0 0 20px;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.mission-content p {
  max-width: 850px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.72);
}

.team-section {
  padding: 110px 8%;
  background: #f6faf7;
}

.team-heading {
  max-width: 720px;
  margin: 0 auto 65px;
  text-align: center;
}

.team-heading p {
  margin: 20px auto 0;
  max-width: 600px;
  color: #68766e;
  line-height: 1.7;
}

.team-grid {
  max-width: 1250px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.team-card {
  display: grid;
  grid-template-columns: 190px 1fr;
  min-height: 230px;
  background: #ffffff;
  border: 1px solid #e3eee7;
  border-radius: 26px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.team-card:hover {
  transform: translateY(-8px);
  border-color: #b9ddc4;
  box-shadow: 0 20px 45px rgba(38, 91, 57, 0.12);
}

.team-image {
  min-height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #dff3e5, #bce2c9);
}

.initials-avatar {
  width: 105px;
  height: 105px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  color: #319158;
  font-size: 3rem;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(38, 91, 57, 0.12);
}

.team-info {
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.team-info h3 {
  margin: 0 0 7px;
  font-size: 1.5rem;
  color: #17251d;
}

.team-info span {
  display: block;
  margin-bottom: 15px;
  font-size: 0.82rem;
  font-weight: 750;
  line-height: 1.4;
  color: #39975c;
}

.team-info p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: #6b776f;
}

.reviews-cta {
  padding: 110px 8%;
  background: #ffffff;
}

.reviews-content {
  max-width: 850px;
  margin: 0 auto;
  text-align: center;
}

.reviews-content p {
  max-width: 620px;
  margin: 22px auto 32px;
  color: #68766e;
  line-height: 1.75;
}

.reviews-button {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 16px 25px;
  border-radius: 14px;
  background: #3aa465;
  color: #ffffff;
  text-decoration: none;
  font-weight: 750;
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.reviews-button span {
  font-size: 1.25rem;
  transition: transform 0.25s ease;
}

.reviews-button:hover {
  transform: translateY(-3px);
  background: #2f8e56;
  box-shadow: 0 12px 25px rgba(58, 164, 101, 0.25);
}

.reviews-button:hover span {
  transform: translateX(5px);
}

@media (max-width: 900px) {
  .about-hero {
    min-height: 470px;
    padding: 80px 6%;
  }

  .story-section,
  .team-section,
  .reviews-cta {
    padding-left: 6%;
    padding-right: 6%;
  }

  .story-content {
    grid-template-columns: 1fr;
    gap: 45px;
  }

  .mission-section {
    padding-left: 6%;
    padding-right: 6%;
  }

  .mission-card {
    padding: 50px;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .about-hero {
    min-height: 430px;
    padding: 70px 6%;
  }

  .hero-content h1 {
    font-size: 2.9rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .story-section,
  .team-section,
  .reviews-cta {
    padding-top: 75px;
    padding-bottom: 75px;
  }

  .story-text {
    padding-left: 22px;
  }

  .mission-section {
    padding: 0 5% 75px;
  }

  .mission-card {
    padding: 40px 25px;
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
    border-radius: 24px;
  }

  .mission-icon {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .team-grid {
    gap: 20px;
  }

  .team-card {
    grid-template-columns: 1fr;
  }

  .team-image {
    min-height: 220px;
  }

  .team-info {
    padding: 25px;
  }
}
</style>
