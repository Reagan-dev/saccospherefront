import axios from 'axios'

// Use production API URL as default (can be overridden via env var)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://saccosphere-atze.onrender.com/api'

// Create and configure Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (matches useAuth hook token storage key)
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access (matches useAuth hook token storage keys)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // Optionally redirect to login if needed
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
