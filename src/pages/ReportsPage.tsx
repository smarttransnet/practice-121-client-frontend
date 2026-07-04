import { Paper, Stack, Typography } from '@mui/material'

export function ReportsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        Reports
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Placeholder page.
        </Typography>
      </Paper>
    </Stack>
  )
}

