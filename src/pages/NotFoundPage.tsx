import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        Page not found
      </Typography>
      <Typography color="text.secondary">The page you requested doesn’t exist.</Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Go to Dashboard
      </Button>
    </Stack>
  )
}

