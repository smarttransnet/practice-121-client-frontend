import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import {
  Avatar,
  Box,
  ButtonBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Skeleton,
  ListItemIcon,
  Divider,
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import LogoutIcon from '@mui/icons-material/Logout'
import PublicIcon from '@mui/icons-material/Public'

type ProfileDropdownProps = {
  isMobile?: boolean
}

export function ProfileDropdown({ isMobile = false }: ProfileDropdownProps) {
  const { user, isLoading, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [imgError, setImgError] = useState(false)
  const open = Boolean(anchorEl)

  // Reset imgError state when profile picture URL changes
  useEffect(() => {
    setImgError(false)
  }, [user?.profilePictureUrl])

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Loading / hydration skeleton state
  if (isLoading || !user) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton 
          variant="circular" 
          width={isMobile ? 32 : 44} 
          height={isMobile ? 32 : 44} 
          animation="wave"
        />
        {!isMobile && (
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={100} height={16} animation="wave" />
            <Skeleton variant="text" width={140} height={12} animation="wave" />
          </Stack>
        )}
      </Stack>
    )
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleEditProfile = () => {
    handleCloseMenu()
    navigate('/settings/profile-edit', { state: { mode: 'edit' } })
  }

  const handleSignInAs = async () => {
    handleCloseMenu()
    await logout()
    navigate('/login')
  }

  const handleSignOut = async () => {
    handleCloseMenu()
    await logout()
    navigate('/login')
  }

  // Fallback initials if no image or image error
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return ''
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
    return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  const hasAvatarImage = user.profilePictureUrl && !imgError
  const initials = getInitials(user.fullName)

  return (
    <Box>
      {/* Trigger Button */}
      <ButtonBase
        onClick={handleOpenMenu}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
        sx={{
          borderRadius: isMobile ? '50%' : '28px', // Google Account style pill shape trigger
          p: isMobile ? 0.25 : 0.75,
          px: isMobile ? 0.25 : 1.25,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: open ? '#E8F0FE' : 'transparent',
          '&:hover': {
            bgcolor: open ? '#C2E7FF' : 'rgba(0, 0, 0, 0.04)',
          },
          textAlign: 'left',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={hasAvatarImage ? getFullImageUrl(user.profilePictureUrl) : undefined}
            alt={hasAvatarImage ? `${user.fullName}'s profile picture` : 'Default avatar'}
            imgProps={{
              onError: () => setImgError(true),
            }}
            sx={{
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
              border: `2px solid ${isMobile ? 'rgba(143, 0, 255, 0.15)' : '#004A77'}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 700,
              fontSize: isMobile ? '0.85rem' : '0.95rem',
            }}
          >
            {initials}
          </Avatar>

          {!isMobile && (
            <Stack 
              spacing={0.25} 
              sx={{ 
                maxWidth: 160,
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <Typography
                variant="body2"
                title={user.fullName}
                sx={{
                  fontWeight: 800,
                  color: open ? '#001D35' : 'text.primary',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.fullName}
              </Typography>
              <Typography
                variant="caption"
                title={user.email}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </Typography>
            </Stack>
          )}
        </Stack>
      </ButtonBase>

      {/* Google Account Style Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: 1.5,
            borderRadius: '24px', // Rounded Google style paper
            minWidth: 240,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            zIndex: 1400,
            p: 1,
            '& .MuiMenuItem-root': {
              py: 1,
              px: 1.5,
              borderRadius: '24px', // Google style pill menu items
              my: 0.5,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'text.primary',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '& .profile-menu-circle': {
                  transform: 'scale(1.08)',
                },
              },
            },
          },
        }}
      >
        {/* Top Header Card inside Dropdown */}
        <Box sx={{ px: 2, py: 1.5, mb: 1, borderRadius: '16px', bgcolor: '#F8F9FA' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {user.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

        {/* Edit Profile */}
        <MenuItem onClick={handleEditProfile}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              className="profile-menu-circle"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#CEEAD6',
                color: '#137333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 18 }} />
            </Box>
          </ListItemIcon>
          Edit Profile
        </MenuItem>

        {/* Public Profile */}
        <MenuItem onClick={() => {
          handleCloseMenu()
          if (user?.accountId) {
            window.open(`#/doctor/${user.accountId}`, '_blank')
          }
        }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              className="profile-menu-circle"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#E8F0FE',
                color: '#1A73E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <PublicIcon sx={{ fontSize: 18 }} />
            </Box>
          </ListItemIcon>
          Public Profile
        </MenuItem>

        {/* Sign in as */}
        <MenuItem onClick={handleSignInAs}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              className="profile-menu-circle"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#E8DEF8',
                color: '#65558F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <SwapHorizIcon sx={{ fontSize: 18 }} />
            </Box>
          </ListItemIcon>
          Sign in as
        </MenuItem>

        {/* Sign Out */}
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              className="profile-menu-circle"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#FCE8E6',
                color: '#D93025',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </Box>
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#D93025' }}>
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}
