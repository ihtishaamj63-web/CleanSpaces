<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapEl = ref(null)
let map = null

const zones = [
  { name: 'Manenberg Zone A', households: 72, status: 'active', lat: -33.9735, lng: 18.5444 },
  { name: 'Manenberg Zone B', households: 64, status: 'pending', lat: -33.973, lng: 18.549 },
  { name: "Mitchell's Plain Rocklands", households: 180, status: 'active', lat: -34.05, lng: 18.580 },
  { name: "Mitchell's Plain East", households: 160, status: 'pending', lat: -34.058, lng: 18.570 },
  { name: 'Khayelitsha Site C', households: 320, status: 'active', lat: -34.0397, lng: 18.6638 },
  { name: 'Khayelitsha Site B', households: 290, status: 'pending', lat: -34.047, lng: 18.652 },
]

const targetAreas = [
  { name: 'Manenberg', lat: -33.9735, lng: 18.5444 },
  { name: "Mitchell's Plain", lat: -34.05, lng: 18.580 },
  { name: 'Khayelitsha', lat: -34.0397, lng: 18.6638 },
]

const activeZones = zones.filter((z) => z.status === 'active').length
const totalHouseholds = zones.reduce((a, z) => a + z.households, 0)

let mounted = false
function buildMap() {
  if (mounted || !mapEl.value) return
  mounted = true
  map = L.map(mapEl.value, { scrollWheelZoom: false }).setView([-34.02, 18.6], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  const activeIcon = L.divIcon({
    className: 'pin-wrap',
    html: '<span class="pin pin-active"></span>',
    iconSize: [22, 22],
  })
  const pendingIcon = L.divIcon({
    className: 'pin-wrap',
    html: '<span class="pin pin-pending"></span>',
    iconSize: [22, 22],
  })

  zones.forEach((z) => {
    L.marker([z.lat, z.lng], { icon: z.status === 'active' ? activeIcon : pendingIcon })
      .addTo(map)
      .bindPopup(
        `<strong>${z.name}</strong><br/>
         Status: <span style="color:${z.status === 'active' ? '#2e5138' : '#9c7b3c'}">${z.status}</span><br/>
         ${z.households} households`
      )
  })

  targetAreas.forEach((t) => {
    L.marker([t.lat, t.lng], {
      icon: L.divIcon({
        className: 'target-wrap',
        html: `<span class="target">${t.name}</span>`,
        iconSize: [0, 0],
      }),
    }).addTo(map)
  })
}

onMounted(() => {
  setTimeout(buildMap, 50)
})
</script>

<template>
  <div class="map-card">
    <div ref="mapEl" class="map"></div>
    <div class="legend">
      <div class="legend-item">
        <span class="pin pin-active"></span>
        <span>Active zone</span>
      </div>
      <div class="legend-item">
        <span class="pin pin-pending"></span>
        <span>Pending zone</span>
      </div>
      <div class="legend-summary">
        <strong>{{ activeZones }}</strong> active • <strong>{{ totalHouseholds }}</strong> households
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-card {
  background: var(--cream-soft);
  border: 1px solid var(--brown-line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.map {
  height: 420px;
  width: 100%;
  z-index: 0;
}
.legend {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 14px 20px;
  background: var(--green-dark);
  color: var(--cream);
  font-size: 0.86rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-summary {
  margin-left: auto;
  color: var(--green-chalk);
}
.legend-summary strong { color: var(--lime); }
.pin {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
}
.pin-active { background: #2e5138; }
.pin-pending { background: #c9a227; }
:deep(.pin-wrap) { background: none; border: none; }
.target { display: none; }
</style>
