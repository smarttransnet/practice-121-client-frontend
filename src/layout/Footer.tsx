import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        px: 2,
        py: 1.5,
        borderTop: '1px solid',
        borderColor: (t) => alpha(t.palette.primary.main, 0.18),
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Fleet & Inventory
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v0.1
        </Typography>
      </Box>
    </Box>
  )
}

