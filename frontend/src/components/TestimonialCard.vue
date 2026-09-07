<template>
  <article class="testimonial-card">
    <div class="quote-mark">“</div>

    <div class="rating">
      <span v-for="star in 5" :key="star" :class="{ filled: star <= rating }">
        ★
      </span>
    </div>

    <p class="quote">
      {{ quote }}
    </p>

    <div class="reviewer">
      <div class="avatar">
        {{ name.charAt(0).toUpperCase() }}
      </div>

      <div class="reviewer-info">
        <h3>{{ name }}</h3>
        <span>CleanSpaces Community Member</span>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },

  quote: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.testimonial-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e4eee7;
  border-radius: 24px;
  padding: 30px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-8px);
  border-color: #b8d8c3;
  box-shadow: 0 18px 40px rgba(31, 89, 54, 0.12);
}

.quote-mark {
  position: absolute;
  top: 8px;
  right: 22px;
  font-family: Georgia, serif;
  font-size: 82px;
  line-height: 1;
  color: #e9f4ec;
  pointer-events: none;
}

.rating {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.rating span {
  font-size: 19px;
  color: #d8dfda;
}

.rating span.filled {
  color: #f4b942;
}

.quote {
  position: relative;
  z-index: 1;
  margin: 0 0 28px;
  color: #45564c;
  font-size: 16px;
  line-height: 1.7;
}

.reviewer {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-top: 20px;
  border-top: 1px solid #edf2ee;
}

.avatar {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #176b3a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
}

.reviewer-info h3 {
  margin: 0 0 4px;
  color: #183b28;
  font-size: 15px;
}

.reviewer-info span {
  color: #849087;
  font-size: 12px;
}

@media (max-width: 600px) {
  .testimonial-card {
    padding: 24px;
  }
}
</style>
