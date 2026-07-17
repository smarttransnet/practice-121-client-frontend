import { Box } from '@mui/material'
import { PatientForm } from '../features/patients/PatientForm'

export function RegisterPatientPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgb(18, 28, 54) 0%, rgb(9, 14, 28) 100%)',
        p: 2,
      }}
    >
      <PatientForm entryPoint="direct" />
    </Box>
  )
}
