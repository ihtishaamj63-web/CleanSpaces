import db from '../db.js'

// GET /api/zones - List all zones (public)
export async function listZones(req, res) {
  try {
    const [zones] = await db.query('SELECT * FROM zones ORDER BY created_at DESC')
    res.json(zones)
  } catch (error) {
    console.error('List zones error:', error)
    res.status(500).json({ message: 'Unable to fetch zones.' })
  }
}

// GET /api/zones/map - List zones for map with coordinates (public)
export async function listZonesForMap(req, res) {
  try {
    const [zones] = await db.query(`
      SELECT id, name, neighborhood, status, households, 
             latitude, longitude, created_at 
      FROM zones 
      WHERE status != 'rejected'
      ORDER BY created_at DESC
    `)
    res.json(zones)
  } catch (error) {
    console.error('List zones for map error:', error)
    res.status(500).json({ message: 'Unable to fetch zones for map.' })
  }
}

// GET /api/zones/pending - List only pending zones (admin only)
export async function listPendingZones(req, res) {
  try {
    const [zones] = await db.query(`
      SELECT id, name, neighborhood, status, households, 
             latitude, longitude, created_at 
      FROM zones 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `)
    res.json(zones)
  } catch (error) {
    console.error('List pending zones error:', error)
    res.status(500).json({ message: 'Unable to fetch pending zones.' })
  }
}

// GET /api/zones/:id - Get single zone
export async function getZone(req, res) {
  try {
    const { id } = req.params
    const [zones] = await db.query('SELECT * FROM zones WHERE id = ?', [id])
    
    if (zones.length === 0) {
      return res.status(404).json({ message: 'Zone not found.' })
    }
    
    res.json(zones[0])
  } catch (error) {
    console.error('Get zone error:', error)
    res.status(500).json({ message: 'Unable to fetch zone.' })
  }
}

// POST /api/zones - Add new zone (admin only)
export async function addZone(req, res) {
  try {
    const { name, neighborhood, households = 0, latitude, longitude, status = 'pending' } = req.body

    if (!name || !neighborhood) {
      return res.status(400).json({ message: 'Name and neighborhood are required.' })
    }

    const [result] = await db.query(
      `INSERT INTO zones (name, neighborhood, households, latitude, longitude, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, neighborhood, households, latitude || null, longitude || null, status]
    )

    const [newZone] = await db.query('SELECT * FROM zones WHERE id = ?', [result.insertId])
    
    res.status(201).json({
      message: 'Zone created successfully!',
      zone: newZone[0]
    })
  } catch (error) {
    console.error('Add zone error:', error)
    res.status(500).json({ message: 'Unable to create zone.' })
  }
}

// PUT /api/zones/:id - Update zone (admin only)
export async function editZone(req, res) {
  try {
    const { id } = req.params
    const { name, neighborhood, households, status, latitude, longitude } = req.body

    // Check if zone exists
    const [existing] = await db.query('SELECT * FROM zones WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Zone not found.' })
    }

    // Build dynamic update query
    const updates = []
    const values = []

    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (neighborhood !== undefined) { updates.push('neighborhood = ?'); values.push(neighborhood) }
    if (households !== undefined) { updates.push('households = ?'); values.push(households) }
    if (status !== undefined) { updates.push('status = ?'); values.push(status) }
    if (latitude !== undefined) { updates.push('latitude = ?'); values.push(latitude) }
    if (longitude !== undefined) { updates.push('longitude = ?'); values.push(longitude) }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' })
    }

    values.push(id)
    const query = `UPDATE zones SET ${updates.join(', ')} WHERE id = ?`
    
    await db.query(query, values)

    const [updated] = await db.query('SELECT * FROM zones WHERE id = ?', [id])
    
    res.json({
      message: 'Zone updated successfully!',
      zone: updated[0]
    })
  } catch (error) {
    console.error('Edit zone error:', error)
    res.status(500).json({ message: 'Unable to update zone.' })
  }
}

// DELETE /api/zones/:id - Delete zone (admin only)
export async function removeZone(req, res) {
  try {
    const { id } = req.params

    const [result] = await db.query('DELETE FROM zones WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Zone not found.' })
    }
    
    res.json({ message: 'Zone deleted successfully.' })
  } catch (error) {
    console.error('Delete zone error:', error)
    res.status(500).json({ message: 'Unable to delete zone.' })
  }
}