import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

const kpis = [
  { label: 'Active vehicles', value: '42', delta: '+3 today' },
  { label: 'Open incidents', value: '7', delta: '-1 since yesterday' },
  { label: 'On-time rate', value: '96.4%', delta: '+0.8% WoW' },
  { label: 'Avg. response', value: '4m 12s', delta: '-18s WoW' },
]

export function KpiWidget() {
  return (
    <Box sx={{ height: '100%' }}>
      <Stack spacing={1.25}>
        {kpis.map((kpi) => (
          <Box
            key={kpi.label}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.015),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.08),
            }}
          >
            <Typography variant="overline" color="text.secondary">
              {kpi.label}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h5" fontWeight={900}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpi.delta}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

