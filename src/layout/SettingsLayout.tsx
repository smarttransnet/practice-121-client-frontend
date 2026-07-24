import { Outlet, NavLink, useLocation } from 'react-router-dom'
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
  
  // Currently on profile-edit, or index (which redirects to profile-edit)
  const isProfileEdit = location.pathname === '/settings/profile-edit' || location.pathname === '/settings'
  const isFavorites = location.pathname === '/settings/favorites-list'
  const isPracticeCentres = location.pathname === '/settings/practice-centres'
  
  const currentTab = isProfileEdit ? 0 : isFavorites ? 1 : isPracticeCentres ? 2 : 0

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
          value={currentTab}
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
            label="Profile"
            component={NavLink}
            to="/settings/profile-edit"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: currentTab === 0 ? '#004A77' : '#CEEAD6',
                  color: currentTab === 0 ? '#FFFFFF' : '#137333',
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
            label="Favorites List"
            component={NavLink}
            to="/settings/favorites-list"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: currentTab === 1 ? '#E37400' : '#FFE7D9',
                  color: currentTab === 1 ? '#FFFFFF' : '#E37400',
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
            label="Practice Centres"
            component={NavLink}
            to="/settings/practice-centres"
            icon={
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: currentTab === 2 ? '#8F00FF' : '#E8DEF8',
                  color: currentTab === 2 ? '#FFFFFF' : '#65558F',
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
