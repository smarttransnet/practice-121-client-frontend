import MenuIcon from '@mui/icons-material/Menu'

import { 
  AppBar, 
  Box, 
  IconButton, 
  Toolbar, 
  Typography, 
  Stack 
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import { ProfileDropdown } from './ProfileDropdown'
import logoImg from '../assets/logo.png'

type HeaderProps = {
  onOpenMobileMenu: () => void
  onToggleSidebar?: () => void
  isMobile?: boolean
}

export function Header({ onOpenMobileMenu, onToggleSidebar, isMobile = false }: HeaderProps) {
  if (isMobile) {
    // Mobile AppBar
    return (
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(143, 0, 255, 0.08)',
          boxShadow: 'none',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>
          
          <Box
            component={NavLink}
            to="/dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <Box
              component="img"
              src={logoImg}
              alt="Practice121 Logo"
              sx={{ width: 28, height: 28, borderRadius: '6px', objectFit: 'cover' }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: 'text.primary',
              }}
            >
              Practice121
            </Typography>
          </Box>

          <ProfileDropdown isMobile />
        </Toolbar>
      </AppBar>
    )
  }

  // Desktop Top Bar
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%',
        py: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={onToggleSidebar} 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.6)', 
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)', transform: 'scale(1.05)' }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Right Side: Icons and Profile */}
      <Stack direction="row" spacing={2.5} alignItems="center">
        {/* Rounded Action Icons */}
        <Stack direction="row" spacing={1.5}>

          

        </Stack>

        <ProfileDropdown />
      </Stack>
    </Box>
  )
}


