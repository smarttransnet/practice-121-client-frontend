import { Alert, Button, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { fetchExampleItems, type ExampleItem } from '../api/exampleApi'

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ExampleItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoadClick = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchExampleItems()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
      setItems(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700}>
        Settings
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Example REST API call using a shared Axios client. Replace the endpoint and types with your real API.
        </Typography>

        <Button variant="contained" disabled={loading} onClick={handleLoadClick}>
          {loading ? 'Loading…' : 'Load example items'}
        </Button>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : items && items.length > 0 ? (
          <Stack component="ul" sx={{ m: 0, pl: 3 }}>
            {items.map((item) => (
              <Typography component="li" key={item.id} variant="body2">
                {item.title}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  )
}

