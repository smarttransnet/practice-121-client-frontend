import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Stack,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarRateIcon from '@mui/icons-material/StarRate'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import { FamilyPatientSelector } from '../patients/FamilyPatientSelector'
import { AddChildModal } from '../patients/AddChildModal'
import { OtpVerificationDialog } from '../../components/OtpVerificationDialog'
import {
  getPatientByMobile,
  searchPatients,
  sendPatientOtp,
  verifyPatientOtp,
  resendPatientOtp,
  type Patient
} from './patientQueueApi'
import { isValidLkMobile, normalizeLkMobile } from '../../utils/lkPhoneValidation'
import { formatDisplayDateLong, formatIsoDate } from '../../utils/dateUtils'

export interface PracticeCentreItem {
  id: string
  clinicName: string
  districtName: string
  mohAreaName: string
  placeName: string
}

export interface DaySessionInfo {
  id: string
  label: string
  timeRange: string
}

interface QueueFormBuilderProps {
  open: boolean
  onClose: () => void
  practiceCentres: PracticeCentreItem[]
  selectedCentreId: string
  onSelectCentre: (centreId: string) => void
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  daySessions: DaySessionInfo[]
  onConfirmAdd: (data: {
    patientId: string
    sessionId?: string
    priority: number
    visitDate: string
    patientMobile: string
  }) => Promise<void>
  onRegisterRedirect: (mobile: string) => void
}

const STEPS = [
  { label: 'Patient Lookup', subtitle: 'Mobile Search & Verification' },
  { label: 'Session & Priority', subtitle: 'Select Time Slot & Priority' },
  { label: 'Review & Confirm', subtitle: 'Confirm Queue Token' }
]

