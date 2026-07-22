import { useState, useEffect, type ReactNode } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from './useAuth'
import { httpClient } from '../../api/httpClient'
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const ROUTE_REQUIREMENTS: Record<string, { fields: string[]; label: string }[]> = {
  '/reports': [
    { fields: ['specialty'], label: 'Medical Speciality' },
    { fields: ['slmcCertificate'], label: 'SLMC Certificate Verification Document' },
  ],
  '/todos': [
    { fields: ['mobileNumber'], label: 'Mobile Phone Number' }
  ]
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, fetchProfile, logout } = useAuth()
  const location = useLocation()
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true
    const loadMissingFields = async () => {
      try {
        // Fetch fresh profile details and missing fields in parallel
        const [_, resMissing] = await Promise.all([
          fetchProfile(),
          httpClient.get('/api/profile/missing-fields')
        ])
        
        if (isMounted && resMissing.data?.success) {
          setMissingFields(resMissing.data.data.missingFields)
        }
      } catch (err: any) {
        console.error('Error fetching missing fields', err)
        if (err.response?.status === 401) {
          logout()
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMissingFields()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, location.pathname, logout]) // Re-run when path changes to check requirements

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Check if current route has requirements and any of them are missing
  const currentPath = location.pathname.toLowerCase()
  const matchingKey = Object.keys(ROUTE_REQUIREMENTS).find(
    (key) => currentPath.startsWith(key)
  )

  if (matchingKey) {
    const requirements = ROUTE_REQUIREMENTS[matchingKey]
    const missingForThisRoute = requirements.filter(req => 
      req.fields.some(field => missingFields.includes(field))
    )

    if (missingForThisRoute.length > 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 3,
          }}
        >
          <Card
            elevation={4}
            sx={{
              maxWidth: 500,
              width: '100%',
              borderRadius: 3,
              textAlign: 'center',
              p: 3,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'error.light',
                  color: 'error.main',
                  mb: 2,
                }}
              >
                <LockOutlinedIcon fontSize="large" />
              </Box>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Profile Incomplete
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                To access the <strong>{matchingKey.replace('/', '').toUpperCase()}</strong> feature, you are required to complete the following profile sections:
              </Typography>

              <Box sx={{ textAlign: 'left', bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'grey.200' }}>
                {missingForThisRoute.map((req, i) => (
                  <Typography key={i} variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    • {req.label}
                  </Typography>
                ))}
              </Box>

              <Button
                component={Link}
                to="/settings"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ borderRadius: 2, py: 1.2, fontWeight: 'bold' }}
              >
                Complete Profile Now
              </Button>
            </CardContent>
          </Card>
        </Box>
      )
    }
  }

  return <>{children}</>
}
