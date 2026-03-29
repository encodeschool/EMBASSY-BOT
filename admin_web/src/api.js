import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → wipe token and go back to login (skip if already on login page)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
