import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'
import { LeftMenu } from './LeftMenu'
import { ProfileCompletionBanner } from '../features/auth/ProfileCompletionBanner'
import { useAuth } from '../features/auth/useAuth'

const drawerWidth = 280

export function AppLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')) // Use lg for desktop layout
  const [mobileOpen, setMobileOpen] = useState(false)
  const { fetchProfile, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().catch((err: any) => {
        if (err.response?.status === 401) {
          logout()
        }
      })
    }
  }, [isAuthenticated, fetchProfile, logout])

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        p: isDesktop ? 3 : 0,
        gap: isDesktop ? 3 : 0,
        flexDirection: isDesktop ? 'row' : 'column',
      }}
    >
      {/* Mobile Top Header (only on mobile/tablet) */}
      {!isDesktop && <Header onOpenMobileMenu={() => setMobileOpen(true)} isMobile />}

      {/* Navigation Sidebar */}
      {isDesktop ? (
        // Floating Permanent Sidebar on Desktop
        <Box 
          className="glass-card"
          sx={{ 
            width: drawerWidth, 
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 48px)',
            position: 'sticky',
            top: 24,
            overflow: 'hidden',
          }}
        >
          <LeftMenu />
        </Box>
      ) : (
        // Temporary Drawer on Mobile
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: 2,
            },
          }}
        >
          <LeftMenu onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: isDesktop ? 'auto' : '100vh',
          width: '100%',
        }}
      >
        {/* Desktop Top Bar (integrated directly at the top of content) */}
        {isDesktop && <Header onOpenMobileMenu={() => {}} />}

        {/* Content Box */}
        <Box 
          sx={{ 
            flex: 1, 
            py: isDesktop ? 3 : 4,
            px: isDesktop ? 0 : 2, 
            maxWidth: 1600, 
            width: '100%', 
            mx: 'auto',
          }}
        >
          <ProfileCompletionBanner />
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  )
}


