<template>
  <form class="zone-form" @submit.prevent="submit">
    <div class="form-grid">
      <label>Zone name<input v-model.trim="form.name" required placeholder="e.g. Rosewood Street" /></label>
      <label>Suburb<input v-model.trim="form.neighborhood" required placeholder="e.g. Manenberg" /></label>
      <label>Households<input v-model.number="form.households" required min="1" type="number" placeholder="80" /></label>
      <label>Plan<select v-model="form.plan_type" required><option value="" disabled>Select a plan</option><option value="small">Small Zone</option><option value="medium">Medium Zone</option><option value="large">Large Zone</option></select></label>
      <label>Contact name<input v-model.trim="form.contact_name" required autocomplete="name" /></label>
      <label>Contact phone<input v-model.trim="form.contact_phone" required type="tel" autocomplete="tel" /></label>
    </div>
    <p v-if="message" :class="['form-message', error ? 'error' : 'success']">{{ message }}</p>
    <button class="submit-btn" :disabled="saving">{{ saving ? 'Submitting…' : 'Register your zone' }}</button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../api.js'

const form = reactive({ name: '', neighborhood: '', households: null, plan_type: '', contact_name: '', contact_phone: '' })
const saving = ref(false); const message = ref(''); const error = ref(false)
async function submit() {
  saving.value = true; message.value = ''
  try {
    const { data } = await api.post('/zones/register', form)
    error.value = false; message.value = data.message
    Object.assign(form, { name: '', neighborhood: '', households: null, plan_type: '', contact_name: '', contact_phone: '' })
  } catch (err) { error.value = true; message.value = err.response?.data?.message || 'Something went wrong. Please try again.' }
  finally { saving.value = false }
}
</script>

<style scoped>
.zone-form { padding: 1.5rem; border-radius: 14px; background: white; box-shadow: 0 12px 35px rgba(18,51,45,.12); }
.form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
label { display:grid; gap:.35rem; font-weight:700; font-size:.88rem; color:var(--green-dark); }
input,select { width:100%; padding:.72rem .8rem; border:1px solid var(--border); border-radius:8px; background:#fff; color:var(--text); }
input:focus,select:focus { outline:2px solid #b7d98a; border-color:var(--green); }
.submit-btn { width:100%; margin-top:1.25rem; padding:.85rem; cursor:pointer; border:0; border-radius:8px; background:var(--green); color:var(--green-deeper); font-weight:800; }
.submit-btn:disabled { opacity:.65; cursor:wait; }.form-message { margin:1rem 0 0; padding:.75rem; border-radius:8px; }.success { color:#286033; background:#e7f5e8; }.error { color:#9b2525; background:#fff0f0; }
@media(max-width:600px){.form-grid{grid-template-columns:1fr}}
</style>
