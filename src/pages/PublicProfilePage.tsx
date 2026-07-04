import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  Stack,
  Chip,
  Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import 'react-quill-new/dist/quill.snow.css'

type PublicDoctorResponse = {
  accountId: string
  fullName: string
  firstName?: string
  lastName?: string
  specialty?: string
  subSpecialty?: string
  profilePictureUrl?: string
  bio?: string
  qualifications: { name: string }[]
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicDoctorResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
        const response = await fetch(`${apiBase}/api/public/doctors/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Doctor profile not found')
          }
          throw new Error('Failed to load profile')
        }
        
        const data = await response.json()
        setProfile(data.value)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
    }
  }, [id])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Skeleton variant="rectangular" height={200} />
        <Container maxWidth="md" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
          <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ px: 4, pt: 4, pb: 4, textAlign: 'center' }}>
              <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto', border: '4px solid white', mb: 2 }} />
              <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mx: 'auto' }} />
            </Box>
          </Card>
        </Container>
      </Box>
    )
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          {error || 'Profile not found'}
        </Typography>
      </Container>
    )
  }

  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return undefined
    if (url.startsWith('http')) return url
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
    return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      {/* Banner / Header */}
      <Box
        sx={{
          height: 220,
          background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)',
          position: 'relative',
        }}
      />

      <Container maxWidth="md" sx={{ mt: -10, position: 'relative', zIndex: 2, pb: 8 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'visible',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0px 12px 24px -4px rgba(143, 0, 255, 0.04)',
          }}
        >
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -8 }}>
            <Avatar
              src={getFullImageUrl(profile.profilePictureUrl)}
              alt={profile.fullName}
              sx={{
                width: 150,
                height: 150,
                border: '6px solid white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {profile.fullName.charAt(0)}
            </Avatar>
          </Box>

          <CardContent sx={{ pt: 3, px: { xs: 3, md: 6 }, pb: 6 }}>
            {/* Header Info */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight="800" gutterBottom>
                {profile.fullName}
              </Typography>
              
              {(profile.specialty || profile.subSpecialty) && (
                <Typography variant="h6" color="text.secondary" fontWeight="500" gutterBottom>
                  {profile.specialty} {profile.subSpecialty ? `• ${profile.subSpecialty}` : ''}
                </Typography>
              )}

              {profile.qualifications && profile.qualifications.length > 0 && (
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
                  {profile.qualifications.map((q, index) => (
                    <Chip
                      key={index}
                      label={q.name}
                      size="small"
                      icon={<CheckCircleIcon sx={{ color: '#10b981 !important' }} />}
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.08)',
                        color: '#10b981',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {profile.bio && (
              <>
                <Divider sx={{ my: 4 }} />
                
                <Box>
                  <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                    About
                  </Typography>
                  {profile.bio ? (
                    <Box className="ql-snow" sx={{ '& .ql-editor': { p: 0, minHeight: 'auto', color: 'text.secondary', lineHeight: 1.8, fontSize: '1.05rem', fontFamily: 'inherit' } }}>
                      <Box className="ql-editor" dangerouslySetInnerHTML={{ __html: profile.bio }} />
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.05rem' }}>No professional statement provided.</Typography>
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
