<template>
  <div class="main-box">
    <!-- Stats -->
    <div class="stats-container">
      <div class="stat-box" v-for="stat in adminStats" :key="stat.title">
        <h3>{{ stat.value }}</h3>
        <p>{{ stat.title }}</p>
      </div>
    </div>

    <!-- Interactive Map -->
    <div class="map-section">
      <div class="map-header">
        <h2>Zone Management Map</h2>
        <div class="map-legend">
          <span><span class="dot active"></span> Active</span>
          <span><span class="dot pending"></span> Pending</span>
          <span><span class="dot rejected"></span> Rejected</span>
        </div>
      </div>
      <div id="admin-map" ref="mapContainer" style="height: 500px; width: 100%; border-radius: 12px;"></div>
      
      <!-- Zone Details Popup (floating overlay) -->
      <div v-if="selectedZone" class="zone-detail-popup" @click.stop>
        <h3>{{ selectedZone.name }}</h3>
        <p><strong>Neighborhood:</strong> {{ selectedZone.neighborhood }}</p>
        <p><strong>Status:</strong> <span class="badge" :class="selectedZone.status">{{ selectedZone.status }}</span></p>
        <p><strong>Households:</strong> {{ selectedZone.households || 0 }}</p>
        
        <div class="popup-actions" v-if="selectedZone.status === 'pending'">
          <button class="action-btn approve" @click="approveZone(selectedZone.id)">✅ Approve</button>
          <button class="action-btn reject" @click="rejectZone(selectedZone.id)">❌ Reject</button>
          <button class="action-btn edit" @click="startEdit(selectedZone)">✏️ Edit</button>
        </div>
        <div class="popup-actions" v-else>
          <button class="action-btn edit" @click="startEdit(selectedZone)">✏️ Edit</button>
          <button class="action-btn delete-btn" @click="deleteZone(selectedZone.id)">🗑️ Delete</button>
        </div>
        
        <button class="close-popup" @click="selectedZone = null">×</button>
      </div>
    </div>

    <!-- Zones Table -->
    <div class="table-section">
      <h2>All Zones <span class="zone-count">({{ zones.length }})</span></h2>
      <p v-if="zonesError" class="load-error">{{ zonesError }}</p>
      <div class="table-wrapper" v-else>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Neighborhood</th>
              <th>Status</th>
              <th>Households</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="zone in zones" :key="zone.id">
              <td>{{ zone.name }}</td>
              <td>{{ zone.neighborhood }}</td>
              <td><span class="badge" :class="zone.status">{{ zone.status }}</span></td>
              <td>{{ zone.households || 0 }}</td>
              <td>
                <button class="mini-btn edit-btn" @click="startEdit(zone)">Edit</button>
                <button class="mini-btn delete-btn" @click="deleteZone(zone.id)">Delete</button>
                <button v-if="zone.status === 'pending'" class="mini-btn approve-btn" @click="approveZone(zone.id)">Approve</button>
                <button v-if="zone.status === 'pending'" class="mini-btn reject-btn" @click="rejectZone(zone.id)">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Zone Form -->
    <div v-if="editingZone" class="edit-overlay" @click.self="editingZone = null">
      <div class="edit-modal">
        <h2>{{ editingZone.id ? 'Edit Zone' : 'Add New Zone' }}</h2>
        <form @submit.prevent="saveZone">
          <div class="form-group">
            <label>Zone Name</label>
            <input v-model="editForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Neighborhood</label>
            <input v-model="editForm.neighborhood" type="text" required />
          </div>
          <div class="form-group">
            <label>Households</label>
            <input v-model.number="editForm.households" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="editForm.status">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Save</button>
            <button type="button" class="cancel-btn" @click="editingZone = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default {
  data() {
    return {
      adminStats: [
        { title: 'Active Zones', value: '—' },
        { title: 'Pending Zones', value: '—' },
        { title: 'Total Households', value: '—' },
        { title: 'Total Zones', value: '—' },
      ],
      zones: [],
      zonesError: '',
      map: null,
      markers: [],
      selectedZone: null,
      editingZone: null,
      editForm: {
        name: '',
        neighborhood: '',
        households: 0,
        status: 'pending'
      }
    }
  },
  async mounted() {
    await this.loadZones()
    this.initMap()
  },
  methods: {
    initMap() {
      // Initialize the map centered on Mitchells Plain, Cape Town
      this.map = L.map(this.$refs.mapContainer).setView([-34.0489, 18.6206], 13)
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)
      
      // Add markers for all zones
      this.updateMapMarkers()
    },
    
    updateMapMarkers() {
      // Clear existing markers
      this.markers.forEach(marker => this.map.removeLayer(marker))
      this.markers = []
      
      // Add markers for each zone with coordinates
      // Note: In a real app, zones would have lat/lng stored in the database
      // For now, we'll generate approximate positions based on neighborhood
      this.zones.forEach(zone => {
        const coords = this.getZoneCoordinates(zone)
        if (!coords) return
        
        // Choose marker color based on status
        const color = zone.status === 'active' ? '#4CAF50' :
                     zone.status === 'pending' ? '#FFC107' : '#F44336'
        
        const marker = L.circleMarker(coords, {
          radius: 12,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map)
        
        // Add popup with zone info
        marker.bindPopup(`
          <div class="map-popup">
            <h4>${zone.name}</h4>
            <p><strong>Neighborhood:</strong> ${zone.neighborhood}</p>
            <p><strong>Status:</strong> <span class="badge ${zone.status}">${zone.status}</span></p>
            <p><strong>Households:</strong> ${zone.households || 0}</p>
            <button onclick="window.app.selectZone(${zone.id})" class="popup-btn">Manage</button>
          </div>
        `)
        
        // Click handler
        marker.on('click', () => {
          this.selectedZone = zone
        })
        
        this.markers.push(marker)
      })
    },
    
    getZoneCoordinates(zone) {
      // In a real app, these would come from the database
      // For demo, generate positions based on zone name/neighborhood
      const hash = this.hashString(zone.name + zone.neighborhood)
      
      // Mitchells Plain area bounds
      const lat = -34.0489 + (hash % 100) * 0.002
      const lng = 18.6206 + ((hash * 7) % 100) * 0.002
      
      return [lat, lng]
    },
    
    hashString(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return Math.abs(hash)
    },
    
    async loadZones() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/zones', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!response.ok) throw new Error('Failed to load zones')
        
        this.zones = await response.json()
        this.updateAdminStats()
        
        // Update map markers if map exists
        if (this.map) {
          this.updateMapMarkers()
        }
      } catch (error) {
        console.error('Could not load zones:', error)
        this.zonesError = 'Could not load zones from the server.'
      }
    },
    
    updateAdminStats() {
      const active = this.zones.filter((z) => z.status === 'active').length
      const pending = this.zones.filter((z) => z.status === 'pending').length
      const households = this.zones.reduce((sum, z) => sum + (z.households || 0), 0)
      
      this.adminStats = [
        { title: 'Active Zones', value: active },
        { title: 'Pending Zones', value: pending },
        { title: 'Total Households', value: households },
        { title: 'Total Zones', value: this.zones.length },
      ]
    },
    
    async approveZone(zoneId) {
      if (!confirm('Approve this zone?')) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/zones/${zoneId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'active' })
        })
        
        if (!response.ok) throw new Error('Failed to approve zone')
        
        await this.loadZones()
        this.selectedZone = null
        alert('Zone approved successfully!')
      } catch (error) {
        alert('Error approving zone: ' + error.message)
      }
    },
    
    async rejectZone(zoneId) {
      if (!confirm('Reject this zone?')) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/zones/${zoneId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'rejected' })
        })
        
        if (!response.ok) throw new Error('Failed to reject zone')
        
        await this.loadZones()
        this.selectedZone = null
        alert('Zone rejected.')
      } catch (error) {
        alert('Error rejecting zone: ' + error.message)
      }
    },
    
    async deleteZone(zoneId) {
      if (!confirm('Are you sure you want to delete this zone?')) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/zones/${zoneId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Failed to delete zone')
        
        await this.loadZones()
        this.selectedZone = null
        alert('Zone deleted.')
      } catch (error) {
        alert('Error deleting zone: ' + error.message)
      }
    },
    
    startEdit(zone) {
      this.editingZone = zone
      this.editForm = {
        id: zone.id,
        name: zone.name,
        neighborhood: zone.neighborhood,
        households: zone.households || 0,
        status: zone.status
      }
    },
    
    async saveZone() {
      try {
        const token = localStorage.getItem('token')
        const isEdit = this.editForm.id
        const url = isEdit ? `/api/zones/${this.editForm.id}` : '/api/zones'
        const method = isEdit ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(this.editForm)
        })
        
        if (!response.ok) throw new Error('Failed to save zone')
        
        await this.loadZones()
        this.editingZone = null
        alert(isEdit ? 'Zone updated successfully!' : 'Zone created successfully!')
      } catch (error) {
        alert('Error saving zone: ' + error.message)
      }
    },
    
    // Logout function
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.main-box {
  font-family: Arial, sans-serif;
  background-color: #f4f8f5;
  padding: 24px 18px 28px;
  color: #12332d;
}

