import { Box, Button, Card, CardContent, Typography, Grid, IconButton, Chip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { PracticeCentre } from './types'

interface Props {
  centres: PracticeCentre[]
  onEdit: (centre: PracticeCentre) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export function PracticeCentreList({ centres, onEdit, onDelete, onCreateNew }: Props) {
  if (centres.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          You haven't added any practice centres yet.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateNew}>
          Add Practice Centre
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateNew}>
          Add Practice Centre
        </Button>
      </Box>
      <Grid container spacing={3}>
        {centres.map(centre => (
          <Grid size={{ xs: 12, md: 6 }} key={centre.id}>
            <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6">{centre.clinicName || centre.placeName}</Typography>
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => onEdit(centre)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => centre.id && onDelete(centre.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {centre.placeName} • {centre.mohArea} • {centre.district}
                </Typography>
                
                {centre.sessionGroups.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Sessions:</Typography>
                    {centre.sessionGroups.map((sg, i) => (
                      <Box key={i} mt={1} display="flex" gap={1} flexWrap="wrap">
                        {sg.daysOfWeek.map(d => <Chip size="small" key={d} label={d} />)}
                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                          {sg.timeBlocks.length} block(s)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
