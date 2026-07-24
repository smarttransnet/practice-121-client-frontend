import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
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
import { ThemeSelectorBox } from '../features/theme/ThemeSelectorBox'

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

      {/* Color Theme Selection Component */}
      <Box sx={{ mt: 3 }}>
        <ThemeSelectorBox />
      </Box>
    </Box>
  )
}
