import { useState, useRef } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack
} from '@mui/material'
import type { PracticeCentre } from './types'
import { LocationPicker } from './LocationPicker'
import { SessionGroupList } from './SessionGroupList'
import { NurseSubform } from './NurseSubform'
import { FormBuilderStepper } from './FormBuilderStepper'
import { FormReviewSummary } from './FormReviewSummary'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { httpClient } from '../../api/httpClient'

interface Props {
  initialData?: PracticeCentre
  otherCentres?: PracticeCentre[]
  onSave: (data: PracticeCentre) => void
  onCancel: () => void
}

export function PracticeCentreForm({ initialData, otherCentres = [], onSave, onCancel }: Props) {
  const errorRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false])

  const [data, setData] = useState<PracticeCentre>(
    initialData || {
      placeName: '',
      mohArea: '',
      district: '',
      clinicName: '',
      maxPatients: undefined,
      sessionGroups: [],
      nurses: []
    }
  )

  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Validate Step 0: Location
  const validateStep0 = (): boolean => {
    if (!data.district || !data.mohArea || !data.placeName) {
      showError('Please fill in all required fields (District, MOH Area, Hospital/Place).')
      return false
    }
    setError('')
    return true
  }

  // Validate Step 1: Sessions
  const validateStep1 = (): boolean => {
    for (const sg of data.sessionGroups) {
      for (const day of sg.daysOfWeek) {
        for (const tb of sg.timeBlocks) {
          if (!tb.startTime || !tb.endTime) {
            showError('Please ensure all time blocks have both a start time and an end time.')
            return false
          }
          if (tb.startTime >= tb.endTime) {
            showError(`Invalid time block on ${day}: Start time (${tb.startTime}) must be before end time (${tb.endTime}).`)
            return false
          }
        }
      }
    }

    // Overlap validation
    const allSessions: { day: string; start: string; end: string; centreName: string }[] = []
    for (const centre of otherCentres) {
      for (const sg of centre.sessionGroups) {
        for (const day of sg.daysOfWeek) {
          for (const tb of sg.timeBlocks) {
            if (tb.startTime && tb.endTime) {
              allSessions.push({ day, start: tb.startTime, end: tb.endTime, centreName: centre.clinicName || centre.placeName })
            }
          }
        }
      }
    }

    const currentSessions: { day: string; start: string; end: string; centreName: string }[] = []
    for (const sg of data.sessionGroups) {
      for (const day of sg.daysOfWeek) {
        for (const tb of sg.timeBlocks) {
          currentSessions.push({ day, start: tb.startTime, end: tb.endTime, centreName: 'this form' })
        }
      }
    }

    const combined = [...allSessions, ...currentSessions]
    for (let i = 0; i < combined.length; i++) {
      for (let j = i + 1; j < combined.length; j++) {
        const s1 = combined[i]
        const s2 = combined[j]
        if (s1.day === s2.day && s1.start < s2.end && s1.end > s2.start) {
          if (s1.centreName === 'this form' && s2.centreName === 'this form') {
            showError(`Overlapping sessions detected on ${s1.day} within this form (${s1.start}-${s1.end} vs ${s2.start}-${s2.end}).`)
          } else {
            const other = s1.centreName === 'this form' ? s2.centreName : s1.centreName
            showError(`Overlapping session detected on ${s1.day}: overlaps with ${other} (${s2.start}-${s2.end}).`)
          }
          return false
        }
      }
    }

    setError('')
    return true
  }

  // Validate Step 2: Nurses
  const validateStep2 = (): boolean => {
    for (const nurse of data.nurses) {
      if (!nurse.name.trim()) {
        showError('Nurse name cannot be empty.')
        return false
      }
    }
    setError('')
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
    setError('')
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStepClick = (stepIndex: number) => {
    setError('')
    setActiveStep(stepIndex)
  }

  const handleSave = async () => {
    if (!validateStep0() || !validateStep1() || !validateStep2()) {
      return
    }

    const finalClinicName = data.clinicName.trim() || data.placeName
    setIsSaving(true)
    let finalPlaceId = data.placeId

    if (!finalPlaceId && data.isNewPlace && data.mohAreaId) {
      try {
        const postRes = await httpClient.post<string>('/api/locations/places', {
          mohAreaId: data.mohAreaId,
          name: data.placeName,
        })
        finalPlaceId = postRes.data
        setData((prev) => ({ ...prev, placeId: finalPlaceId, isNewPlace: false }))
      } catch (err) {
        console.error(err)
        showError('Failed to create the new place on the server.')
        setIsSaving(false)
        return
      }
    }

    if (!finalPlaceId) {
      showError('Please fill in all required fields (District, MOH Area, Place). Ensure a valid place is selected.')
      setIsSaving(false)
      return
    }

    setError('')
    onSave({ ...data, clinicName: finalClinicName, placeId: finalPlaceId })
    setIsSaving(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', pb: 10 }}>
      <div ref={errorRef} style={{ scrollMarginTop: '80px' }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      </div>

      {/* Dynamic Form Stepper */}
      <FormBuilderStepper
        activeStep={activeStep}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* Step 0: Location & Clinic Info */}
      {activeStep === 0 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4.5 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Location & Basic Information
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Specify the geographical location and clinic override name for this practice centre.
          </Typography>

          <LocationPicker
            district={data.district}
            mohArea={data.mohArea}
            placeName={data.placeName}
            placeId={data.placeId}
            onChange={(field, val) => setData((prev) => ({ ...prev, [field]: val }))}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3.5 }}>
            <TextField
              label="Clinic Name (Optional/Override)"
              value={data.clinicName}
              onChange={(e) => setData({ ...data, clinicName: e.target.value })}
              helperText="If left blank, Place name will be used"
              fullWidth
            />
            <TextField
              label="Max Patients per Session"
              type="number"
              value={data.maxPatients || ''}
              onChange={(e) => setData({ ...data, maxPatients: parseInt(e.target.value) || undefined })}
              fullWidth
            />
          </Box>
        </Paper>
      )}

      {/* Step 1: Sessions */}
      {activeStep === 1 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4.5 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Session Schedules & Time Blocks
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Configure operating days and consultation time blocks for this centre.
          </Typography>
          <SessionGroupList
            groups={data.sessionGroups}
            onChange={(groups) => setData({ ...data, sessionGroups: groups })}
          />
        </Paper>
      )}

      {/* Step 2: Nurses */}
      {activeStep === 2 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4.5 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Nurses & Support Staff
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Assign clinic nurses or assistants responsible for managing queues at this location.
          </Typography>
          <NurseSubform
            nurses={data.nurses}
            onChange={(nurses) => setData({ ...data, nurses })}
          />
        </Paper>
      )}

      {/* Step 3: Review & Summary */}
      {activeStep === 3 && (
        <Paper className="glass-card" sx={{ p: { xs: 2.5, md: 4.5 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
            Review Practice Centre Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Verify all details before saving to your profile.
          </Typography>
          <FormReviewSummary data={data} onJumpToStep={setActiveStep} />
        </Paper>
      )}

      {/* Responsive Sticky Action Bar */}
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: { xs: 16, sm: 280 },
          right: 16,
          zIndex: 1000,
          p: 2,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(143, 0, 255, 0.2)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button
          onClick={activeStep === 0 ? onCancel : handlePrevStep}
          variant="outlined"
          color="inherit"
          startIcon={activeStep > 0 ? <ArrowBackIcon /> : undefined}
          disabled={isSaving}
          sx={{ borderRadius: 2, px: { xs: 2, sm: 3 } }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Stack direction="row" spacing={2}>
          {activeStep < 3 ? (
            <Button
              onClick={handleNextStep}
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)',
                boxShadow: '0 4px 16px rgba(143, 0, 255, 0.3)'
              }}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              startIcon={isSaving ? undefined : <SaveIcon />}
              disabled={isSaving}
              sx={{
                borderRadius: 2,
                px: { xs: 3, sm: 5 },
                background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)',
                boxShadow: '0 4px 16px rgba(143, 0, 255, 0.3)'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Practice Centre'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
