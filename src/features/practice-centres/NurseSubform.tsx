import {
  Box,
  Button,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
  Paper
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { Nurse } from './types'

import { isValidLkMobile } from '../../utils/lkPhoneValidation'

interface Props {
  nurses: Nurse[]
  onChange: (nurses: Nurse[]) => void
}

export function NurseSubform({ nurses, onChange }: Props) {
  const addNurse = () => {
    onChange([
      ...nurses,
      { id: crypto.randomUUID(), name: '', phoneNumber: '', isActive: true }
    ])
  }

  const updateNurse = (index: number, updated: Nurse) => {
    const next = [...nurses]
    next[index] = updated
    onChange(next)
  }

  const removeNurse = (index: number) => {
    const next = [...nurses]
    next.splice(index, 1)
    onChange(next)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {nurses.map((nurse, index) => (
        <Paper key={nurse.id} variant="outlined" sx={{ p: 2, background: 'rgba(255,255,255,0.2)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Nurse Name"
                value={nurse.name}
                onChange={e => updateNurse(index, { ...nurse, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {(() => {
                const isPhoneInvalid = !!nurse.phoneNumber && !isValidLkMobile(nurse.phoneNumber)
                return (
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={nurse.phoneNumber}
                    onChange={e => updateNurse(index, { ...nurse, phoneNumber: e.target.value })}
                    error={isPhoneInvalid}
                    helperText={isPhoneInvalid ? 'Invalid LK mobile (e.g. 077 123 4567)' : ''}
                  />
                )
              })()}
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Box display="flex" alignItems="center">
                <Switch
                  checked={nurse.isActive}
                  onChange={e => updateNurse(index, { ...nurse, isActive: e.target.checked })}
                />
                <Typography variant="body2">{nurse.isActive ? 'Active' : 'Inactive'}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }} display="flex" justifyContent="flex-end">
              <IconButton color="error" onClick={() => removeNurse(index)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addNurse}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Nurse
      </Button>
    </Box>
  )
}
