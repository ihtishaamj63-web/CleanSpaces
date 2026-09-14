<template>
  <div class="cleanup-requests">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1>Cleanup Requests</h1>
        <p>Requests submitted by residents across all zones.</p>
      </div>
      <button class="btn-refresh" :disabled="loading" @click="load">
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </header>

    <!-- Stats strip -->
    <div class="stats-strip">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="stat"
        :class="{ 'stat--active': activeStatus === tab.value }"
        @click="activeStatus = tab.value"
      >
        <span class="stat__count">{{ counts[tab.value] ?? 0 }}</span>
        <span class="stat__label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Search -->
    <div class="toolbar">
      <input
        v-model="search"
        type="search"
        placeholder="Search by resident, location or suburb…"
        class="search"
      />
    </div>

    <!-- State messages -->
    <p v-if="loading" class="state-msg">Loading…</p>
    <p v-else-if="error" class="state-msg state-msg--error">
      {{ error }}
      <button class="btn-retry" @click="load">Retry</button>
    </p>
    <p v-else-if="!filtered.length" class="state-msg">
      {{ requests.length ? 'No requests match your filters.' : 'No cleanup requests yet.' }}
    </p>

    <!-- Table (desktop) / cards (mobile) -->
    <div v-else class="requests">
      <!-- Column headers, hidden on mobile -->
      <div class="row row--head" aria-hidden="true">
        <div>#</div>
        <div>Resident</div>
        <div>Location</div>
        <div>Suburb</div>
        <div>Preferred</div>
        <div>Photo</div>
        <div>Status</div>
      </div>

      <div
        v-for="r in filtered"
        :key="r.id"
        class="row"
      >
        <div class="cell cell--id" data-label="#">{{ r.id }}</div>

        <div class="cell cell--resident" data-label="Resident">
          <strong>{{ r.resident_name || '—' }}</strong>
          <small v-if="r.resident_email">{{ r.resident_email }}</small>
          <small v-if="r.resident_phone">{{ r.resident_phone }}</small>
        </div>

        <div class="cell cell--location" data-label="Location">
          <strong>{{ r.location_name }}</strong>
          <small>{{ r.address }}</small>
        </div>

        <div class="cell" data-label="Suburb">{{ r.suburb }}</div>

        <div class="cell" data-label="Preferred">
          {{ r.preferred_date ? formatDate(r.preferred_date) : '—' }}
        </div>

        <div class="cell" data-label="Photo">
          <a
            v-if="r.photo_url"
            :href="photoUrl(r.photo_url)"
            target="_blank"
            rel="noopener"
            class="photo-link"
            title="Open photo in new tab"
          >View</a>
          <span v-else class="muted">—</span>
        </div>

        <div class="cell" data-label="Status">
          <span class="status-pill" :class="`status-pill--${r.status}`">
            {{ r.status }}
          </span>
          <select
            class="status-select"
            :value="r.status"
            :disabled="busyId === r.id"
            @change="updateStatus(r, $event.target.value)"
          >
            <option v-for="opt in statuses" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api.js'

const requests = ref([])
const loading = ref(true)
const error = ref('')
const busyId = ref(null)
const search = ref('')
const activeStatus = ref('all')

const statuses = ['new', 'reviewing', 'scheduled', 'completed']

