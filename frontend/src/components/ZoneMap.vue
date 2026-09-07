<template>
  <section class="zone-map-section" aria-label="CleanSpaces active zones map">
    <div ref="mapEl" class="zone-map"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// default marker icons don't load correctly with bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Base URL for the API. Set VITE_API_BASE_URL in your .env if the backend
// isn't reachable at the same origin (e.g. http://localhost:4000 in dev).
// Leave it unset if you're proxying /api through Vite or a reverse proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Where the map opens by default (Cape Flats area).
const DEFAULT_MAP_CENTER = [-34.0, 18.6]
const DEFAULT_ZOOM = 12

// Used to place a zone's marker if the backend doesn't give us exact
// coordinates for it.
const NEIGHBOURHOOD_CENTERS = {
  manenberg: [-33.9702, 18.5590],
  "mitchell's plain": [-34.0353, 18.6222],
  khayelitsha: [-34.0356, 18.6597],
}

// Shown if the live zones can't be fetched, so the map is never empty.
const FALLBACK_ZONES = [
  { id: 1, name: 'NY108 Block', neighborhood: 'Manenberg', status: 'active', households: 62 },
  { id: 2, name: 'Silver City', neighborhood: 'Manenberg', status: 'pending', households: 48 },
  { id: 3, name: 'Tafelsig', neighborhood: "Mitchell's Plain", status: 'active', households: 180 },
  { id: 4, name: 'Rocklands', neighborhood: "Mitchell's Plain", status: 'active', households: 150 },
  { id: 5, name: 'Site C', neighborhood: 'Khayelitsha', status: 'active', households: 210 },
  { id: 6, name: 'Harare', neighborhood: 'Khayelitsha', status: 'pending', households: 95 },
]

const mapEl = ref(null)
let map = null

// Finds a starting point for a zone's marker based on its neighbourhood name.
function getNeighbourhoodCenter(neighborhood) {
  const key = (neighborhood || '').trim().toLowerCase()
  return NEIGHBOURHOOD_CENTERS[key] || DEFAULT_MAP_CENTER
}

// multiple zones in the same area don't stack exactly on top of each other.
function spreadOutMarker(center, index) {
  const spread = 0.006
  const angle = index * 137.5 * (Math.PI / 180) // "golden angle" spacing
  const [lat, lng] = center
  return [lat + Math.cos(angle) * spread, lng + Math.sin(angle) * spread]
}

// Real coordinates from the backend win. Only guess a position from the
// neighbourhood name when the zone has no lat/lng.
function resolveZonePosition(zone, index) {
  if (typeof zone.lat === 'number' && typeof zone.lng === 'number') {
    return [zone.lat, zone.lng]
  }
  const center = getNeighbourhoodCenter(zone.neighborhood)
  return spreadOutMarker(center, index)
}

// popup text shown when a marker is clicked.
function buildPopupContent(zone) {
  const statusLabel = zone.status === 'active' ? 'Active' : 'Pending'
  return `
    <strong>${zone.name}</strong><br/>
    ${zone.neighborhood}<br/>
    Status: ${statusLabel}<br/>
    ${zone.households} households
  `
}

function addZoneMarkers(zones) {
  zones.forEach((zone, index) => {
    const position = resolveZonePosition(zone, index)

    L.marker(position)
      .addTo(map)
      .bindPopup(buildPopupContent(zone))
  })
}

async function loadZones() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/zones/map`)
    if (!response.ok) throw new Error('Failed to load zones')

    const zones = await response.json()
    const hasZones = Array.isArray(zones) && zones.length > 0

    addZoneMarkers(hasZones ? zones : FALLBACK_ZONES)
  } catch (error) {
    console.error('Could not load live zones, showing fallback data:', error)
    addZoneMarkers(FALLBACK_ZONES)
  }
}

onMounted(() => {
  map = L.map(mapEl.value).setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  loadZones()
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<style scoped>
.zone-map-section {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
  scroll-margin-top: 96px;
}

.zone-map {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-control),
:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 400;
}
</style>