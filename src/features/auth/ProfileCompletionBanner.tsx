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
  qualifications: 'Qualifications',
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
    <Collapse in={true}>
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          borderLeft: '5px solid',
          borderColor: 'warning.main',
          bgcolor: 'warning.light',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                display: 'flex',
                color: 'warning.main',
                mt: 0.3,
              }}
            >
              <WarningAmberIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                Complete Your Professional Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Your account is active, but some features are locked until your profile is complete.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1, mb: 1.5 }}>
                {missingFields.map((field) => (
                  <Chip
                    key={field}
                    label={FIELD_LABELS[field] ?? field}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ bgcolor: 'white', fontWeight: 500 }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {!isSettingsPage && (
              <Button
                component={Link}
                to="/settings"
                variant="contained"
                color="warning"
                size="small"
                sx={{
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                  borderRadius: 1.5,
                }}
              >
                Complete Profile
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setIsDismissed(true)}
              aria-label="dismiss"
              sx={{ color: 'warning.dark' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Collapse>
  )
}
