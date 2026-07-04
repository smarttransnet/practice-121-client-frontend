import { Alert, Box, Button, FormControlLabel, MenuItem, Switch, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { createTodo } from './todosApi'
import { useAuth } from '../auth/useAuth'

export function TodosForm() {
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<string>('')
  const [labelsText, setLabelsText] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [priority, setPriority] = useState<number>(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user } = useAuth()
  const userId = user?.accountId

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const labels = labelsText
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      const dueDateIso =
        dueDate && !Number.isNaN(Date.parse(dueDate))
          ? new Date(dueDate).toISOString()
          : null

      if (!userId) {
        throw new Error('You must be logged in to create a todo')
      }

      await createTodo(userId, {
        description,
        due_date: dueDateIso,
        labels,
        is_completed: isCompleted,
        priority,
      })

      setSuccess('Todo created successfully.')
      setDescription('')
      setDueDate('')
      setLabelsText('')
      setIsCompleted(false)
      setPriority(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create todo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 480,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        Add todo
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Due date"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        label="Labels (comma-separated)"
        value={labelsText}
        onChange={(e) => setLabelsText(e.target.value)}
        placeholder="urgent, backend, v1"
        fullWidth
      />

      <TextField
        select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value))}
        fullWidth
      >
        <MenuItem value={0}>Low</MenuItem>
        <MenuItem value={1}>Medium</MenuItem>
        <MenuItem value={2}>High</MenuItem>
      </TextField>

      <FormControlLabel
        control={<Switch checked={isCompleted} onChange={(_, v) => setIsCompleted(v)} />}
        label="Completed"
      />

      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save todo'}
      </Button>
    </Box>
  )
}

