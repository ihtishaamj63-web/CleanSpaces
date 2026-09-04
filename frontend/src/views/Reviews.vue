<template>
  <div class="reviews-page">
    <!-- HERO -->
    <section class="reviews-hero">
      <div class="hero-content">
        <span class="hero-tag">COMMUNITY VOICES</span>

        <h1>
          Real People.
          <span>Real Impact.</span>
        </h1>

        <p>
          See how CleanSpaces is helping communities create cleaner, healthier
          spaces together.
        </p>

        <a href="#reviews-content" class="hero-button">
          Explore Reviews
          <span>↓</span>
        </a>
      </div>

      <div class="hero-decoration">
        <div class="floating-star star-one">★</div>
        <div class="floating-star star-two">★</div>
        <div class="floating-star star-three">★</div>

        <div class="hero-circle">
          <span>★</span>
        </div>
      </div>
    </section>

    <!-- CONTENT -->
    <main id="reviews-content">
      <!-- RATING SUMMARY -->
      <section class="rating-section">
        <div class="section-heading">
          <span class="section-label">TRUSTED BY OUR COMMUNITY</span>
          <h2>What people are saying</h2>
          <p>
            Every review represents a community member who believes cleaner
            spaces make a difference.
          </p>
        </div>

        <div class="rating-card">
          <div class="rating-score">
            <strong>{{ averageRating }}</strong>
            <div class="rating-stars">
              <span
                v-for="star in 5"
                :key="star"
                :class="{ active: star <= Math.round(averageRating) }"
              >
                ★
              </span>
            </div>
            <span class="rating-count">
              {{ testimonials.length }}
              {{ testimonials.length === 1 ? "review" : "reviews" }}
            </span>
          </div>

          <div class="rating-divider"></div>

          <div class="rating-message">
            <div class="rating-icon">♥</div>
            <div>
              <strong>Thank you, community!</strong>
              <p>Your feedback helps us continue improving CleanSpaces.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- BEFORE / AFTER -->
      <section class="cleanup-section">
        <div class="section-heading centered">
          <span class="section-label">SEE THE DIFFERENCE</span>
          <h2>Before &amp; After</h2>
          <p>
            Take a look at some of the spaces our cleanup teams have helped
            transform.
          </p>
        </div>

        <div v-if="photosLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading cleanup transformations...</p>
        </div>

        <div v-else-if="cleanupPhotos.length" class="cleanup-grid">
          <article
            v-for="photo in cleanupPhotos"
            :key="photo.id"
            class="cleanup-card"
          >
            <div class="photo-container">
              <div class="photo-side before">
                <img :src="photo.before_url" alt="Before cleanup" />
                <span class="photo-label">BEFORE</span>
              </div>

              <div class="photo-side after">
                <img :src="photo.after_url" alt="After cleanup" />
                <span class="photo-label">AFTER</span>
              </div>

              <div class="transform-icon">→</div>
            </div>

            <div class="cleanup-info">
              <div>
                <h3>Community Cleanup</h3>
                <p v-if="photo.notes">{{ photo.notes }}</p>
              </div>

              <span class="cleanup-date">
                {{ formatDate(photo.date_cleaned) }}
              </span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📸</div>
          <h3>Cleanup stories are coming soon</h3>
          <p>
            Our completed cleanup transformations will appear here once they
            have been recorded.
          </p>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="testimonials-section">
        <div class="section-heading centered">
          <span class="section-label">COMMUNITY STORIES</span>
          <h2>Hear from our residents</h2>
          <p>
            Discover what members of our communities think about CleanSpaces.
          </p>
        </div>

        <div v-if="testimonialsLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading community reviews...</p>
        </div>

        <div v-else-if="testimonials.length" class="testimonials-grid">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            :name="testimonial.name"
            :quote="testimonial.quote"
            :rating="testimonial.rating"
          />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Be the first to share your experience</h3>
          <p>
            Your review could help inspire another community to make a
            difference.
          </p>
        </div>
      </section>

      <!-- WRITE REVIEW -->
      <section class="review-form-section">
        <div class="form-intro">
          <span class="section-label">YOUR VOICE MATTERS</span>

          <h2>
            Share your
            <span>CleanSpaces</span>
            experience.
          </h2>

          <p>
            Have you seen the difference CleanSpaces is making? Tell your
            community about it.
          </p>

          <div class="form-note">
            <span>✓</span>
            <p>
              All reviews are checked by our team before appearing publicly.
            </p>
          </div>
        </div>

        <form class="review-form" @submit.prevent="submitReview">
          <div v-if="formSuccess" class="success-message">
            <span>✓</span>
            <div>
              <strong>Review submitted!</strong>
              <p>Thank you! Your review is now awaiting approval.</p>
            </div>
          </div>

          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>

          <div class="form-group">
            <label for="review-name">Your name</label>
            <input
              id="review-name"
              v-model="reviewForm.name"
              type="text"
              placeholder="Enter your name"
              required
            />
          </div>

          <div class="form-group">
            <label>Your rating</label>

            <div class="star-selector">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                :class="{ selected: star <= reviewForm.rating }"
                @click="reviewForm.rating = star"
              >
                ★
              </button>
            </div>

            <span class="rating-hint">
              {{ ratingText }}
            </span>
          </div>

          <div class="form-group">
            <label for="review-quote">Your experience</label>

            <textarea
              id="review-quote"
              v-model="reviewForm.quote"
              rows="5"
              maxlength="500"
              placeholder="Tell us about your CleanSpaces experience..."
              required
            ></textarea>

            <span class="character-count">
              {{ reviewForm.quote.length }}/500
            </span>
          </div>

          <button type="submit" class="submit-button" :disabled="submitting">
            <span v-if="!submitting">
              Submit my review
              <span>→</span>
            </span>

            <span v-else> Submitting... </span>
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import TestimonialCard from "../components/TestimonialCard.vue";

