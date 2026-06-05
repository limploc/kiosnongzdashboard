import axios from 'axios'

const API_BASE_URL = 'https://kios-nongz.onrender.com/api/'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const AUTH_ENDPOINTS = ['/users/login', '/users/register']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url
      ? AUTH_ENDPOINTS.some((ep) => error.config.url.includes(ep))
      : false

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api