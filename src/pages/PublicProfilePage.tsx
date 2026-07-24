import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Button,
  Grid,
  Paper,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import 'react-quill-new/dist/quill.snow.css'

type PracticeCentreResponse = {
  id: string
  clinicName: string
  districtName: string
  mohAreaName: string
  placeName: string
  sessionGroups: {
    id: string
    daysOfWeek: string[]
    timeBlocks: {
      id: string
      label: string
      startTime: string
      endTime: string
    }[]
  }[]
}

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
  const navigate = useNavigate()
  const [profile, setProfile] = useState<PublicDoctorResponse | null>(null)
  const [practiceCentres, setPracticeCentres] = useState<PracticeCentreResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
      try {
        const response = await fetch(`${apiBase}/api/public/doctors/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Doctor profile not found')
          }
          throw new Error('Failed to load profile')
        }
        
        const data = await response.json()
        setProfile(data.value || data)
        
        // Fetch practice centres
        const pcResponse = await fetch(`${apiBase}/api/public/doctors/${id}/practice-centres`)
        if (pcResponse.ok) {
          const pcData = await pcResponse.json()
          setPracticeCentres(pcData || [])
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
          setError(`Unable to connect to backend server (${apiBase}). Please ensure the API server is running locally.`)
        } else {
          setError(msg)
        }
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <Box sx={{ height: 180, background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)' }} />
        <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 2, pb: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: -7 }}>
                  <Skeleton variant="circular" width={140} height={140} sx={{ border: '5px solid white' }} />
                </Box>
                <CardContent sx={{ pt: 2, px: 3, pb: 4, textAlign: 'center' }}>
                  <Skeleton variant="text" width="80%" height={40} sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="rounded" width="100%" height={100} />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
                  <Skeleton variant="rounded" width="100%" height={150} sx={{ mb: 2 }} />
                  <Skeleton variant="rounded" width="100%" height={150} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
          height: 180,
          background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)',
          position: 'relative',
        }}
      />

      <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 2, pb: 6 }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Left Column: Profile Card */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: -7 }}>
                <Avatar
                  src={getFullImageUrl(profile.profilePictureUrl)}
                  alt={profile.fullName}
                  sx={{
                    width: 140,
                    height: 140,
                    border: '5px solid white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                  }}
                >
                  {profile.fullName.charAt(0)}
                </Avatar>
              </Box>

              <CardContent sx={{ pt: 2, px: 3, pb: 4 }}>
                {/* Header Info */}
                <Box textAlign="center" mb={2}>
                  <Typography variant="h5" fontWeight="800" gutterBottom>
                    {profile.fullName}
                  </Typography>
                  
                  {(profile.specialty || profile.subSpecialty) && (
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="500" gutterBottom sx={{ lineHeight: 1.3, mb: 1.5 }}>
                      {profile.specialty} {profile.subSpecialty ? `• ${profile.subSpecialty}` : ''}
                    </Typography>
                  )}

                  {profile.qualifications && profile.qualifications.length > 0 && (
                    <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
                      {profile.qualifications.map((q, index) => (
                        <Chip
                          key={index}
                          label={q.name}
                          size="small"
                          icon={<CheckCircleIcon sx={{ color: '#10b981 !important', fontSize: '1rem' }} />}
                          sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.08)',
                            color: '#10b981',
                            fontWeight: 600,
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                {profile.bio && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
                        About
                      </Typography>
                      <Box className="ql-snow" sx={{ '& .ql-editor': { p: 0, minHeight: 'auto', color: 'text.secondary', lineHeight: 1.6, fontSize: '0.95rem', fontFamily: 'inherit' } }}>
                        <Box className="ql-editor" dangerouslySetInnerHTML={{ __html: profile.bio }} />
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Sessions */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0px 12px 24px -4px rgba(143, 0, 255, 0.04)',
                bgcolor: 'white',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                  Available Sessions
                </Typography>

                {practiceCentres && practiceCentres.length > 0 ? (
                  <Stack spacing={2.5}>
                    {practiceCentres.map(centre => {
                      const title = centre.clinicName || centre.placeName
                      const location = `${centre.mohAreaName}, ${centre.districtName}`
                      
                      return (
                        <Paper 
                          key={centre.id}
                          variant="outlined" 
                          sx={{ 
                            p: 2.5, 
                            borderRadius: 3,
                            borderColor: 'divider',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0px 8px 16px -4px rgba(143, 0, 255, 0.08)',
                              borderColor: 'primary.light',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 0.25 }}>
                                {title}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                                <LocationOnIcon sx={{ fontSize: '1.1rem', opacity: 0.7 }} />
                                <Typography variant="body2">{location}</Typography>
                              </Stack>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Button 
                                variant="contained" 
                                color="primary"
                                startIcon={<EventAvailableIcon />}
                                size="small"
                                onClick={() => navigate(`/book/${id}/centre/${centre.id}`, {
                                  state: {
                                    doctorName: profile?.fullName,
                                    clinicName: centre.clinicName || centre.placeName,
                                  }
                                })}
                                sx={{ 
                                  borderRadius: 6, 
                                  px: 2.5, 
                                  py: 0.75, 
                                  textTransform: 'none', 
                                  fontWeight: 600,
                                  boxShadow: '0 4px 10px 0 rgba(143, 0, 255, 0.3)',
                                }}
                              >
                                Book Appointment
                              </Button>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ mb: 1.5, opacity: 0.6 }} />
                          
                          <Box>
                            {centre.sessionGroups && centre.sessionGroups.length > 0 ? (
                              <Grid container spacing={2}>
                                {centre.sessionGroups.map(sg => (
                                  <Grid size={{ xs: 12, sm: 6, lg: 6 }} key={sg.id}>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                      <CalendarTodayIcon sx={{ color: 'primary.main', mt: 0.25, fontSize: '1.2rem' }} />
                                      <Box>
                                        <Box sx={{ mb: 1 }}>
                                          {sg.daysOfWeek.map(day => (
                                            <Chip 
                                              key={day} 
                                              label={day} 
                                              size="small" 
                                              sx={{ mr: 0.5, mb: 0.5, bgcolor: 'rgba(143, 0, 255, 0.08)', color: 'primary.main', fontWeight: 600, height: 24, fontSize: '0.75rem' }} 
                                            />
                                          ))}
                                        </Box>
                                        <Stack spacing={1}>
                                          {sg.timeBlocks.map(tb => (
                                            <Stack key={tb.id} direction="row" alignItems="center" spacing={1}>
                                              <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                                {tb.startTime} - {tb.endTime}
                                              </Typography>
                                              {tb.label && (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                                                  ({tb.label})
                                                </Typography>
                                              )}
                                            </Stack>
                                          ))}
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.85rem' }}>
                                No sessions currently scheduled.
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      )
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      No practice centres or sessions are available right now.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
