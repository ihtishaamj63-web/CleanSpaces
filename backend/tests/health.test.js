const axios = require('axios')

describe('Backend health endpoint', () => {
  test('GET /api/health returns status ok', async () => {
    const res = await axios.get('http://localhost:5000/api/health', { timeout: 5000 })
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('status', 'ok')
  })
})
