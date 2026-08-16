import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import { AppointmentCalendar } from './AppointmentCalendar'
import { PatientLookupStep, type PatientRecord } from './PatientLookupStep'
import type { DayAvailability } from './appointmentApi'
import { formatDisplayDateLong } from '../../utils/dateUtils'

export interface DoctorHeaderInfo {
  fullName: string
  specialty?: string
  profilePictureUrl?: string
}

export interface CentreHeaderInfo {
  id: string
  clinicName: string
  placeName: string
  districtName: string
  mohAreaName: string
}

export interface SessionOption {
  id: string
  name: string
  timeRange: string
}

interface AppointmentFormBuilderProps {
  doctor: DoctorHeaderInfo | null
  centre: CentreHeaderInfo | null
  availabilityMap: Record<string, DayAvailability>
  availLoading: boolean
  availableSessions: SessionOption[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  selectedSessionId: string | null
  onSelectSession: (sessionId: string) => void
  confirmedPatient: PatientRecord | null
  onConfirmPatient: (patient: PatientRecord | null) => void
  initialMobile?: string | null
  booking: boolean
  bookingError: string | null
  bookingResult: { ticketId: string; queueNumber: number; visitDate: string } | null
  onBook: () => void
  onCancel: () => void
  doctorId?: string
}

const STEPS = [
  { label: 'Date', subtitle: 'Select Visit Date' },
  { label: 'Session', subtitle: 'Select Session Time' },
  { label: 'Patient Information', subtitle: 'Mobile Search & Contact' },
  { label: 'Review & Confirm', subtitle: 'Confirm Booking Token' }
]

export const AppointmentFormBuilder: React.FC<AppointmentFormBuilderProps> = ({
  doctor,
  centre,
  availabilityMap,
  availLoading,
  availableSessions,
  selectedDate,
  onSelectDate,
  selectedSessionId,
  onSelectSession,
  confirmedPatient,
  onConfirmPatient,
  initialMobile,
  booking,
  bookingError,
  bookingResult,
  onBook,
  onCancel,
  doctorId
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const formTopRef = useRef<HTMLDivElement>(null)

  const [activeStep, setActiveStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false])
  const [stepError, setStepError] = useState<string | null>(null)

  // Smooth scroll and focus management on mount & step change
  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    formTopRef.current?.focus()
  }, [activeStep])

  const validateStep0 = (): boolean => {
    if (!selectedDate) {
      setStepError('Please select a visit date from the calendar.')
      return false
    }
    setStepError(null)
    return true
  }

  const validateStep1 = (): boolean => {
    if (availableSessions.length > 0 && !selectedSessionId) {
      setStepError('Please select an available session time slot.')
      return false
    }
    setStepError(null)
    return true
  }

  const validateStep2 = (): boolean => {
    if (!confirmedPatient) {
      setStepError('Please complete patient identification and verification.')
      return false
    }
    setStepError(null)
    return true
  }

  const handleNextStep = () => {
    let isValid = false
    if (activeStep === 0) isValid = validateStep0()
    else if (activeStep === 1) isValid = validateStep1()
    else if (activeStep === 2) isValid = validateStep2()
    else isValid = true

    if (isValid) {
      const updated = [...completedSteps]
      updated[activeStep] = true
      setCompletedSteps(updated)
      setActiveStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevStep = () => {
    setStepError(null)
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const progressPercent = ((activeStep + 1) / STEPS.length) * 100
  const selectedSession = availableSessions.find((s) => s.id === selectedSessionId)

  return (
    <Box
      ref={formTopRef}
      tabIndex={-1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pb: 24,
        outline: 'none',
        ...(isMobile && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          bgcolor: '#f8fafc',
          overflowY: 'auto',
          p: 2,
          pb: 24
        })
      }}
    >
      {/* Mobile Top Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(143, 0, 255, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton size="small" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              Book Appointment
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dr. {doctor?.fullName} — {centre?.clinicName || centre?.placeName}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`Step ${activeStep + 1} / 4`}
          size="small"
          color="primary"
          sx={{ fontWeight: 700 }}
        />
      </Paper>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 6,
          borderRadius: 3,
          mb: 3,
          bgcolor: 'rgba(143, 0, 255, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)'
          }
        }}
      />

      {(stepError || bookingError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {stepError || bookingError}
        </Alert>
      )}

      {/* Success Booking Ticket Receipt */}
      {bookingResult ? (
        <Paper className="glass-card" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
            Appointment Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your appointment has been successfully scheduled.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              maxWidth: 400,
              mx: 'auto',
              borderRadius: 3,
              bgcolor: 'rgba(143, 0, 255, 0.04)',
              borderColor: 'primary.main',
              mb: 3
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              YOUR QUEUE NUMBER
            </Typography>
            <Typography variant="h2" fontWeight={900} color="primary.main" my={1}>
              #{bookingResult.queueNumber}
            </Typography>
            <Typography variant="subtitle2" fontWeight={700}>
              Visit Date: {formatDisplayDateLong(new Date(bookingResult.visitDate))}
            </Typography>
          </Paper>

          <Button variant="contained" color="primary" onClick={onCancel} sx={{ px: 4, borderRadius: 2.5 }}>
            Done
          </Button>
        </Paper>
      ) : (
        <>
          {/* Step 0: Select Date & Session Slot */}
          {activeStep === 0 && (
            <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
                Select Visit Date & Session Time
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Choose a date on the calendar to view available consultation session slots.
              </Typography>

              {availLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}
              <AppointmentCalendar
                availabilityMap={availabilityMap}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  onSelectDate(d);
                  const updated = [...completedSteps];
                  updated[0] = true;
                  setCompletedSteps(updated);
                  setActiveStep(1);
                }}
              />
            </Paper>
          )}

          {/* Step 1: Select Session Slot */}
          {activeStep === 1 && (
            <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
              {selectedDate && (
                <Box>
                  <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
                    Select Session Time
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Choose an available session for {formatDisplayDateLong(selectedDate)}
                  </Typography>

                  {availableSessions.length === 0 ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      No available sessions on this date. Please select another date.
                    </Alert>
                  ) : (
                    <Stack spacing={2} mt={1.5}>
                      {availableSessions.map((session) => (
                        <Card
                          key={session.id}
                          variant="outlined"
                          onClick={() => {
                            onSelectSession(session.id);
                            const updated = [...completedSteps];
                            updated[1] = true;
                            setCompletedSteps(updated);
                            setActiveStep(2);
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            bgcolor: selectedSessionId === session.id ? 'rgba(143, 0, 255, 0.08)' : 'background.paper',
                            borderColor: selectedSessionId === session.id ? 'primary.main' : 'divider'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <AccessTimeIcon color={selectedSessionId === session.id ? 'primary' : 'action'} />
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {session.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {session.timeRange}
                                </Typography>
                              </Box>
                            </Box>
                            {selectedSessionId === session.id && (
                              <CheckCircleIcon color="primary" fontSize="small" />
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Paper>
          )}

          {/* Step 2: Patient Lookup & Contact */}
          {activeStep === 2 && (
            <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
                Patient Identification & Contact
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Verify mobile number and select patient for appointment booking.
              </Typography>

              <PatientLookupStep
                onPatientConfirmed={(patient) => {
                  onConfirmPatient(patient);
                  if (patient) {
                    const updated = [...completedSteps];
                    updated[2] = true;
                    setCompletedSteps(updated);
                    setActiveStep(3);
                  }
                }}
                initialMobile={initialMobile || undefined}
                createdByDoctorId={doctorId}
              />
            </Paper>
          )}

          {/* Step 3: Review & Confirm */}
          {activeStep === 3 && (
            <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
                Review & Confirm Appointment
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Review details before finalizing your appointment token.
              </Typography>

              <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      Dr. {doctor?.fullName}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Practice Location
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {centre?.clinicName || centre?.placeName} ({centre?.districtName})
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Appointment Date
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedDate ? formatDisplayDateLong(selectedDate) : 'Not selected'}
                    </Typography>
                  </Box>

                  {selectedSession && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Session Slot
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {selectedSession.name} ({selectedSession.timeRange})
                      </Typography>
                    </Box>
                  )}

                  <Divider />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Patient
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {confirmedPatient?.firstName} {confirmedPatient?.lastName} ({confirmedPatient?.mobileNumber})
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Paper>
          )}

          {/* Sticky Bottom Navigation Bar */}
          <Paper
            elevation={6}
            sx={{
              position: 'fixed',
              bottom: 12,
              left: 12,
              right: 12,
              zIndex: 1400,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(143, 0, 255, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Button
              onClick={activeStep === 0 ? onCancel : handlePrevStep}
              variant="outlined"
              color="inherit"
              startIcon={activeStep > 0 ? <ArrowBackIcon /> : undefined}
              disabled={booking}
              sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 700 }}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {activeStep < 3 ? (
              <Button
                onClick={handleNextStep}
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)'
                }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={onBook}
                variant="contained"
                color="primary"
                disabled={booking}
                startIcon={booking ? <CircularProgress size={20} color="inherit" /> : <ConfirmationNumberIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 5,
                  py: 1.2,
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)'
                }}
              >
                {booking ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            )}
          </Paper>
        </>
      )}
    </Box>
  )
}
