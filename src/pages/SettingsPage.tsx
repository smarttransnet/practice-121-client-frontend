import { Alert, Box, Button, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'
import { fetchExampleItems, type ExampleItem } from '../api/exampleApi'
import { PracticeCentresTab } from '../features/practice-centres/PracticeCentresTab'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ExampleItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="General" />
          <Tab label="Practice Centres" />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Paper className="glass-card" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Example REST API call using a shared Axios client. Replace the endpoint and types with your real API.
          </Typography>

          <Button variant="contained" disabled={loading} onClick={handleLoadClick} sx={{ alignSelf: 'flex-start' }}>
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
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <PracticeCentresTab />
      </CustomTabPanel>

    </Stack>
  )
}