const cleanupPhotos = ref([]);
const testimonials = ref([]);

const photosLoading = ref(true);
const testimonialsLoading = ref(true);
const submitting = ref(false);

const formSuccess = ref(false);
const formError = ref("");

const reviewForm = reactive({
  name: "",
  quote: "",
  rating: 0,
});

const averageRating = computed(() => {
  if (!testimonials.value.length) {
    return "0.0";
  }

  const total = testimonials.value.reduce(
    (sum, testimonial) => sum + Number(testimonial.rating),
    0,
  );

  return (total / testimonials.value.length).toFixed(1);
});

const ratingText = computed(() => {
  const messages = {
    0: "Select a rating",
    1: "Not great",
    2: "Could be better",
    3: "Good",
    4: "Great!",
    5: "Excellent!",
  };

  return messages[reviewForm.rating];
});

const fetchCleanupPhotos = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/reviews/cleanup-photos",
    );

    const data = await response.json();

    if (data.success) {
      cleanupPhotos.value = data.data;
    }
  } catch (error) {
    console.error("Error loading cleanup photos:", error);
  } finally {
    photosLoading.value = false;
  }
};

const fetchTestimonials = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/testimonials");

    const data = await response.json();

    if (data.success) {
      testimonials.value = data.data;
    }
  } catch (error) {
    console.error("Error loading testimonials:", error);
  } finally {
    testimonialsLoading.value = false;
  }
};

const submitReview = async () => {
  formError.value = "";
  formSuccess.value = false;

  if (reviewForm.rating === 0) {
    formError.value = "Please select a star rating.";
    return;
  }

  submitting.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/testimonials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: reviewForm.name,
        quote: reviewForm.quote,
        rating: reviewForm.rating,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit review.");
    }

    formSuccess.value = true;

    reviewForm.name = "";
    reviewForm.quote = "";
    reviewForm.rating = 0;
  } catch (error) {
    console.error("Review submission error:", error);
    formError.value = error.message || "Unable to submit your review.";
  } finally {
    submitting.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

onMounted(() => {
  fetchCleanupPhotos();
  fetchTestimonials();
});
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background: #f7faf8;
  color: #183b28;
}

/* HERO */

.reviews-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 80px 8%;
  background: linear-gradient(135deg, #eaf6ed 0%, #f7fbf8 55%, #dff0e5 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 650px;
}

.hero-tag,
.section-label {
  display: inline-block;
  margin-bottom: 16px;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(48px, 7vw, 82px);
  line-height: 0.98;
  letter-spacing: -4px;
  color: #173b27;
}

.hero-content h1 span {
  display: block;
  color: #198044;
}