.stats-container {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.stat-box {
  background: white;
  padding: 18px 20px;
  border-radius: 12px;
  flex: 1;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(18, 51, 45, 0.08);
}

.stat-box h3 {
  margin: 0;
  font-size: 24px;
  color: #12332d;
}

.stat-box p {
  margin: 6px 0 0;
  color: #556a66;
}

/* Map Section */
.map-section {
  position: relative;
  background: white;
  border-radius: 14px;
  margin-top: 24px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(18, 51, 45, 0.06);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.map-header h2 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: -0.03em;
}

.map-legend {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
}

.map-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot.active { background: #4CAF50; }
.dot.pending { background: #FFC107; }
.dot.rejected { background: #F44336; }

#admin-map {
  border-radius: 10px;
  z-index: 1;
}

/* Map Popup */
.map-popup {
  font-family: Arial, sans-serif;
  padding: 5px;
}

.map-popup h4 {
  margin: 0 0 5px;
  color: #12332d;
}

.map-popup p {
  margin: 3px 0;
  font-size: 0.85rem;
}

.popup-btn {
  background: #7cb342;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
}

/* Zone Detail Popup (overlay) */
.zone-detail-popup {
  position: absolute;
  bottom: 30px;
  left: 30px;
  background: white;
  padding: 20px 25px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  z-index: 1000;
  min-width: 250px;
  max-width: 320px;
  border: 2px solid #7cb342;
}

.zone-detail-popup h3 {
  margin: 0 0 10px;
  font-size: 1.2rem;
}

.zone-detail-popup p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
}

.action-btn.approve {
  background: #4CAF50;
  color: white;
}
.action-btn.reject {
  background: #F44336;
  color: white;
}
.action-btn.edit {
  background: #2196F3;
  color: white;
}
.action-btn.delete-btn {
  background: #F44336;
  color: white;
}

.close-popup {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

/* Table Section */
.table-section {
  background: white;
  padding: 18px 0 0;
  border-radius: 14px;
  margin-top: 24px;
  box-shadow: 0 2px 12px rgba(18, 51, 45, 0.06);
  overflow: hidden;
}

.table-section h2 {
  margin: 0 0 18px;
  padding: 0 20px;
  font-size: 2rem;
  letter-spacing: -0.03em;
}

.zone-count {
  font-size: 1rem;
  color: #888;
  font-weight: normal;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #12332d;
  color: white;
  padding: 14px 16px;
  text-align: left;
  font-size: 1rem;
  font-weight: 700;
}

td {
  padding: 16px;
  border-bottom: 1px solid #e6ece8;
  vertical-align: middle;
  font-size: 1rem;
  color: #12332d;
}

tbody tr:hover {
  background: #f8fbf9;
}

.load-error {
  color: #c0392b;
  padding: 0 20px 20px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
}

.badge.active {
  background: #dff4e7;
  color: #1a5d3a;
}
.badge.pending {
  background: #fff4d8;
  color: #8a6500;
}
.badge.rejected {
  background: #fce3e3;
  color: #9a2c2c;
}

.mini-btn {
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  margin: 2px;
}

.edit-btn {
  background: #eaf4ff;
  color: #0c4a7d;
  border-color: #b9d6f3;
}

.delete-btn {
  background: #fde9e9;
  color: #9a2c2c;
  border-color: #f3c9c9;
}

.approve-btn {
  background: #dff4e7;
  color: #1a5d3a;
  border-color: #a8d5b8;
}

.reject-btn {
  background: #fce3e3;
  color: #9a2c2c;
  border-color: #f3c9c9;
}

/* Edit Modal */
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-modal {
  background: white;
  padding: 30px 35px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal h2 {
  margin: 0 0 20px;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cfe0db;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background: #7cb342;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  flex: 1;
}

.cancel-btn {
  background: #eef4f1;
  color: #12332d;
  border: 1px solid #d4ddd8;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .stats-container .stat-box {
    flex: 1 1 45%;
    min-width: 120px;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .zone-detail-popup {
    left: 10px;
    right: 10px;
    bottom: 10px;
    max-width: none;
  }
}
</style>