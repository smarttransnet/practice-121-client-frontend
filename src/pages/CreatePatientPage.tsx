import { Box, Typography } from '@mui/material'
import { PatientForm } from '../features/patients/PatientForm'

export function CreatePatientPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <PatientForm entryPoint="doctor" />
    </Box>
  )
}