.hero-content p {
  max-width: 560px;
  margin: 28px 0;
  color: #5e7165;
  font-size: 18px;
  line-height: 1.7;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 15px 23px;
  border-radius: 50px;
  background: #176b3a;
  color: white;
  text-decoration: none;
  font-weight: 700;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.hero-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(23, 107, 58, 0.25);
}

.hero-button span {
  font-size: 20px;
}

.hero-decoration {
  position: absolute;
  right: 8%;
  width: 400px;
  height: 400px;
}

.hero-circle {
  position: absolute;
  inset: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(23, 107, 58, 0.15);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
}

.hero-circle::before,
.hero-circle::after {
  content: "";
  position: absolute;
  border: 1px solid rgba(23, 107, 58, 0.1);
  border-radius: 50%;
}

.hero-circle::before {
  inset: 35px;
}

.hero-circle::after {
  inset: -35px;
}

.hero-circle span {
  font-size: 110px;
  color: #f4b942;
  filter: drop-shadow(0 10px 15px rgba(244, 185, 66, 0.2));
}

.floating-star {
  position: absolute;
  color: #f4b942;
  font-size: 24px;
  animation: float 4s ease-in-out infinite;
}

.star-one {
  top: 25px;
  left: 80px;
}

.star-two {
  right: 30px;
  top: 120px;
  font-size: 18px;
  animation-delay: 1s;
}

.star-three {
  left: 20px;
  bottom: 80px;
  font-size: 15px;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

/* GENERAL SECTIONS */

main {
  overflow: hidden;
}

.rating-section,
.cleanup-section,
.testimonials-section {
  padding: 100px 8%;
}

.section-heading {
  max-width: 650px;
  margin-bottom: 45px;
}

.section-heading.centered {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.section-heading h2 {
  margin: 0 0 15px;
  color: #183b28;
  font-size: clamp(34px, 5vw, 52px);
  letter-spacing: -2px;
}

.section-heading p {
  margin: 0;
  color: #718077;
  line-height: 1.7;
}

/* RATING */

.rating-card {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 50px;
  padding: 35px 42px;
  background: white;
  border: 1px solid #e4eee7;
  border-radius: 28px;
  box-shadow: 0 15px 45px rgba(31, 89, 54, 0.07);
}

.rating-score {
  min-width: 180px;
  text-align: center;
}

.rating-score strong {
  display: block;
  font-size: 64px;
  line-height: 1;
  color: #176b3a;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin: 12px 0 8px;
}

.rating-stars span {
  color: #d9dfdb;
  font-size: 18px;
}

.rating-stars span.active {
  color: #f4b942;
}

.rating-count {
  color: #8a978f;
  font-size: 13px;
}

.rating-divider {
  width: 1px;
  height: 90px;
  background: #e6eee8;
}

.rating-message {
  display: flex;
  align-items: center;
  gap: 18px;
}

.rating-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 15px;
  background: #e9f5ec;
  color: #198044;
  font-size: 22px;
}

.rating-message strong {
  color: #183b28;
}

.rating-message p {
  margin: 5px 0 0;
  color: #78857d;
  font-size: 14px;
}

/* CLEANUP */

.cleanup-section {
  background: #ffffff;
}

.cleanup-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.cleanup-card {
  overflow: hidden;
  background: #f8fbf9;
  border: 1px solid #e3ede6;
  border-radius: 24px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.cleanup-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 18px 40px rgba(31, 89, 54, 0.12);
}

.photo-container {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 280px;
  overflow: hidden;
}

.photo-side {
  position: relative;
  overflow: hidden;
}

.photo-side img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cleanup-card:hover .photo-side img {
  transform: scale(1.04);
}

.photo-side::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15),
    transparent 40%,
    rgba(0, 0, 0, 0.2)
  );
}

.photo-label {
  position: absolute;
  z-index: 2;
  top: 16px;
  left: 16px;
  padding: 7px 11px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #183b28;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.transform-icon {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #176b3a;
  color: white;
  font-size: 21px;
  box-shadow: 0 6px 18px rgba(23, 107, 58, 0.3);
}

.cleanup-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 22px;
}

.cleanup-info h3 {
  margin: 0 0 5px;
  color: #183b28;
  font-size: 17px;
}

