<template>
  <section class="zone-map-section" aria-label="CleanSpaces active zones map">
    <div class="map-container">
      <div ref="mapEl" class="zone-map"></div>
      
      <!-- Reset View Button -->
      <button 
        class="reset-view-btn" 
        @click="resetView"
        title="Reset map to starting position (press R)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9m0 0v6m0-6h-6" />
        </svg>
        <span>Reset View</span>
        <span class="shortcut-hint">R</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import api from '../api.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Map defaults
const DEFAULT_MAP_CENTER = [-34.0, 18.6]
const DEFAULT_ZOOM = 12

// Neighbourhood centers for marker placement
const NEIGHBOURHOOD_CENTERS = {
  manenberg: [-33.9702, 18.5590],
  "mitchell's plain": [-34.0353, 18.6222],
  khayelitsha: [-34.0356, 18.6597],
}

// Fallback zones if API fails - ONLY ACTIVE ZONES
const FALLBACK_ZONES = [
  { id: 1, name: 'NY108 Block', neighborhood: 'Manenberg', status: 'active', households: 62 },
  { id: 3, name: 'Tafelsig', neighborhood: "Mitchell's Plain", status: 'active', households: 180 },
  { id: 4, name: 'Rocklands', neighborhood: "Mitchell's Plain", status: 'active', households: 150 },
  { id: 5, name: 'Site C', neighborhood: 'Khayelitsha', status: 'active', households: 210 },
]

const mapEl = ref(null)
let map = null
let markerLayer = null
let defaultCenter = DEFAULT_MAP_CENTER
let defaultZoom = DEFAULT_ZOOM

// Helper functions
function getNeighbourhoodCenter(neighborhood) {
  const key = (neighborhood || '').trim().toLowerCase()
  return NEIGHBOURHOOD_CENTERS[key] || DEFAULT_MAP_CENTER
}

function spreadOutMarker(center, index) {
  const spread = 0.006
  const angle = index * 137.5 * (Math.PI / 180)
  const [lat, lng] = center
  return [lat + Math.cos(angle) * spread, lng + Math.sin(angle) * spread]
}

function resolveZonePosition(zone, index) {
  if (typeof zone.lat === 'number' && typeof zone.lng === 'number') {
    return [zone.lat, zone.lng]
  }
  const center = getNeighbourhoodCenter(zone.neighborhood)
  return spreadOutMarker(center, index)
}

function buildPopupContent(zone) {
  return `
    <strong>${zone.name}</strong><br/>
    ${zone.neighborhood}<br/>
    Status: Active ✅<br/>
    ${zone.households} households
  `
}

// Reset view function - flies back to starting position with animation
function resetView() {
  if (!map) return
  
  map.flyTo(defaultCenter, defaultZoom, {
    duration: 1.5,
    easeLinearity: 0.25
  })
  
  if (markerLayer) {
    markerLayer.eachLayer((layer) => {
      if (layer._icon) {
        layer._icon.style.transition = 'transform 0.3s ease'
        layer._icon.style.transform = 'scale(1.2)'
        setTimeout(() => {
          layer._icon.style.transform = 'scale(1)'
        }, 300)
      }
    })
  }
}

async function loadZones() {
  try {
    const res = await api.get('/zones/map')
    const zones = res.data || []

    if (Array.isArray(zones)) {
      // Filter for active zones from the database
      const activeZones = zones.filter(zone => zone.status === 'active')
      console.log(`📍 Found ${zones.length} total zones, showing ${activeZones.length} active database zones`)
      addZoneMarkers(activeZones.length > 0 ? activeZones : FALLBACK_ZONES)
    } else {
      addZoneMarkers(FALLBACK_ZONES)
    }
  } catch (error) {
    console.error('Could not load live zones, showing fallback data:', error)
    addZoneMarkers(FALLBACK_ZONES)
  }
}

function addZoneMarkers(zones) {
  // Clear existing markers if any
  if (markerLayer) {
    markerLayer.clearLayers()
  } else {
    markerLayer = L.layerGroup().addTo(map)
  }

  zones.forEach((zone, index) => {
    const position = resolveZonePosition(zone, index)
    
    const marker = L.marker(position)
      .bindPopup(buildPopupContent(zone))
    
    markerLayer.addLayer(marker)
  })
}

// Keyboard shortcut: press 'R' to reset view
function handleKeydown(e) {
  if ((e.key === 'r' || e.key === 'R') && 
      e.target.tagName !== 'INPUT' && 
      e.target.tagName !== 'TEXTAREA') {
    e.preventDefault()
    resetView()
  }
}

onMounted(() => {
  // Initialize map
  map = L.map(mapEl.value, {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true,
    fadeAnimation: true,
    zoomAnimation: true,
  })

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map)

  // Load zones
  loadZones()

  // Keyboard shortcut
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  
  if (markerLayer) {
    markerLayer.clearLayers()
  }
  
  if (map) {
    map.remove()
    map = null
  }
})

// Expose resetView to parent components
defineExpose({ resetView })
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

.map-container {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.zone-map {
  width: 100%;
  height: 420px;
  background: #e8ece9;
}

/* ===== RESET VIEW BUTTON ===== */
.reset-view-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 400;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  color: #12332d;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.reset-view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #ffffff;
  border-color: #7cb342;
}

.reset-view-btn:active {
  transform: translateY(0px) scale(0.97);
}

.reset-view-btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: #12332d;
  transition: transform 0.5s ease;
}

.reset-view-btn:hover svg {
  transform: rotate(-180deg);
}

.reset-view-btn .shortcut-hint {
  display: inline-block;
  padding: 1px 6px;
  margin-left: 2px;
  border-radius: 4px;
  background: rgba(18, 51, 45, 0.08);
  font-size: 0.65rem;
  font-weight: 700;
  color: #6a7a76;
  letter-spacing: 0.05em;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .zone-map {
    height: 300px;
  }
  
  .reset-view-btn {
    bottom: 12px;
    right: 12px;
    padding: 8px 12px;
    font-size: 0.75rem;
  }
  
  .reset-view-btn .shortcut-hint {
    display: none;
  }
  
  .reset-view-btn svg {
    width: 16px;
    height: 16px;
  }
}

:deep(.leaflet-control),
:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 400;
}

@keyframes pulseMarkers {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>