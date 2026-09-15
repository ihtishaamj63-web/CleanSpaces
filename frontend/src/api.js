import axios from 'axios'

// All requests go through the Vite proxy (/api → backend), so the app works
// in dev and behind any reverse proxy in production without config changes.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
})

// Attach the saved JWT (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Krishendree's improvement: when a token expires or is rejected, clear the
// stale session instead of leaving the user in a phantom logged-in state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
    return Promise.reject(error)
  }
)

export default api
