import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Grid,
  Button,
  Stack,
  Card,
  CardContent
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { PracticeCentre } from './types'

interface FormReviewSummaryProps {
  data: PracticeCentre
  onJumpToStep: (stepIndex: number) => void
}

export const FormReviewSummary: React.FC<FormReviewSummaryProps> = ({
  data,
  onJumpToStep
}) => {
  const totalSessions = data.sessionGroups.reduce(
    (acc, group) => acc + group.timeBlocks.length * group.daysOfWeek.length,
    0
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Overview Banner */}
      <Paper
        className="glass-card"
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(143, 0, 255, 0.05) 0%, rgba(98, 0, 234, 0.02) 100%)',
          border: '1px solid rgba(143, 0, 255, 0.2)',
          borderRadius: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {data.clinicName || data.placeName || 'Unnamed Practice Centre'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review your practice centre details before saving
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<LocationOnIcon />}
              label={`${data.district || 'No District'} / ${data.mohArea || 'No MOH'}`}
              color="primary"
              variant="outlined"
            />
            {data.maxPatients && (
              <Chip
                label={`Max ${data.maxPatients} Patients/Session`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Location Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: 'background.paper',
              borderColor: 'rgba(143, 0, 255, 0.12)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Location Details
                  </Typography>
                </Box>
                <Button size="small" startIcon={<EditIcon />} onClick={() => onJumpToStep(0)}>
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    District
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {data.district || 'Not selected'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    MOH Area
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {data.mohArea || 'Not selected'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Place / Hospital
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {data.placeName || 'Not selected'}
                  </Typography>
                </Box>
                {data.clinicName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Clinic Name (Override)
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {data.clinicName}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: 'background.paper',
              borderColor: 'rgba(143, 0, 255, 0.12)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Schedules ({totalSessions})
                  </Typography>
                </Box>
                <Button size="small" startIcon={<EditIcon />} onClick={() => onJumpToStep(1)}>
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {data.sessionGroups.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No sessions configured.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {data.sessionGroups.map((group, gIdx) => (
                    <Box key={group.id || gIdx} sx={{ bgcolor: 'rgba(143, 0, 255, 0.03)', p: 1.5, borderRadius: 2 }}>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                        {group.specificDate ? (
                          <Chip label={`Specific Date: ${group.specificDate}`} size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ) : (
                          group.daysOfWeek.map((day) => (
                            <Chip key={day} label={day} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                          ))
                        )}
                      </Box>
                      {group.timeBlocks.map((tb, tbIdx) => (
                        <Typography key={tb.id || tbIdx} variant="caption" display="block" color="text.primary">
                          • {tb.label || 'Block'}: {tb.startTime} - {tb.endTime}
                        </Typography>
                      ))}
                      {group.daysOff && group.daysOff.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="caption" fontWeight={700} color="error.main">
                            Exception Days Off:
                          </Typography>
                          <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                            {group.daysOff.map((day, dIdx) => (
                              <Chip key={dIdx} label={day} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Nurses Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: 'background.paper',
              borderColor: 'rgba(143, 0, 255, 0.12)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Assistants ({data.nurses.length})
                  </Typography>
                </Box>
                <Button size="small" startIcon={<EditIcon />} onClick={() => onJumpToStep(2)}>
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {data.nurses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No nurses assigned.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {data.nurses.map((nurse, nIdx) => (
                    <Box key={nurse.id || nIdx} display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {nurse.name || 'Unnamed Nurse'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {nurse.phoneNumber || 'No Phone'}
                        </Typography>
                      </Box>
                      <Chip
                        label={nurse.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={nurse.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
