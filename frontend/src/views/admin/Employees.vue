<template>
	<section class="admin-page">
		<AdminNav />
		<header>
			<p class="eyebrow">Crew management</p>
			<h1>Employees</h1>
			<p>Add team members and assign them to active zones.</p>
		</header>

		<p v-if="message" :class="['message', error ? 'error' : 'success']">{{ message }}</p>

		<div class="layout">
			<form class="card" @submit.prevent="save">
				<h2>{{ editing ? 'Edit crew member' : 'Add crew member' }}</h2>
				<label>Name
					<input v-model.trim="form.name" required />
				</label>

				<label>Phone
					<input v-model.trim="form.phone" required type="tel" />
				</label>

				<label>Role
					<select v-model="form.role" required>
						<option value="" disabled>Select a role</option>
						<option value="Crew Member">Crew Member</option>
						<option value="Crew Lead">Crew Lead</option>
						<option value="Operations Manager">Operations Manager</option>
					</select>
				</label>

				<label>Hire date
					<input v-model="form.hire_date" required type="date" />
				</label>

				<label>Assigned zone
					<select v-model="form.zone_id" required>
						<option value="" disabled>Select active zone</option>
						<option v-for="zone in zones" :value="zone.id" :key="zone.id">{{ zone.name }}</option>
					</select>
				</label>

				<label v-if="editing">Status
					<select v-model="form.status">
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</label>

				<div class="form-actions">
					<button>{{ editing ? 'Save changes' : 'Add employee' }}</button>
					<button v-if="editing" class="secondary" type="button" @click="reset">Cancel</button>
				</div>
			</form>

			<div class="employee-list">
				<article v-for="employee in employees" :key="employee.id" class="employee">
					<div>
						<h3>{{ employee.name }} <span :class="employee.status">{{ employee.status }}</span></h3>
						<p>{{ employee.role }} · {{ employee.zone_name }}</p>
						<small>{{ employee.phone }} · R{{ Number(employee.daily_wage).toFixed(2) }} / day</small>
					</div>
					<button class="secondary" @click="edit(employee)">Edit</button>
				</article>

				<p v-if="!employees.length" class="empty">No employees yet.</p>
			</div>
		</div>
	</section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../api.js'
import AdminNav from './AdminNav.vue'

const employees = ref([])
const zones = ref([])
const editing = ref(null)
const message = ref('')
const error = ref(false)

const blank = () => ({ name: '', phone: '', role: '', hire_date: '', zone_id: '', status: 'active' })
const form = reactive(blank())

async function load() {
	try {
		const [e, z] = await Promise.all([api.get('/employees'), api.get('/zones')])
		employees.value = e.data
		zones.value = z.data.filter((x) => x.status === 'active')
	} catch (e) {
		error.value = true
		message.value = 'Unable to load crew details.'
	}
}

function edit(e) {
	editing.value = e.id
	Object.assign(form, { ...e, hire_date: e.hire_date?.slice(0, 10) })
}

function reset() {
	editing.value = null
	Object.assign(form, blank())
}

async function save() {
	try {
		const data = { ...form, zone_id: Number(form.zone_id) }
		const result = editing.value ? await api.put(`/employees/${editing.value}`, data) : await api.post('/employees', data)
		message.value = result.data.message
		error.value = false
		reset()
		await load()
	} catch (e) {
		error.value = true
		message.value = e.response?.data?.message || 'Unable to save employee.'
	}
}

onMounted(load)
</script>

<style scoped>
.admin-page{width:min(1120px,100%);margin:auto;padding:2rem 1.5rem 4rem}
header{margin:2rem 0 1rem}
.eyebrow{color:var(--green);font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin:0}
h1{color:var(--green-dark);margin:.2rem 0}
header p:not(.eyebrow){color:var(--text-muted);margin:0}
.layout{display:grid;grid-template-columns:360px 1fr;gap:1.25rem}
.card,.employee{background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.2rem}
.card h2{margin:0 0 1rem;color:var(--green-dark)}
label{display:grid;gap:.3rem;margin:.7rem 0;font-weight:700;font-size:.85rem;color:var(--green-dark)}
input,select{padding:.65rem;border:1px solid var(--border);border-radius:7px}
.form-actions{display:flex;gap:.6rem;margin-top:1rem}
button{cursor:pointer;border:0;padding:.6rem .8rem;border-radius:7px;background:var(--green);color:var(--green-deeper);font-weight:800}
.secondary{background:#e7eeea;color:var(--green-dark)}
.employee-list{display:grid;gap:.75rem;align-content:start}
.employee{display:flex;justify-content:space-between;align-items:center}
.employee h3{margin:0;color:var(--green-dark)}
.employee p,.employee small{margin:.2rem 0;color:var(--text-muted)}
.employee span{font-size:.7rem;text-transform:uppercase;padding:.2rem .4rem;border-radius:99px}
.active{background:#e6f5e8;color:#286033}
.inactive{background:#eee;color:#666}
.message{padding:.7rem;border-radius:7px}
.success{background:#e7f5e8;color:#286033}
.error{background:#fff0f0;color:#9b2525}
.empty{color:var(--text-muted)}
@media(max-width:760px){.layout{grid-template-columns:1fr}}
</style>
