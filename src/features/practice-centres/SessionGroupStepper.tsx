import { useState } from 'react'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  TextField
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { SessionGroup } from './types'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface Props {
  initialGroup?: SessionGroup
  onSave: (group: SessionGroup) => void
  onCancel: () => void
}

export function SessionGroupStepper({ initialGroup, onSave, onCancel }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  
  const [group, setGroup] = useState<SessionGroup>(
    initialGroup || {
      id: crypto.randomUUID(),
      daysOfWeek: [],
      timeBlocks: [{ id: crypto.randomUUID(), label: 'Morning', startTime: '08:00', endTime: '12:00' }],
      daysOff: []
    }
  )

  const steps = ['Schedule Type', 'Time Blocks', 'Exception Days Off']

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSave(group)
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const renderStep1 = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Select Operating Days or Specific Date
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant={!group.specificDate ? 'contained' : 'outlined'}
          onClick={() => setGroup({ ...group, specificDate: undefined })}
          sx={{ borderRadius: 2 }}
        >
          Recurring Days
        </Button>
        <Button
          variant={group.specificDate ? 'contained' : 'outlined'}
          onClick={() => setGroup({ ...group, daysOfWeek: [], specificDate: new Date().toISOString().split('T')[0] })}
          sx={{ borderRadius: 2 }}
        >
          Specific Date
        </Button>
      </Box>

      {!group.specificDate ? (
        <Grid container spacing={1}>
          {DAYS.map((day) => (
            <Grid key={day} item xs={4} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={group.daysOfWeek.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...group.daysOfWeek, day]
                        : group.daysOfWeek.filter((d) => d !== day)
                      setGroup({ ...group, daysOfWeek: newDays })
                    }}
                  />
                }
                label={day}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TextField
          type="date"
          fullWidth
          label="Specific Date"
          InputLabelProps={{ shrink: true }}
          value={group.specificDate}
          onChange={(e) => setGroup({ ...group, specificDate: e.target.value })}
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  )

  const renderStep2 = () => (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {group.timeBlocks.map((tb, idx) => (
        <Box
          key={tb.id}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Label (e.g. Morning)"
                value={tb.label}
                onChange={(e) => {
                  const blocks = [...group.timeBlocks]
                  blocks[idx] = { ...tb, label: e.target.value }
                  setGroup({ ...group, timeBlocks: blocks })
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                value={tb.startTime}
                onChange={(e) => {
                  const blocks = [...group.timeBlocks]
                  blocks[idx] = { ...tb, startTime: e.target.value }
                  setGroup({ ...group, timeBlocks: blocks })
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="End Time"
                InputLabelProps={{ shrink: true }}
                value={tb.endTime}
                onChange={(e) => {
                  const blocks = [...group.timeBlocks]
                  blocks[idx] = { ...tb, endTime: e.target.value }
                  setGroup({ ...group, timeBlocks: blocks })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2} display="flex" justifyContent="flex-end">
              <IconButton
                color="error"
                onClick={() => {
                  const blocks = [...group.timeBlocks]
                  blocks.splice(idx, 1)
                  setGroup({ ...group, timeBlocks: blocks })
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        onClick={() => {
          setGroup({
            ...group,
            timeBlocks: [...group.timeBlocks, { id: crypto.randomUUID(), label: '', startTime: '', endTime: '' }]
          })
        }}
        sx={{ alignSelf: 'flex-start', borderRadius: 2 }}
      >
        Add Time Block
      </Button>
    </Box>
  )

  const renderStep3 = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Add any specific dates when this session group does NOT operate (e.g., public holidays).
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {group.daysOff?.map((dOff, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="date"
              size="small"
              value={dOff}
              onChange={(e) => {
                const nextOff = [...(group.daysOff || [])]
                nextOff[idx] = e.target.value
                setGroup({ ...group, daysOff: nextOff })
              }}
            />
            <IconButton
              color="error"
              size="small"
              onClick={() => {
                const nextOff = [...(group.daysOff || [])]
                nextOff.splice(idx, 1)
                setGroup({ ...group, daysOff: nextOff })
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>

      <Button
        startIcon={<AddIcon />}
        variant="text"
        onClick={() => {
          setGroup({ ...group, daysOff: [...(group.daysOff || []), ''] })
        }}
      >
        Add Day Off
      </Button>
    </Box>
  )

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '300px' }}>
        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={activeStep === 0 ? onCancel : handleBack} color="inherit">
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNext} variant="contained">
          {activeStep === steps.length - 1 ? 'Save Session Group' : 'Next'}
        </Button>
      </Box>
    </Box>
  )
}
