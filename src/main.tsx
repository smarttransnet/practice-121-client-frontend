import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './index.css'
import App from './app/App'
import { ColorThemeProvider } from './context/ColorThemeContext'

// Intercept Google OAuth ID Token returned in URL hash before HashRouter evaluates it
if (typeof window !== 'undefined' && window.location.hash.includes('id_token=')) {
  const match = window.location.hash.match(/id_token=([^&]+)/)
  if (match && match[1]) {
    sessionStorage.setItem('pending_google_id_token', match[1])
    window.location.hash = '#/login'
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorThemeProvider>
      <App />
    </ColorThemeProvider>
  </StrictMode>,
)
