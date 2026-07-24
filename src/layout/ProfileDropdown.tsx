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
          borderRadius: isMobile ? '50%' : '12px',
          p: isMobile ? 0.25 : 0.75,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: 'rgba(143, 0, 255, 0.04)',
            transform: 'scale(1.02)',
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
              width: isMobile ? 32 : 44,
              height: isMobile ? 32 : 44,
              border: `2px solid ${isMobile ? 'rgba(143, 0, 255, 0.15)' : 'rgba(143, 0, 255, 0.25)'}`,
              boxShadow: '0 4px 12px rgba(143, 0, 255, 0.08)',
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 700,
              fontSize: isMobile ? '0.85rem' : '1rem',
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
                  color: 'text.primary',
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

      {/* Accessible Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            borderRadius: '16px',
            minWidth: 200,
            overflow: 'visible',
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(143, 0, 255, 0.08)',
            boxShadow: '0 10px 30px rgba(9, 14, 28, 0.12)',
            zIndex: 1400,
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 22,
              width: 10,
              height: 10,
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderLeft: '1px solid rgba(143, 0, 255, 0.08)',
              borderTop: '1px solid rgba(143, 0, 255, 0.08)',
            },
            '& .MuiMenuItem-root': {
              py: 1.25,
              px: 2,
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(143, 0, 255, 0.06)',
                color: 'primary.main',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleEditProfile}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          Edit Profile
        </MenuItem>

        <MenuItem onClick={() => {
          handleCloseMenu()
          if (user?.accountId) {
            window.open(`#/doctor/${user.accountId}`, '_blank')
          }
        }}>
          <ListItemIcon>
            <PublicIcon fontSize="small" />
          </ListItemIcon>
          Public Profile
        </MenuItem>

        <MenuItem onClick={handleSignInAs}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          Sign in as
        </MenuItem>

        <MenuItem onClick={handleSignOut} sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  )
}
