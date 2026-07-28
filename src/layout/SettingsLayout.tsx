import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import React from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded'

export function SettingsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const currentTabPath = location.pathname.startsWith('/settings/favorites-list')
    ? '/settings/favorites-list'
    : location.pathname.startsWith('/settings/practice-centres')
    ? '/settings/practice-centres'
    : '/settings/profile-edit'

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue)
  }

  const isProfile = currentTabPath === '/settings/profile-edit'
  const isFavorites = currentTabPath === '/settings/favorites-list'
  const isPractice = currentTabPath === '/settings/practice-centres'

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 1, color: 'text.primary' }}>
        Settings
      </Typography>

      {/* Universal Horizontal Tabs with Google Account style pastel circular icons */}
      <Box
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: 'rgba(143, 0, 255, 0.1)',
        }}
      >
        <Tabs
          value={currentTabPath}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="settings tabs"
          sx={{
            minHeight: 56,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(90deg, #8F00FF 0%, #5F00FF 100%)',
            }
          }}
        >
          <Tab
            value="/settings/profile-edit"
            label="Profile"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isProfile ? '#004A77' : '#CEEAD6',
                  color: isProfile ? '#FFFFFF' : '#137333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mr: 1,
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 18 }} />
              </Box>
            }
            iconPosition="start"
            sx={{
              fontWeight: 700, 
              fontSize: '0.9rem',
              minHeight: 56,
              textTransform: 'none',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 800,
              },
              '&:hover:not(.Mui-selected)': {
                color: 'primary.main',
                bgcolor: 'rgba(143, 0, 255, 0.04)',
              }
            }}
          />
          <Tab
            value="/settings/favorites-list"
            label="Favorites List"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isFavorites ? '#E37400' : '#FFE7D9',
                  color: isFavorites ? '#FFFFFF' : '#E37400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mr: 1,
                }}
              >
                <StarBorderIcon sx={{ fontSize: 18 }} />
              </Box>
            }
            iconPosition="start"
            sx={{
              fontWeight: 700, 
              fontSize: '0.9rem',
              minHeight: 56,
              textTransform: 'none',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 800,
              },
              '&:hover:not(.Mui-selected)': {
                color: 'primary.main',
                bgcolor: 'rgba(143, 0, 255, 0.04)',
              }
            }}
          />
          <Tab
            value="/settings/practice-centres"
            label="Practice Centres"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isPractice ? '#8F00FF' : '#E8DEF8',
                  color: isPractice ? '#FFFFFF' : '#65558F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  mr: 1,
                }}
              >
                <BusinessRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
            }
            iconPosition="start"
            sx={{
              fontWeight: 700, 
              fontSize: '0.9rem',
              minHeight: 56,
              textTransform: 'none',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 800,
              },
              '&:hover:not(.Mui-selected)': {
                color: 'primary.main',
                bgcolor: 'rgba(143, 0, 255, 0.04)',
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Content Area (Full width) */}
      <Box sx={{ width: '100%', pt: 1 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