const tabs = [
  { value: 'all',       label: 'All' },
  { value: 'new',       label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
]

// Strip a trailing "/api" so static /uploads/... is fetched from the server root.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const STATIC_ROOT = API_BASE.replace(/\/api\/?$/, '')

function photoUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${STATIC_ROOT}${path}`
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

// Counts per status (for the stat strip badges)
const counts = computed(() => {
  const c = { all: requests.value.length }
  for (const s of statuses) c[s] = 0
  for (const r of requests.value) {
    if (c[r.status] !== undefined) c[r.status] += 1
  }
  return c
})

// Filtered list: status tab + free text search
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return requests.value.filter((r) => {
    if (activeStatus.value !== 'all' && r.status !== activeStatus.value) return false
    if (!q) return true
    return [
      r.resident_name,
      r.resident_email,
      r.location_name,
      r.address,
      r.suburb,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/admin/cleanup-requests')
    requests.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load cleanup requests.'
  } finally {
    loading.value = false
  }
}

async function updateStatus(request, newStatus) {
  if (newStatus === request.status) return
  busyId.value = request.id
  const previous = request.status
  request.status = newStatus                 // optimistic update
  try {
    await api.put(`/admin/cleanup-requests/${request.id}`, { status: newStatus })
  } catch (err) {
    request.status = previous                // roll back
    error.value = err.response?.data?.message || 'Unable to update status.'
    // Auto-clear the error banner after 4s so the table isn't visually stuck.
    setTimeout(() => { if (error.value) error.value = '' }, 4000)
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.cleanup-requests {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  color: #17332C;
}

/* ---------- Header ---------- */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.page-header h1 {
  font-family: 'Fraunces', serif;
  font-size: 1.75rem;
  margin: 0 0 0.3rem;
}
.page-header p {
  color: #5E7269;
  margin: 0;
}

.btn-refresh,
.btn-retry {
  padding: 0.55rem 1rem;
  border-radius: 8px;
  border: 1px solid #d6dcd8;
  background: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  color: #17332C;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-refresh:hover:not(:disabled),
.btn-retry:hover {
  background: #f5f7f4;
  border-color: #b9c4be;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: wait;
}
.btn-retry {
  margin-left: 0.75rem;
}

/* ---------- Stat strip ---------- */
.stats-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #d6dcd8;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  font-family: inherit;
  font-size: 0.85rem;
  color: #17332C;
}
.stat:hover {
  border-color: #b9c4be;
}
.stat--active {
  background: #17332C;
  color: #fff;
  border-color: #17332C;
}
.stat__count {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.stat__label {
  font-weight: 500;
}

/* ---------- Toolbar ---------- */
.toolbar {
  margin-bottom: 1rem;
}
.search {
  width: 100%;
  max-width: 420px;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #d6dcd8;
  background: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}
.search:focus {
  border-color: #7cb342;
}

/* ---------- State messages ---------- */
.state-msg {
  text-align: center;
  padding: 3rem 1rem;
  color: #5E7269;
}
.state-msg--error {
  color: #c0392b;
}

/* ---------- Table ---------- */
.requests {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}
.row {
  display: grid;
  grid-template-columns: 44px 1.6fr 1.6fr 1fr 1fr 0.7fr 1.2fr;
  align-items: start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #eef1ee;
  font-size: 0.9rem;
}
.row:last-child {
  border-bottom: none;
}
.row--head {
  background: #f5f7f4;
  font-weight: 600;
  color: #17332C;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
}
.cell {
  min-width: 0;
  word-break: break-word;
}
.cell--id {
  font-variant-numeric: tabular-nums;
  color: #5E7269;
}
.cell--resident,
.cell--location {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell--resident small,
.cell--location small {
  color: #718096;
  font-size: 0.78rem;
}

/* Status pill + select */
.status-pill {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}
.status-pill--new       { background: #e3f2fd; color: #1565c0; }
.status-pill--reviewing { background: #fff8e1; color: #ef6c00; }
.status-pill--scheduled { background: #ede7f6; color: #4527a0; }
.status-pill--completed { background: #e8f5e9; color: #2e7d32; }

.status-select {
  display: block;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d6dcd8;
  background: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
}
.status-select:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* Photo link */
.photo-link {
  color: #2e7d32;
  text-decoration: none;
  font-weight: 600;
}
.photo-link:hover {
  text-decoration: underline;
}
.muted {
  color: #a0aec0;
}

/* ---------- Responsive: turn rows into cards below 900px ---------- */
@media (max-width: 900px) {
  .row--head {
    display: none;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border-bottom: 1px solid #eef1ee;
  }
  .cell {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
  }
  .cell::before {
    content: attr(data-label);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #7b8a83;
    font-weight: 600;
    flex-shrink: 0;
  }
  .cell--resident,
  .cell--location {
    flex-direction: column;
    align-items: flex-start;
  }
  .cell--resident::before,
  .cell--location::before {
    margin-bottom: 2px;
  }
}
</style>