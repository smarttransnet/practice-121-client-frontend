import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { httpClient } from '../api/httpClient'

interface DoctorRow {
  id: string
  fullName: string | null
  slmcRegNumber: string | null
  specialty: string | null
  completionStatus: number
  accountEmail: string | null
}

export function VerifyProcessPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const res = await httpClient.get('/api/verify-process/doctors')
        if (res.data.success) {
          setDoctors(res.data.data)
        } else {
          setError('Failed to fetch doctors.')
        }
      } catch (err: any) {
        setError(err.message ?? 'An error occurred.')
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'accountEmail', headerName: 'Email', flex: 1, minWidth: 150 },
    { field: 'slmcRegNumber', headerName: 'SLMC No.', flex: 1, minWidth: 120 },
    { field: 'specialty', headerName: 'Specialty', flex: 1, minWidth: 150 },
    { 
      field: 'completionStatus', 
      headerName: 'Status', 
      flex: 1, 
      minWidth: 120,
      valueGetter: (_params, row) => {
        const status = row.completionStatus;
        if (status === 0) return 'None'
        if (status === 1) return 'Minimal'
        if (status === 2) return 'Partial'
        if (status === 3) return 'Complete'
        return 'Unknown'
      }
    },
  ]

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} mb={3} color="primary.main">
        Verify Process (Temporary)
      </Typography>

      <Card
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: '24px',
          border: '1px solid rgba(143, 0, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.03)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={doctors}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgba(143, 0, 255, 0.04)',
                    borderBottom: '2px solid rgba(143, 0, 255, 0.1)',
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
