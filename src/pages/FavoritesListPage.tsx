import { Box, Typography, Card, CardContent } from '@mui/material'

export function FavoritesListPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Favorites List
      </Typography>
      
      <Card 
        className="glass-card"
        sx={{ 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          background: 'rgba(255, 255, 255, 0.45)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.03)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            You haven't added any favorites yet.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
