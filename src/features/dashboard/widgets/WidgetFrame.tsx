import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'

type WidgetFrameProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function WidgetFrame({ title, subtitle, children }: WidgetFrameProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.01),
        borderColor: (t) => alpha(t.palette.primary.main, 0.12),
        boxShadow: 2,
      }}
    >
      <Box
        className="WidgetHeader"
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: (t) => alpha(t.palette.primary.main, 0.12),
          bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
          backgroundImage: (t) =>
            `linear-gradient(90deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${alpha(
              t.palette.primary.main,
              0.02,
            )} 70%)`,
          borderLeft: (t) => `4px solid ${t.palette.primary.main}`,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DragIndicatorIcon fontSize="small" sx={{ opacity: 0.6 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <IconButton size="small" aria-label="Widget menu" disabled>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: 1.5, flex: 1, minHeight: 0 }}>{children}</Box>
    </Paper>
  )
}

