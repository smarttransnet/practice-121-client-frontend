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
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

type LeftMenuProps = {
  onNavigate?: () => void
}

interface MenuItemConfig {
  label: string
  to: string
  icon: React.ReactNode
  circleBg: string
  iconColor: string
  activePillBg: string
  activeCircleBg: string
}

export function LeftMenu({ onNavigate }: LeftMenuProps) {
  const location = useLocation()

  const menuItems: MenuItemConfig[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: <HomeRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#E8F0FE',
      iconColor: '#1A73E8',
      activePillBg: '#C2E7FF',
      activeCircleBg: '#004A77',
    },
    {
      label: 'Patient Queue',
      to: '/patient-queue',
      icon: <ConfirmationNumberRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#E8DEF8',
      iconColor: '#65558F',
      activePillBg: '#F3E8FF',
      activeCircleBg: '#8F00FF',
    },
    {
      label: 'Register Patient',
      to: '/register/patient',
      icon: <BadgeRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#CEEAD6',
      iconColor: '#137333',
      activePillBg: '#E6F4EA',
      activeCircleBg: '#137333',
    },
    {
      label: 'Add Patient',
      to: '/patients/new',
      icon: <PersonAddRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#D2E3FC',
      iconColor: '#1967D2',
      activePillBg: '#D3E3FD',
      activeCircleBg: '#1967D2',
    },
    {
      label: 'Reports',
      to: '/reports',
      icon: <AssessmentRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#FFE7D9',
      iconColor: '#E37400',
      activePillBg: '#FEF7E0',
      activeCircleBg: '#E37400',
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />,
      circleBg: '#E8F0FE',
      iconColor: '#1A73E8',
      activePillBg: '#C2E7FF',
      activeCircleBg: '#004A77',
    },
  ]

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        p: 2,
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
            mb: 3,
            px: 1,
            pt: 0.5,
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

        {/* Google Account Style Navigation List */}
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {menuItems.map((item) => {
            const isSelected = 
              location.pathname === item.to || 
              (item.to === '/dashboard' && location.pathname === '/') ||
              (item.to === '/settings' && location.pathname.startsWith('/settings'))

            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={onNavigate}
                selected={isSelected}
                sx={{
                  borderRadius: '28px', // Full Pill Shape (Google Account style)
                  px: 1.5,
                  py: 0.75,
                  minHeight: 48,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  bgcolor: isSelected ? item.activePillBg : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: item.activePillBg,
                    '&:hover': {
                      bgcolor: item.activePillBg,
                    },
                  },
                  '&:hover': {
                    bgcolor: isSelected ? item.activePillBg : 'rgba(0, 0, 0, 0.04)',
                    '& .google-nav-circle': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                {/* Circular Icon Badge Container */}
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Box
                    className="google-nav-circle"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: isSelected ? item.activeCircleBg : item.circleBg,
                      color: isSelected ? '#FFFFFF' : item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    {item.icon}
                  </Box>
                </ListItemIcon>

                {/* Menu Item Text */}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 800 : 600, 
                    fontSize: '0.925rem',
                    color: isSelected ? '#001D35' : 'text.primary',
                    sx: { transition: 'color 0.2s ease' }
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Bottom Promo Card (Expert Insights) */}
      <Box 
        sx={{ 
          position: 'relative',
          mt: 3,
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
