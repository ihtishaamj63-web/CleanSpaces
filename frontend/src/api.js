import axios from 'axios'

// In dev, requests go through the Vite proxy (/api → localhost:5000).
// In production, VITE_API_BASE_URL points at the deployed Railway backend.
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

// When a token expires or is rejected, clear the stale session instead of
// leaving the user in a phantom logged-in state.
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