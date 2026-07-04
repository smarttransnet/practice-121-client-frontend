import { Paper, Stack, Typography } from '@mui/material'
import { TodosForm } from '../features/todos/TodosForm'

export function TodosPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>
        Todos
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <TodosForm />
      </Paper>
    </Stack>
  )
}