.cleanup-info p {
  margin: 0;
  color: #78857d;
  font-size: 13px;
  line-height: 1.5;
}

.cleanup-date {
  flex-shrink: 0;
  color: #8a978f;
  font-size: 12px;
}

/* TESTIMONIALS */

.testimonials-section {
  background: #f7faf8;
}

.testimonials-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* FORM */

.review-form-section {
  max-width: 1200px;
  margin: 100px auto;
  padding: 70px;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 80px;
  border-radius: 35px;
  background: linear-gradient(135deg, #e7f4ea, #f6fbf7);
}

.form-intro h2 {
  margin: 0 0 20px;
  color: #183b28;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.05;
  letter-spacing: -2px;
}

.form-intro h2 span {
  color: #198044;
}

.form-intro > p {
  color: #68776e;
  line-height: 1.7;
}

.form-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 30px;
  padding: 16px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.65);
}

.form-note span {
  color: #198044;
  font-weight: 800;
}

.form-note p {
  margin: 0;
  color: #65746b;
  font-size: 13px;
  line-height: 1.5;
}

.review-form {
  padding: 30px;
  background: white;
  border-radius: 25px;
  box-shadow: 0 15px 40px rgba(31, 89, 54, 0.08);
}

.form-group {
  position: relative;
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #294635;
  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid #dce7df;
  border-radius: 13px;
  outline: none;
  background: #fbfdfc;
  color: #294635;
  font-family: inherit;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #198044;
  box-shadow: 0 0 0 4px rgba(25, 128, 68, 0.08);
}

.form-group textarea {
  resize: vertical;
  min-height: 130px;
}

.star-selector {
  display: flex;
  gap: 5px;
}

.star-selector button {
  padding: 0;
  border: none;
  background: transparent;
  color: #d7dfda;
  cursor: pointer;
  font-size: 34px;
  line-height: 1;
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.star-selector button:hover {
  transform: scale(1.15);
}

.star-selector button.selected {
  color: #f4b942;
}

.rating-hint {
  display: block;
  margin-top: 8px;
  color: #8a978f;
  font-size: 12px;
}

.character-count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #9aa59f;
  font-size: 11px;
}

.submit-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 13px;
  background: #176b3a;
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(23, 107, 58, 0.2);
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.success-message,
.error-message {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  padding: 14px;
  border-radius: 12px;
  font-size: 13px;
}

.success-message {
  background: #e9f7ed;
  color: #24633a;
}

.success-message span {
  font-size: 18px;
  font-weight: 800;
}

.success-message strong {
  display: block;
  margin-bottom: 3px;
}

.success-message p {
  margin: 0;
}

.error-message {
  background: #fff0f0;
  color: #a33d3d;
}

/* STATES */

.loading-state,
.empty-state {
  max-width: 700px;
  margin: 0 auto;
  padding: 55px 30px;
  text-align: center;
}

.spinner {
  width: 35px;
  height: 35px;
  margin: 0 auto 15px;
  border: 3px solid #dcebe0;
  border-top-color: #198044;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state p,
.empty-state p {
  color: #7b887f;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  margin-bottom: 15px;
  font-size: 42px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #294635;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .hero-decoration {
    right: -80px;
    opacity: 0.65;
  }

  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .review-form-section {
    margin-left: 5%;
    margin-right: 5%;
    padding: 50px;
    gap: 45px;
  }
}

@media (max-width: 750px) {
  .reviews-hero {
    min-height: auto;
    padding: 80px 7%;
  }

  .hero-decoration {
    display: none;
  }

  .rating-section,
  .cleanup-section,
  .testimonials-section {
    padding: 70px 6%;
  }

  .rating-card {
    flex-direction: column;
    gap: 25px;
    padding: 30px;
    text-align: center;
  }

  .rating-divider {
    width: 100%;
    height: 1px;
  }

  .rating-message {
    text-align: left;
  }

  .cleanup-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .review-form-section {
    grid-template-columns: 1fr;
    margin: 60px 5%;
    padding: 35px 25px;
    gap: 35px;
  }
}

@media (max-width: 500px) {
  .hero-content h1 {
    letter-spacing: -2px;
  }

  .photo-container {
    height: 220px;
  }

  .cleanup-info {
    flex-direction: column;
    gap: 8px;
  }

  .review-form {
    padding: 22px;
  }
}
</style>
