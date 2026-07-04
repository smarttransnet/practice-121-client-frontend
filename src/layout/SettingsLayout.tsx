import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tabs,
  Tab,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'

export function SettingsLayout() {
  const location = useLocation()
  
  // Currently on profile-edit, or index (which redirects to profile-edit)
  const isProfileEdit = location.pathname === '/settings/profile-edit' || location.pathname === '/settings'
  const currentTab = isProfileEdit ? 0 : 0

  const menuItems = [
    { label: 'Profile', to: '/settings/profile-edit', icon: <PersonOutlineIcon />, active: true },
    { label: 'Security', to: '#', icon: <LockOutlinedIcon />, active: false },
    { label: 'Notifications', to: '#', icon: <NotificationsNoneOutlinedIcon />, active: false },
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 3, color: 'text.primary' }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Desktop Left Navigation (3 cols) / Mobile Top Horizontal Tabs */}
        <Grid size={{ xs: 12, md: 3 }}>
          {/* Desktop Left Menu */}
          <Box
            className="glass-card"
            sx={{
              display: { xs: 'none', md: 'block' },
              p: 2,
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              background: 'rgba(255, 255, 255, 0.45)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.03)',
            }}
          >
            <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {menuItems.map((item) => {
                const isSelected = item.active && isProfileEdit
                return (
                  <ListItemButton
                    key={item.label}
                    component={item.active ? NavLink : 'div'}
                    to={item.active ? item.to : undefined}
                    disabled={!item.active}
                    selected={isSelected}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderRadius: '12px',
                      '&.Mui-selected': {
                        background: 'rgba(143, 0, 255, 0.08)',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                      '&.Mui-selected:hover': {
                        background: 'rgba(143, 0, 255, 0.12)',
                        boxShadow: 'none',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(143, 0, 255, 0.04)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 800 : 700,
                        fontSize: '0.875rem',
                        color: isSelected ? 'primary.main' : 'text.primary'
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Box>

          {/* Mobile Horizontal Tabs/Links */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              mb: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={currentTab}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              aria-label="settings tabs"
            >
              <Tab
                label="Profile"
                component={NavLink}
                to="/settings/profile-edit"
                icon={<PersonOutlineIcon />}
                iconPosition="start"
                sx={{ fontWeight: 700, fontSize: '0.875rem' }}
              />
              <Tab
                label="Security"
                disabled
                icon={<LockOutlinedIcon />}
                iconPosition="start"
                sx={{ fontWeight: 700, fontSize: '0.875rem' }}
              />
              <Tab
                label="Notifications"
                disabled
                icon={<NotificationsNoneOutlinedIcon />}
                iconPosition="start"
                sx={{ fontWeight: 700, fontSize: '0.875rem' }}
              />
            </Tabs>
          </Box>
        </Grid>

        {/* Right Content Area (9 cols) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Outlet />
        </Grid>
      </Grid>
    </Box>
  )
}