export const QueueFormBuilder: React.FC<QueueFormBuilderProps> = ({
  open,
  onClose,
  practiceCentres,
  selectedCentreId,
  onSelectCentre,
  selectedDate,
  onSelectDate,
  daySessions,
  onConfirmAdd,
  onRegisterRedirect
}) => {
  const formTopRef = useRef<HTMLDivElement>(null)

  const [activeStep, setActiveStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false])
  const [error, setError] = useState('')

  // Patient Lookup States
  const [patientMobile, setPatientMobile] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null)
  const [primaryPatientRecord, setPrimaryPatientRecord] = useState<Patient | null>(null)
  const [verifiedChildren, setVerifiedChildren] = useState<Patient[]>([])
  const [searchResults, setSearchResults] = useState<Patient[]>([])

  // OTP Verification States
  const [openOtpDialog, setOpenOtpDialog] = useState(false)
  const [otpSessionId, setOtpSessionId] = useState<string>('')
  const [maskedMobile, setMaskedMobile] = useState<string>('')
  const [pendingMobile, setPendingMobile] = useState<string>('')

  // Advanced Search States
  const [searchFirstName, setSearchFirstName] = useState('')
  const [searchLastName, setSearchLastName] = useState('')
  const [searchNic, setSearchNic] = useState('')

  // Modals
  const [openAddChildModal, setOpenAddChildModal] = useState(false)

  // Session & Priority States
  const [targetSessionId, setTargetSessionId] = useState<string>('')
  const [priority, setPriority] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setCompletedSteps([false, false, false])
      setError('')
    }
  }, [open])

  // Smooth scroll and focus on step change
  useEffect(() => {
    if (open) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      formTopRef.current?.focus()
    }
  }, [open, activeStep])

  useEffect(() => {
    if (daySessions.length > 0 && (!targetSessionId || !daySessions.some((s) => s.id === targetSessionId))) {
      setTargetSessionId(daySessions[0].id)
    }
  }, [daySessions, targetSessionId])

  if (!open) return null

  const handleOtpVerified = async (verificationToken: string) => {
    setOpenOtpDialog(false)
    setLookupLoading(true)
    setError('')
    try {
      const res = await getPatientByMobile(pendingMobile, verificationToken)
      if (res && res.primaryPatient) {
        setVerifiedPatient(res.primaryPatient)
        setPrimaryPatientRecord(res.primaryPatient)
        setVerifiedChildren(res.children || [])
      } else {
        setError('No patient record found for this mobile number.')
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load patient record after OTP verification.')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleMobileLookup = async () => {
    setError('')
    const norm = normalizeLkMobile(patientMobile)
    if (!norm || !isValidLkMobile(norm)) {
      setError('Please enter a valid Sri Lankan mobile number (e.g. 077 123 4567).')
      return
    }

    setLookupLoading(true)
    try {
      const otpSendRes = await sendPatientOtp(norm)
      if (otpSendRes.patientExists && otpSendRes.sessionId) {
        setOtpSessionId(otpSendRes.sessionId)
        setMaskedMobile(otpSendRes.maskedMobile || norm)
        setPendingMobile(norm)
        setOpenOtpDialog(true)
        return
      }

      const hasAdvanced = searchFirstName.trim() || searchLastName.trim() || searchNic.trim()
      if (hasAdvanced) {
        const advRes = await searchPatients({
          firstName: searchFirstName.trim() || undefined,
          lastName: searchLastName.trim() || undefined,
          nicNumber: searchNic.trim() || undefined
        })
        if (advRes.length > 0) {
          setSearchResults(advRes)
        } else {
          setError('No matching patient found. You can register a new patient.')
        }
      } else {
        setError('No patient account found for this mobile number. You can register a new patient account below.')
      }
    } catch (e: any) {
      setError(e.message || 'Error searching patient record.')
    } finally {
      setLookupLoading(false)
    }
  }

  const validateStep0 = (): boolean => {
    if (!verifiedPatient) {
      setError('Please search and select a verified patient record.')
      return false
    }
    setError('')
    return true
  }

  const handleNextStep = () => {
    let isValid = false
    if (activeStep === 0) isValid = validateStep0()
    else isValid = true

    if (isValid) {
      const updated = [...completedSteps]
      updated[activeStep] = true
      setCompletedSteps(updated)
      setActiveStep((prev) => Math.min(prev + 1, 2))
    }
  }

  const handlePrevStep = () => {
    setError('')
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const handleFinalSubmit = async () => {
    if (!verifiedPatient || !selectedDate) return
    setSubmitting(true)
    setError('')
    try {
      const rawMobile = verifiedPatient.mobileNumber || patientMobile
      const mobileToUse = normalizeLkMobile(rawMobile) || rawMobile.trim()
      const cleanSessionId = targetSessionId && targetSessionId !== 'ALL' && targetSessionId.trim() !== '' ? targetSessionId : undefined

      await onConfirmAdd({
        patientId: verifiedPatient.id,
        patientMobile: mobileToUse,
        sessionId: cleanSessionId,
        priority,
        visitDate: formatIsoDate(selectedDate)
      })
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to add patient to queue.')
    } finally {
      setSubmitting(false)
    }
  }

  const currentCentre = practiceCentres.find((c) => c.id === selectedCentreId)
  const progressPercent = ((activeStep + 1) / STEPS.length) * 100

  return (
    <Box
      ref={formTopRef}
      tabIndex={-1}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        bgcolor: '#f8fafc',
        overflowY: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
        pb: 24,
        outline: 'none'
      }}
    >
      {/* Mobile Top App Bar */}
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
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              Add Patient to Queue
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {STEPS[activeStep].label} — Step {activeStep + 1} of {STEPS.length}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`Step ${activeStep + 1} / 3`}
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

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Step 0: Patient Lookup & Identification */}
      {activeStep === 0 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Patient Search & Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter patient's mobile number or search by details to link queue ticket.
          </Typography>

          {!verifiedPatient ? (
            <Stack spacing={3}>
              <Box display="flex" gap={1.5}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="077 123 4567"
                  value={patientMobile}
                  onChange={(e) => setPatientMobile(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMobileLookup}
                  disabled={lookupLoading}
                  startIcon={lookupLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  sx={{ px: 3, borderRadius: 2 }}
                >
                  Search
                </Button>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'rgba(143, 0, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(143, 0, 255, 0.1)' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1.5}>
                  ADVANCED PATIENT SEARCH (IF MOBILE UNKNOWN)
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="First Name"
                      value={searchFirstName}
                      onChange={(e) => setSearchFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Last Name"
                      value={searchLastName}
                      onChange={(e) => setSearchLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="NIC Number"
                      value={searchNic}
                      onChange={(e) => setSearchNic(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>

              {searchResults.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Search Matches ({searchResults.length})
                  </Typography>
                  <Stack spacing={1.5}>
                    {searchResults.map((p) => (
                      <Card key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {p.firstName} {p.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              NIC: {p.nicNumber || 'N/A'} | Mobile: {p.mobileNumber}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setVerifiedPatient(p)
                              setPrimaryPatientRecord(p)
                            }}
                          >
                            Select
                          </Button>
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              <Button
                color="secondary"
                variant="text"
                onClick={() => onRegisterRedirect(patientMobile)}
                startIcon={<AddIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Register New Patient Account
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(143, 0, 255, 0.04)',
                  borderColor: 'primary.main'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {verifiedPatient.firstName} {verifiedPatient.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Mobile: {verifiedPatient.mobileNumber} | NIC: {verifiedPatient.nicNumber || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setVerifiedPatient(null)
                      setPrimaryPatientRecord(null)
                    }}
                  >
                    Change
                  </Button>
                </Box>
              </Card>

              {primaryPatientRecord && (
                <FamilyPatientSelector
                  primaryPatient={primaryPatientRecord}
                  children={verifiedChildren}
                  selectedPatientId={verifiedPatient.id}
                  onSelectPatient={(p) => setVerifiedPatient(p)}
                  onOpenAddChild={() => setOpenAddChildModal(true)}
                />
              )}
            </Stack>
          )}
        </Paper>
      )}

      {/* Step 1: Session Slot & Priority */}
      {activeStep === 1 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Session & Priority Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select the session time slot and ticket priority level.
          </Typography>

          <Stack spacing={3}>
            {daySessions.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Session Slot</InputLabel>
                <Select
                  value={targetSessionId}
                  label="Session Slot"
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  startAdornment={<AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {daySessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.label} ({s.timeRange})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(Number(e.target.value))}
                startAdornment={<StarRateIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                <MenuItem value={0}>Normal Priority</MenuItem>
                <MenuItem value={1}>High Priority</MenuItem>
                <MenuItem value={2}>Emergency Priority</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      )}

      {/* Step 2: Review & Summary */}
      {activeStep === 2 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4 }, pb: 6, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Confirm Queue Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Verify details before issuing the patient's queue token.
          </Typography>

          <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Practice Centre
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {currentCentre?.clinicName || currentCentre?.placeName}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Visit Date
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {selectedDate ? formatDisplayDateLong(selectedDate) : 'Today'}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                  {verifiedPatient?.firstName} {verifiedPatient?.lastName}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Priority
                </Typography>
                <Chip
                  label={priority === 2 ? 'Emergency' : priority === 1 ? 'High' : 'Normal'}
                  size="small"
                  color={priority === 2 ? 'error' : priority === 1 ? 'warning' : 'primary'}
                />
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
          onClick={activeStep === 0 ? onClose : handlePrevStep}
          variant="outlined"
          color="inherit"
          startIcon={activeStep > 0 ? <ArrowBackIcon /> : undefined}
          disabled={submitting}
          sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 700 }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {activeStep < 2 ? (
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
            onClick={handleFinalSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              borderRadius: 2.5,
              px: 5,
              py: 1.2,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)'
            }}
          >
            {submitting ? 'Adding...' : 'Confirm & Add to Queue'}
          </Button>
        )}
      </Paper>

      {/* Modals & OTP Dialog */}
      {primaryPatientRecord && (
        <AddChildModal
          open={openAddChildModal}
          parentId={primaryPatientRecord.id}
          onClose={() => setOpenAddChildModal(false)}
          onChildAdded={(newChild) => {
            setVerifiedChildren((prev) => [...prev, newChild])
            setVerifiedPatient(newChild)
          }}
        />
      )}

      <OtpVerificationDialog
        open={openOtpDialog}
        onClose={() => setOpenOtpDialog(false)}
        maskedMobile={maskedMobile}
        sessionId={otpSessionId}
        onVerified={handleOtpVerified}
        onVerifyOtp={verifyPatientOtp}
        onResendOtp={resendPatientOtp}
      />
    </Box>
  )
}
