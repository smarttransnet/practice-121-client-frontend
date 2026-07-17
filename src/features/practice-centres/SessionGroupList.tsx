import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  TextField,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { SessionGroup } from './types'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface Props {
  groups: SessionGroup[]
  onChange: (groups: SessionGroup[]) => void
}

export function SessionGroupList({ groups, onChange }: Props) {
  const addGroup = () => {
    onChange([
      ...groups,
      {
        id: crypto.randomUUID(),
        daysOfWeek: [],
        timeBlocks: [{ id: crypto.randomUUID(), label: 'Morning', startTime: '08:00', endTime: '12:00' }]
      }
    ])
  }

  const removeGroup = (index: number) => {
    const next = [...groups]
    next.splice(index, 1)
    onChange(next)
  }

  const updateGroup = (index: number, updated: SessionGroup) => {
    const next = [...groups]
    next[index] = updated
    onChange(next)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {groups.map((group, gIdx) => (
        <Card key={group.id} className="glass-card" sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Session Group {gIdx + 1}</Typography>
            <IconButton color="error" onClick={() => removeGroup(gIdx)}>
              <DeleteIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" gutterBottom>
            Select Days
          </Typography>
          <FormGroup row sx={{ mb: 3 }}>
            {DAYS.map(day => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={group.daysOfWeek.includes(day)}
                    onChange={e => {
                      const newDays = e.target.checked
                        ? [...group.daysOfWeek, day]
                        : group.daysOfWeek.filter(d => d !== day)
                      updateGroup(gIdx, { ...group, daysOfWeek: newDays })
                    }}
                  />
                }
                label={day}
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" gutterBottom>
            Time Blocks
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {group.timeBlocks.map((tb, tbIdx) => (
              <Grid container spacing={2} alignItems="center" key={tb.id}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Label (e.g. Morning)"
                    value={tb.label}
                    onChange={e => {
                      const blocks = [...group.timeBlocks]
                      blocks[tbIdx] = { ...tb, label: e.target.value }
                      updateGroup(gIdx, { ...group, timeBlocks: blocks })
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={tb.startTime}
                    onChange={e => {
                      const blocks = [...group.timeBlocks]
                      blocks[tbIdx] = { ...tb, startTime: e.target.value }
                      updateGroup(gIdx, { ...group, timeBlocks: blocks })
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End Time"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={tb.endTime}
                    onChange={e => {
                      const blocks = [...group.timeBlocks]
                      blocks[tbIdx] = { ...tb, endTime: e.target.value }
                      updateGroup(gIdx, { ...group, timeBlocks: blocks })
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const blocks = [...group.timeBlocks]
                      blocks.splice(tbIdx, 1)
                      updateGroup(gIdx, { ...group, timeBlocks: blocks })
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const blocks = [
                  ...group.timeBlocks,
                  { id: crypto.randomUUID(), label: '', startTime: '', endTime: '' }
                ]
                updateGroup(gIdx, { ...group, timeBlocks: blocks })
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Time Block
            </Button>
          </Box>
        </Card>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addGroup} sx={{ alignSelf: 'flex-start' }}>
        Add Session Group
      </Button>
    </Box>
  )
}
