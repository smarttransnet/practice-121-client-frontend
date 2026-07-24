import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import { 
  AppBar, 
  Box, 
  IconButton, 
  Toolbar, 
  Typography, 
  Stack, 
  Badge 
} from '@mui/material'
import { ProfileDropdown } from './ProfileDropdown'

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
          
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            Practice121
          </Typography>

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
          <IconButton 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.6)', 
              border: '1px solid rgba(255, 255, 255, 0.7)',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <MailOutlineOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </IconButton>
          
          <IconButton 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.6)', 
              border: '1px solid rgba(255, 255, 255, 0.7)',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <Badge color="error" variant="dot" overlap="circular">
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </Badge>
          </IconButton>
        </Stack>

        <ProfileDropdown />
      </Stack>
    </Box>
  )
}


