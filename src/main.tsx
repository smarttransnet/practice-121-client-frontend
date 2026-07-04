import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import App from './app/App'
import { appTheme } from './app/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
