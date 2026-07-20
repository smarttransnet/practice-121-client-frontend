import { useState, useRef } from 'react'
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material'
import type { PracticeCentre } from './types'
import { LocationPicker } from './LocationPicker'
import { SessionGroupList } from './SessionGroupList'
import { NurseSubform } from './NurseSubform'
import SaveIcon from '@mui/icons-material/Save'
import { httpClient } from '../../api/httpClient'

interface Props {
  initialData?: PracticeCentre
  otherCentres?: PracticeCentre[]
  onSave: (data: PracticeCentre) => void
  onCancel: () => void
}

export function PracticeCentreForm({ initialData, otherCentres = [], onSave, onCancel }: Props) {
  const errorRef = useRef<HTMLDivElement>(null)
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

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const finalClinicName = data.clinicName.trim() || data.placeName;
    if (!data.district || !data.mohArea || !data.placeName) {
      showError('Please fill in all required fields (District, MOH Area, Place).')
      return
    }
    
    setIsSaving(true);
    let finalPlaceId = data.placeId;

    if (!finalPlaceId && data.isNewPlace && data.mohAreaId) {
       try {
          const postRes = await httpClient.post<string>('/api/locations/places', { mohAreaId: data.mohAreaId, name: data.placeName });
          finalPlaceId = postRes.data;
          setData(prev => ({ ...prev, placeId: finalPlaceId, isNewPlace: false }));
       } catch (err) {
          console.error(err);
          showError('Failed to create the new place on the server.');
          setIsSaving(false);
          return;
       }
    }

    if (!finalPlaceId) {
      showError('Please fill in all required fields (District, MOH Area, Place). Ensure a valid place is selected.');
      setIsSaving(false);
      return
    }
    
    // Validate overlapping sessions
    const allSessions: { day: string; start: string; end: string; centreName: string }[] = [];

    // Gather sessions from other centres
    for (const centre of otherCentres) {
      for (const sg of centre.sessionGroups) {
        for (const day of sg.daysOfWeek) {
          for (const tb of sg.timeBlocks) {
            if (tb.startTime && tb.endTime) {
              allSessions.push({ day, start: tb.startTime, end: tb.endTime, centreName: centre.clinicName || centre.placeName });
            }
          }
        }
      }
    }

    // Gather sessions from current form
    const currentSessions: { day: string; start: string; end: string; centreName: string }[] = [];
    for (const sg of data.sessionGroups) {
      for (const day of sg.daysOfWeek) {
        for (const tb of sg.timeBlocks) {
          if (!tb.startTime || !tb.endTime) {
            showError('Please ensure all time blocks have both a start time and an end time.');
            return;
          }
          if (tb.startTime >= tb.endTime) {
            showError(`Invalid time block on ${day}: Start time (${tb.startTime}) must be before end time (${tb.endTime}).`);
            return;
          }
          currentSessions.push({ day, start: tb.startTime, end: tb.endTime, centreName: 'this form' });
        }
      }
    }

    // Check for overlaps within current form and against other centres
    const combinedSessions = [...allSessions, ...currentSessions];
    for (let i = 0; i < combinedSessions.length; i++) {
      for (let j = i + 1; j < combinedSessions.length; j++) {
        const s1 = combinedSessions[i];
        const s2 = combinedSessions[j];
        if (s1.day === s2.day) {
          // Check time overlap: s1 starts before s2 ends AND s1 ends after s2 starts
          if (s1.start < s2.end && s1.end > s2.start) {
            if (s1.centreName === 'this form' && s2.centreName === 'this form') {
              showError(`Overlapping sessions detected on ${s1.day} within this form (${s1.start}-${s1.end} vs ${s2.start}-${s2.end}).`);
            } else {
              const other = s1.centreName === 'this form' ? s2.centreName : s1.centreName;
              showError(`Overlapping session detected on ${s1.day}: overlaps with ${other} (${s2.start}-${s2.end}).`);
            }
            setIsSaving(false);
            return;
          }
        }
      }
    }

    setError('')
    onSave({ ...data, clinicName: finalClinicName, placeId: finalPlaceId })
    setIsSaving(false);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div ref={errorRef} style={{ scrollMarginTop: '80px' }}>
        {error && <Alert severity="error">{error}</Alert>}
      </div>
      
      <Paper className="glass-card" sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Basic Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Clinic Name (Optional/Override)"
            value={data.clinicName}
            onChange={e => setData({ ...data, clinicName: e.target.value })}
            helperText="If left blank, Place name will be used"
            fullWidth
          />
          <TextField
            label="Max Patients per Session"
            type="number"
            value={data.maxPatients || ''}
            onChange={e => setData({ ...data, maxPatients: parseInt(e.target.value) || undefined })}
            fullWidth
          />
        </Box>
      </Paper>

      <Paper className="glass-card" sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Location</Typography>
        <LocationPicker
          district={data.district}
          mohArea={data.mohArea}
          placeName={data.placeName}
          placeId={data.placeId}
          onChange={(field, val) => setData(prev => ({ ...prev, [field]: val }))}
        />
      </Paper>

      <Paper className="glass-card" sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Sessions</Typography>
        <SessionGroupList
          groups={data.sessionGroups}
          onChange={groups => setData({ ...data, sessionGroups: groups })}
        />
      </Paper>

      <Paper className="glass-card" sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Nurses / Assistants</Typography>
        <NurseSubform
          nurses={data.nurses}
          onChange={nurses => setData({ ...data, nurses })}
        />
      </Paper>

      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button onClick={onCancel} variant="text" disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Practice Centre'}
        </Button>
      </Box>
    </Box>
  )
}
