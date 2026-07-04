import { Box, Stack, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const tripsCompleted = [120, 98, 140, 132, 165, 110, 90]
const tripsPlanned = [130, 110, 150, 145, 180, 125, 105]
const onTimePct = [92, 95, 94, 96, 97, 90, 89]

export function TripsChartWidget() {
  const theme = useTheme()

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Box sx={{ height: 190 }}>
        <BarChart
          xAxis={[{ scaleType: 'band', data: days }]}
          series={[
            {
              label: 'Completed',
              data: tripsCompleted,
              color: theme.palette.primary.main,
            },
            {
              label: 'Planned',
              data: tripsPlanned,
              color: theme.palette.secondary.light,
            },
          ]}
          height={190}
          margin={{ left: 40, right: 10, top: 10, bottom: 30 }}
        />
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 2, minHeight: 160 }}>
          <LineChart
            xAxis={[{ data: days }]}
            series={[
              {
                label: 'On-time %',
                data: onTimePct,
                color: theme.palette.success.main,
              },
            ]}
            height={180}
            margin={{ left: 40, right: 10, top: 10, bottom: 30 }}
            grid={{ horizontal: true }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 160,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.primary.main, 0.06),
          }}
        >
          <PieChart
            series={[
              {
                innerRadius: 35,
                outerRadius: 60,
                paddingAngle: 2,
                data: [
                  { id: 0, value: 68, label: 'On time', color: theme.palette.success.main },
                  { id: 1, value: 22, label: 'Late', color: theme.palette.warning.main },
                  { id: 2, value: 10, label: 'Cancelled', color: theme.palette.error.main },
                ],
              },
            ]}
            height={180}
            slotProps={{
              legend: {
                position: { vertical: 'middle', horizontal: 'end' },
              },
            }}
          />
        </Box>
      </Stack>
    </Stack>
  )
}

