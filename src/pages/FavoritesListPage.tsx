import { useState, useEffect } from 'react'
import { 
  Box, Typography, Card, CardContent, Button, TextField,
  Tooltip, CircularProgress, Snackbar, Alert, Grid, Autocomplete
} from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

import { 
  fetchFavorites, 
  createFavorite,
  updateFavorite,
  deleteFavorite 
} from '../api/favorites'
import type { FavoriteMedicine } from '../api/favorites'

export function FavoritesListPage() {
  const [favorites, setFavorites] = useState<FavoriteMedicine[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null)
  const [verifiedName, setVerifiedName] = useState('')
  const [category, setCategory] = useState('')
  const [formErrors, setFormErrors] = useState({ verifiedName: false, category: false })

  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Load existing favorites
  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchFavorites()
      setFavorites(data)
    } catch (error) {
      console.error('Failed to load favorites', error)
      showSnackbar('Failed to load favorite medicines', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

  const validateForm = () => {
    const errors = {
      verifiedName: !verifiedName.trim(),
      category: !category.trim()
    }
    setFormErrors(errors)
    return !errors.verifiedName && !errors.category
  }

  const resetForm = () => {
    setEditId(null)
    setVerifiedName('')
    setCategory('')
    setFormErrors({ verifiedName: false, category: false })
  }

  // Save (Add or Update)
  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editId) {
        await updateFavorite(editId, { verifiedName: verifiedName.trim(), category: category.trim() })
        showSnackbar('Medicine updated successfully!', 'success')
      } else {
        await createFavorite({ verifiedName: verifiedName.trim(), category: category.trim() })
        showSnackbar('Medicine added to favorites!', 'success')
      }
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Failed to save medicine', error)
      // Check if it's a conflict error (duplicate)
      if (error.response?.status === 409 || error.response?.data?.title?.includes("Duplicate")) {
        showSnackbar('A medicine with this name and category already exists.', 'error')
      } else {
        showSnackbar('Failed to save medicine. Please try again.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (medicine: FavoriteMedicine) => {
    setEditId(medicine.id)
    setVerifiedName(medicine.verifiedName)
    setCategory(medicine.category)
    setFormErrors({ verifiedName: false, category: false })
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete a single medicine
  const handleDelete = async (id: string) => {
    try {
      await deleteFavorite(id)
      setFavorites(prev => prev.filter(f => f.id !== id))
      showSnackbar('Medicine removed from favorites', 'success')
      // If we are currently editing this item, reset the form
      if (editId === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Failed to delete medicine', error)
      showSnackbar('Failed to delete medicine', 'error')
    }
  }

  // DataGrid Columns
  const columns: GridColDef[] = [
    { field: 'verifiedName', headerName: 'Verified Name', flex: 1.5, minWidth: 200 },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 150 },
    { 
      field: 'createdAt', 
      headerName: 'Added On', 
      flex: 1, 
      minWidth: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString() 
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit medicine"><EditIcon color="primary" /></Tooltip>}
          label="Edit"
          onClick={() => handleEditClick(params.row as FavoriteMedicine)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Remove from favorites"><DeleteIcon color="error" /></Tooltip>}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />
      ]
    }
  ]

  return (
    <Box sx={{ pb: 4 }}>
      {/* Data Entry Form */}
      <Card 
        className="glass-card"
        sx={{ mb: 4 }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
            {editId ? 'Update Medicine' : 'Add New Medicine'}
          </Typography>
          
          <Grid container spacing={3} alignItems="flex-start">
            <Grid size={{xs: 12, lg: 5}}>
              <Autocomplete
                freeSolo
                options={Array.from(new Set(favorites.map(f => f.verifiedName))).sort()}
                value={verifiedName}
                onInputChange={(_, newValue) => setVerifiedName(newValue)}
                onChange={(_, newValue) => setVerifiedName(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Verified Name"
                    placeholder="e.g. Asthalin MDI"
                    error={formErrors.verifiedName}
                    helperText={formErrors.verifiedName ? 'Verified Name is required' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, lg: 5}}>
              <Autocomplete
                freeSolo
                options={Array.from(new Set(favorites.map(f => f.category))).sort()}
                value={category}
                onInputChange={(_, newValue) => setCategory(newValue)}
                onChange={(_, newValue) => setCategory(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Category"
                    placeholder="e.g. Bronchodilator"
                    error={formErrors.category}
                    helperText={formErrors.category ? 'Category is required' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, lg: 2}} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ height: 56, borderRadius: '12px' }}
              >
                {editId ? (saving ? 'Updating...' : 'Update') : (saving ? 'Saving...' : 'Save')}
              </Button>
              
              {editId && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={resetForm}
                  disabled={saving}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: '10px' }}
                >
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DataGrid Section */}
      <Card 
        className="glass-card"
        sx={{ overflow: 'hidden' }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={favorites}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: 'none',
                  backgroundColor: 'rgba(0,0,0,0.02)'
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'rgba(0, 0, 0, 0)'
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: 'none',
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 }
                }
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
