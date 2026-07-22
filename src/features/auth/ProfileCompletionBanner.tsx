import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { httpClient } from '../../api/httpClient'
import { Box, Typography, Button, IconButton, Collapse, Paper, Stack, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full Name',
  dateOfBirth: 'Date of Birth',
  slmcRegNumber: 'SLMC Registration Number',
  nicNumber: 'NIC Number',
  mobileNumber: 'Mobile Number',
  specialty: 'Speciality',
  slmcCertificate: 'SLMC Certificate Document',
  eSignature: 'E-Signature Verification',
}

export function ProfileCompletionBanner() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [isDismissed, setIsDismissed] = useState(false)

  const isSettingsPage = location.pathname.toLowerCase() === '/settings'

  useEffect(() => {
    if (!isAuthenticated || user?.completionStatus === 'COMPLETE') {
      setMissingFields([])
      return
    }

    let isMounted = true
    const loadMissingFields = async () => {
      try {
        const response = await httpClient.get('/api/profile/missing-fields')
        if (isMounted && response.data?.success) {
          setMissingFields(response.data.data.missingFields)
        }
      } catch (err) {
        console.error('Error fetching missing fields for banner', err)
      }
    }

    loadMissingFields()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.completionStatus, location.pathname]) // Refresh when page/status changes

  if (!isAuthenticated || user?.completionStatus === 'COMPLETE' || missingFields.length === 0 || isDismissed) {
    return null
  }

  return (
    <Collapse in={true} unmountOnExit>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #fdfbf7 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 10px 40px -10px rgba(251, 191, 36, 0.15)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '100%',
            background: 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)',
            borderRadius: '4px 0 0 4px',
          },
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                color: '#f59e0b',
                mt: 0.5,
                p: 1.2,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.4)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(251, 191, 36, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0)' }
                }
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#451a03', mb: 0.5, letterSpacing: '-0.01em' }}>
                Complete Your Professional Profile
              </Typography>
              <Typography variant="body2" sx={{ color: '#78350f', mb: 2, fontSize: '0.95rem', opacity: 0.9 }}>
                Your account is active, but some features are locked until your profile is complete.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1.2 }}>
                {missingFields.map((field) => (
                  <Chip
                    key={field}
                    label={FIELD_LABELS[field] ?? field}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(251, 191, 36, 0.1)',
                      color: '#b45309',
                      fontWeight: 700,
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      backdropFilter: 'blur(4px)',
                      px: 0.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(251, 191, 36, 0.2)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
            {!isSettingsPage && (
              <Button
                component={Link}
                to="/settings"
                variant="contained"
                sx={{
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(245, 158, 11, 0.45)',
                  },
                }}
              >
                Complete Profile
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setIsDismissed(true)}
              aria-label="dismiss"
              sx={{ 
                color: '#92400e',
                bgcolor: 'rgba(251, 191, 36, 0.1)',
                '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.2)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Collapse>
  )
}
