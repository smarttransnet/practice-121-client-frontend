import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>
      {groups.map((group, gIdx) => (
        <Card key={group.id} className="glass-card" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              Session Group {gIdx + 1}
            </Typography>
            <IconButton color="error" size="small" onClick={() => removeGroup(gIdx)}>
              <DeleteIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Select Operating Days
          </Typography>
          <Grid container spacing={0.5} sx={{ mb: 3 }}>
            {DAYS.map((day) => (
              <Grid key={day} size={{ xs: 4, sm: 3, md: 1.7 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={group.daysOfWeek.includes(day)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...group.daysOfWeek, day]
                          : group.daysOfWeek.filter((d) => d !== day)
                        updateGroup(gIdx, { ...group, daysOfWeek: newDays })
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={600}>{day}</Typography>}
                  sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Time Blocks
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {group.timeBlocks.map((tb, tbIdx) => (
              <Box
                key={tb.id}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(143, 0, 255, 0.1)'
                }}
              >
                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 10, sm: 11, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Label (e.g. Morning)"
                      value={tb.label}
                      onChange={(e) => {
                        const blocks = [...group.timeBlocks]
                        blocks[tbIdx] = { ...tb, label: e.target.value }
                        updateGroup(gIdx, { ...group, timeBlocks: blocks })
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 2, sm: 1 }} display={{ xs: 'flex', md: 'none' }} justifyContent="flex-end">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        const blocks = [...group.timeBlocks]
                        blocks.splice(tbIdx, 1)
                        updateGroup(gIdx, { ...group, timeBlocks: blocks })
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 6, md: 3.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Start Time"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={tb.startTime}
                      onChange={(e) => {
                        const blocks = [...group.timeBlocks]
                        blocks[tbIdx] = { ...tb, startTime: e.target.value }
                        updateGroup(gIdx, { ...group, timeBlocks: blocks })
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 6, md: 3.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="End Time"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={tb.endTime}
                      onChange={(e) => {
                        const blocks = [...group.timeBlocks]
                        blocks[tbIdx] = { ...tb, endTime: e.target.value }
                        updateGroup(gIdx, { ...group, timeBlocks: blocks })
                      }}
                    />
                  </Grid>

                  <Grid size={{ md: 1 }} display={{ xs: 'none', md: 'flex' }} justifyContent="center">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        const blocks = [...group.timeBlocks]
                        blocks.splice(tbIdx, 1)
                        updateGroup(gIdx, { ...group, timeBlocks: blocks })
                      }}
                    >
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
              onClick={() => {
                const blocks = [
                  ...group.timeBlocks,
                  { id: crypto.randomUUID(), label: '', startTime: '', endTime: '' }
                ]
                updateGroup(gIdx, { ...group, timeBlocks: blocks })
              }}
              sx={{ alignSelf: 'flex-start', mt: 1, borderRadius: 2 }}
            >
              Add Time Block
            </Button>
          </Box>
        </Card>
      ))}

      <Button
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={addGroup}
        sx={{ alignSelf: 'flex-start', borderRadius: 2.5, px: 3, py: 1 }}
      >
        Add Session Group
      </Button>
    </Box>
  )
}
