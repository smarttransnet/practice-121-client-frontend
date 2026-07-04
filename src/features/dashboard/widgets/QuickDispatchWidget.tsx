import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

type Priority = 'Low' | 'Normal' | 'High'

export function QuickDispatchWidget() {
  const [jobTitle, setJobTitle] = useState('')
  const [pickup, setPickup] = useState('')
  const [priority, setPriority] = useState<Priority>('Normal')

  const canSubmit = useMemo(() => jobTitle.trim().length > 0 && pickup.trim().length > 0, [jobTitle, pickup])

  return (
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <TextField
        label="Job title"
        placeholder="e.g., Airport pickup"
        fullWidth
        size="small"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <TextField
        label="Pickup address"
        placeholder="123 Main St"
        fullWidth
        size="small"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />

      <FormControl fullWidth size="small">
        <InputLabel id="priority-label">Priority</InputLabel>
        <Select
          labelId="priority-label"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto' }}>
        <Button
          variant="outlined"
          onClick={() => {
            setJobTitle('')
            setPickup('')
            setPriority('Normal')
          }}
        >
          Reset
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={() => {}}>
          Create
        </Button>
      </Stack>
    </Stack>
  )
}

