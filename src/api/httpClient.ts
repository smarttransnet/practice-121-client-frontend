import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
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
    if (error.code === 'ERR_NETWORK' || !error.response) {
      error.isNetworkError = true
      error.userFriendlyMessage = `Unable to connect to backend server (${baseURL}). Please verify your network connection or ensure the API server is running.`
    }
    return Promise.reject(error)
  },
)
