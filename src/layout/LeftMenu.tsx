import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Button,
  IconButton
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

type LeftMenuProps = {
  onNavigate?: () => void
}

export function LeftMenu({ onNavigate }: LeftMenuProps) {
  const location = useLocation()

  // Map the application's actual routes to the high-fidelity labels in the screenshot
  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardRoundedIcon />, active: true },
    { label: 'Patient Cases', to: '/reports', icon: <PeopleAltRoundedIcon />, active: true },
    { label: 'Settings', to: '/settings', icon: <SettingsRoundedIcon />, active: true },
  ]

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        p: 2.5,
        justifyContent: 'space-between',
      }}
    >
      {/* Header / Logo Row */}
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 4,
            px: 0.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Signature violet circular logo */}
            <Box 
              sx={{ 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #8F00FF 0%, #5F00FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(143, 0, 255, 0.35)',
              }}
            >
              <LightbulbIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.1rem' }}>
              Practice121
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          </IconButton>
        </Box>

        {/* Navigation List */}
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/')
            
            if (item.active) {
              return (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={onNavigate}
                  selected={isSelected}
                  sx={{
                    px: 2,
                    py: 1.2,
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontWeight: isSelected ? 800 : 700, 
                      fontSize: '0.875rem' 
                    }}
                  />
                </ListItemButton>
              )
            } else {
              // Placeholder styling for items that are not implemented yet, matching the aesthetic perfectly
              return (
                <ListItemButton
                  key={item.to}
                  disabled
                  sx={{
                    px: 2,
                    py: 1.2,
                    opacity: 0.5,
                    '& .MuiListItemIcon-root': {
                      color: 'text.secondary'
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontWeight: 700, 
                      fontSize: '0.875rem',
                      color: 'text.secondary'
                    }}
                  />
                </ListItemButton>
              )
            }
          })}
        </List>
      </Box>

      {/* Bottom Promo Card (Expert Insights) */}
      <Box 
        sx={{ 
          position: 'relative',
          mt: 4,
          pt: 3, // Padding top to accommodate the floating badge
        }}
      >
        {/* Floating Lightbulb Badge */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 10,
            left: 20,
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(143, 0, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(31, 38, 135, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: 'rgba(143, 0, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LightbulbIcon sx={{ color: '#8F00FF', fontSize: 18 }} />
          </Box>
        </Box>

        {/* Promo Card Body */}
        <Box 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            borderRadius: '20px',
            p: 2.5,
            pt: 4, // More top padding for the badge overlap
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
            Expert Insights
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.4 }}>
            Actionable analysis from shaping researchers the future of AI.
          </Typography>
          <Button 
            variant="contained" 
            className="gradient-primary-btn"
            fullWidth
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ 
              py: 1, 
              fontSize: '0.75rem',
              borderRadius: '12px',
            }}
          >
            Unlock Insights
          </Button>
        </Box>
      </Box>
    </Box>
  )
}


