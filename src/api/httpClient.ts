import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const httpClient = axios.create({
  baseURL
  //timeout: 10000,
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Central place to handle/log errors
    // e.g. send to monitoring or map error shapes
    return Promise.reject(error)
  },
)

