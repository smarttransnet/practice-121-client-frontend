import axios from 'axios'

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  const isCloudDeployment =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('storage.googleapis.com') || window.location.hostname.includes('run.app'))
  if (isCloudDeployment) {
    return 'https://practice121-api-687271578749.asia-southeast1.run.app'
  }
  return 'http://localhost:5000'
}

const baseURL = getBaseUrl()

export const httpClient = axios.create({
  baseURL,
  timeout: 30000,
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
