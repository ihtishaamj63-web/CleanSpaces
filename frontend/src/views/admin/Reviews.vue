<template>
  <!-- Admin: moderate resident-submitted testimonials -->
  <section class="admin-page">
    <AdminNav />

    <header>
      <p class="eyebrow">Community moderation</p>
      <h1>Reviews</h1>
      <p>Approve or reject resident testimonials before they appear publicly.</p>
    </header>

    <p v-if="message" :class="['message', error ? 'error' : 'success']">{{ message }}</p>

    <div v-if="loading" class="empty">Loading reviews…</div>

    <div v-else class="review-grid">
      <article v-for="review in pending" :key="review.id" class="review">
        <div class="review-head">
          <strong>{{ review.name }}</strong>
          <span class="stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
        </div>
        <p class="quote">"{{ review.quote }}"</p>
        <small>Submitted {{ formatDate(review.created_at) }}</small>
        <div class="actions">
          <button @click="moderate(review.id, 'approved')">Approve</button>
          <button class="reject" @click="moderate(review.id, 'rejected')">Reject</button>
        </div>
      </article>

      <p v-if="!pending.length" class="empty">No reviews awaiting moderation.</p>
    </div>

    <section v-if="approved.length" class="approved-section">
      <h2>Published reviews</h2>
      <div class="approved-list">
        <article v-for="review in approved" :key="review.id" class="approved-row">
          <strong>{{ review.name }}</strong>
          <span class="approved-quote">"{{ review.quote.slice(0, 90) }}{{ review.quote.length > 90 ? '…' : '' }}"</span>
          <small>{{ formatDate(review.created_at) }}</small>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../api.js'
import AdminNav from './AdminNav.vue'
import { askConfirm } from '../../utils/confirm.js'

const pending = ref([])
const approved = ref([])
const loading = ref(true)
const message = ref('')
const error = ref(false)

const formatDate = (v) => new Date(v).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

// Load pending (to moderate) and approved (published) testimonials
async function load() {
  loading.value = true
  try {
    const [pend, app] = await Promise.all([
      api.get('/testimonials/pending'),
      api.get('/testimonials'),
    ])
    // testimonial endpoints wrap results: { success, data }
    pending.value = pend.data.data || []
    approved.value = app.data.data || []
  } catch (e) {
    error.value = true
    message.value = e.response?.data?.message || 'Unable to load reviews.'
  } finally {
    loading.value = false
  }
}

// Approve or reject — SweetAlert2 confirm for rejections
async function moderate(id, status) {
  if (status === 'rejected') {
    const confirmed = await askConfirm('Reject this review?', 'It will not appear publicly.')
    if (!confirmed) return
  }
  try {
    const result = await api.put(`/testimonials/${id}/moderate`, { status })
    message.value = result.data.message || (status === 'approved' ? 'Review published.' : 'Review rejected.')
    error.value = false
    await load()
  } catch (e) {
    error.value = true
    message.value = e.response?.data?.message || 'Unable to update this review.'
  }
}

onMounted(load)
</script>

<style scoped>
/* Page shell */
.admin-page { width: min(1120px, 100%); margin: auto; padding: 2rem 1.5rem 4rem; }
header { margin: 2rem 0 1rem; }
.eyebrow { color: var(--green); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
h1 { color: var(--green-dark); margin: 0.2rem 0; }
header p:not(.eyebrow) { color: var(--text-muted); margin: 0; }

.message { padding: 0.7rem; border-radius: 7px; }
.success { background: #e7f5e8; color: #286033; }
.error { background: #fff0f0; color: #9b2525; }

/* Pending review cards */
.review-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.review { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem; }
.review-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.review-head strong { color: var(--green-dark); }
.stars { color: #f4b942; }
.quote { color: var(--text); line-height: 1.6; margin: 0.75rem 0; font-style: italic; }
.review small { color: var(--text-muted); }
.actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.actions button {
  border: 0; border-radius: 6px; padding: 0.45rem 0.8rem;
  background: var(--green); color: var(--green-deeper);
  font-weight: 800; cursor: pointer;
}
.reject { background: #f9e4e4; color: #962a2a; }

/* Published list */
.approved-section { margin-top: 2.5rem; }
.approved-section h2 { color: var(--green-dark); }
.approved-list { display: grid; gap: 0.5rem; }
.approved-row {
  display: grid; grid-template-columns: 160px 1fr auto; gap: 1rem; align-items: baseline;
  padding: 0.8rem 1rem; background: #fff; border: 1px solid var(--border); border-radius: 10px;
}
.approved-row strong { color: var(--green-dark); }
.approved-quote { color: var(--text-muted); font-style: italic; }
.approved-row small { color: var(--text-muted); }

.empty { color: var(--text-muted); text-align: center; padding: 2rem; }

@media (max-width: 800px) {
  .review-grid { grid-template-columns: 1fr; }
  .approved-row { grid-template-columns: 1fr; gap: 0.25rem; }
}
</style>