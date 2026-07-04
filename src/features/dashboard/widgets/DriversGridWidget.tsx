import { Chip } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { alpha } from '@mui/material/styles'

type DriverRow = {
  id: number
  name: string
  status: 'Active' | 'On Break' | 'Offline'
  tripsToday: number
  lastSeen: string
}

const driverRows: DriverRow[] = [
  { id: 1, name: 'A. Khan', status: 'Active', tripsToday: 6, lastSeen: '2m ago' },
  { id: 2, name: 'M. Lee', status: 'On Break', tripsToday: 4, lastSeen: '18m ago' },
  { id: 3, name: 'S. Patel', status: 'Active', tripsToday: 7, lastSeen: '5m ago' },
  { id: 4, name: 'J. Garcia', status: 'Offline', tripsToday: 0, lastSeen: '3h ago' },
  { id: 5, name: 'R. Singh', status: 'Active', tripsToday: 5, lastSeen: '1m ago' },
  { id: 6, name: 'L. Chen', status: 'Active', tripsToday: 3, lastSeen: '9m ago' },
  { id: 7, name: 'D. Silva', status: 'On Break', tripsToday: 2, lastSeen: '27m ago' },
]

const driverColumns: GridColDef<DriverRow>[] = [
  { field: 'name', headerName: 'Driver', flex: 1, minWidth: 160 },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const color = params.value === 'Active' ? 'success' : params.value === 'On Break' ? 'warning' : 'default'
      return <Chip size="small" label={params.value} color={color} />
    },
    sortable: false,
  },
  { field: 'tripsToday', headerName: 'Trips', width: 90, type: 'number' },
  { field: 'lastSeen', headerName: 'Last seen', width: 110, sortable: false },
]

export function DriversGridWidget() {
  return (
    <DataGrid
      rows={driverRows}
      columns={driverColumns}
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 25]}
      initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
      density="compact"
      sx={{
        border: 0,
        height: '100%',
        bgcolor: 'transparent',
        '& .MuiDataGrid-columnHeaders': { bgcolor: (t) => alpha(t.palette.primary.main, 0.015) },
        '& .MuiDataGrid-main': { bgcolor: 'transparent' },
        '& .MuiDataGrid-virtualScroller': { bgcolor: 'transparent' },
      }}
    />
  )
}

