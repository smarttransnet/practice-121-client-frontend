import {
  Box,
  Button,
  Card,
  IconButton,
  TextField,
  Typography,
  Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface Props {
  daysOff: string[]
  onChange: (days: string[]) => void
}

export function DaysOffList({ daysOff, onChange }: Props) {
  const addDayOff = () => {
    onChange([...daysOff, new Date().toISOString().split('T')[0]])
  }

  const removeDayOff = (index: number) => {
    const next = [...daysOff]
    next.splice(index, 1)
    onChange(next)
  }

  const updateDayOff = (index: number, val: string) => {
    const next = [...daysOff]
    next[index] = val
    onChange(next)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
        Exception Days Off
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Add specific dates where this centre will be closed, overriding normal recurring schedules.
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {daysOff.map((day, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(143, 0, 255, 0.1)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 10, sm: 11 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date Off"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={day}
                  onChange={(e) => updateDayOff(idx, e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 2, sm: 1 }} display="flex" justifyContent="center">
                <IconButton color="error" size="small" onClick={() => removeDayOff(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={addDayOff}
          sx={{ alignSelf: 'flex-start', mt: 1, borderRadius: 2 }}
        >
          Add Day Off
        </Button>
      </Box>
    </Box>
  )
}
