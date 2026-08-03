import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Box, Typography, Card, CardContent, Button, TextField,
  Tooltip, CircularProgress, Snackbar, Alert, Grid, Chip, Paper, ClickAwayListener, List, ListItemButton
} from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

import { 
  fetchFavorites, 
  createFavorite,
  updateFavorite,
  deleteFavorite,
  fetchSmartSuggestions
} from '../api/favorites'
import type { FavoriteMedicine, FavoriteSuggestion } from '../api/favorites'
import { formatDisplayDate } from '../utils/dateUtils'

export function FavoritesListPage() {
  const [favorites, setFavorites] = useState<FavoriteMedicine[]>([])
  const [suggestions, setSuggestions] = useState<FavoriteSuggestion[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [fetchingSuggestions, setFetchingSuggestions] = useState<boolean>(false)
  
  // Suggestion Dropdown Open State
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const genericInputRef = useRef<HTMLDivElement>(null)

  // Form State - 6 Fields
  const [editId, setEditId] = useState<string | null>(null)
  const [genericName, setGenericName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [category, setCategory] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')



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

  // Fetch Smart Suggestions
  const loadSuggestions = useCallback(async (query?: string) => {
    setFetchingSuggestions(true)
    try {
      const data = await fetchSmartSuggestions(query)
      setSuggestions(data)
    } catch (error) {
      console.error('Failed to load smart suggestions', error)
    } finally {
      setFetchingSuggestions(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    loadSuggestions()
  }, [loadSuggestions])

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))



  const resetForm = () => {
    setEditId(null)
    setGenericName('')
    setBrandName('')
    setCategory('')
    setDose('')
    setFrequency('')
    setDuration('')

    setShowSuggestions(false)
  }

  // Smart suggestion selection handler - auto populates all remaining fields
  const handleSelectSuggestion = (suggestion: FavoriteSuggestion) => {
    if (suggestion.genericName) setGenericName(suggestion.genericName)
    if (suggestion.brandName) setBrandName(suggestion.brandName)
    if (suggestion.category) setCategory(suggestion.category)
    if (suggestion.dose) setDose(suggestion.dose)
    if (suggestion.frequency) setFrequency(suggestion.frequency)
    if (suggestion.duration) setDuration(suggestion.duration)

    setShowSuggestions(false)
  }

  // Save (Add or Update)
  const handleSave = async () => {


    setSaving(true)
    const payload = {
      genericName: genericName.trim() || undefined,
      brandName: brandName.trim() || undefined,
      category: category.trim() || undefined,
      dose: dose.trim() || undefined,
      frequency: frequency.trim() || undefined,
      duration: duration.trim() || undefined
    }

    try {
      if (editId) {
        await updateFavorite(editId, payload)
        showSnackbar('Medicine updated in favorites!', 'success')
      } else {
        await createFavorite(payload)
        showSnackbar('Medicine added to favorites!', 'success')
      }
      resetForm()
      loadData()
      loadSuggestions() // Refresh continuous learning suggestions
    } catch (error: any) {
      console.error('Failed to save medicine', error)
      if (error.response?.status === 409 || error.response?.data?.title?.includes("Duplicate")) {
        showSnackbar('A medicine with this generic name and category already exists.', 'error')
      } else {
        showSnackbar('Failed to save medicine. Please try again.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (medicine: FavoriteMedicine) => {
    setEditId(medicine.id)
    setGenericName(medicine.genericName)
    setBrandName(medicine.brandName || '')
    setCategory(medicine.category)
    setDose(medicine.dose || '')
    setFrequency(medicine.frequency || '')
    setDuration(medicine.duration || '')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete a single medicine
  const handleDelete = async (id: string) => {
    try {
      await deleteFavorite(id)
      setFavorites(prev => prev.filter(f => f.id !== id))
      showSnackbar('Medicine removed from favorites', 'success')
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
    { field: 'genericName', headerName: 'Generic Name', flex: 1.5, minWidth: 170 },
    { field: 'brandName', headerName: 'Brand Name', flex: 1.2, minWidth: 140, renderCell: (params) => params.value || '-' },
    { field: 'category', headerName: 'Category', flex: 1.2, minWidth: 140 },
    { field: 'dose', headerName: 'Dose', flex: 1, minWidth: 100, renderCell: (params) => params.value || '-' },
    { field: 'frequency', headerName: 'Frequency', flex: 1, minWidth: 110, renderCell: (params) => params.value || '-' },
    { field: 'duration', headerName: 'Duration', flex: 1, minWidth: 110, renderCell: (params) => params.value || '-' },
    { 
      field: 'doctorSpecialty', 
      headerName: 'Specialty', 
      flex: 1.2, 
      minWidth: 130,
      renderCell: (params) => (
        params.value ? (
          <Chip label={params.value} size="small" variant="outlined" color="primary" sx={{ borderRadius: '6px', height: 24, fontSize: '0.75rem' }} />
        ) : '-'
      ) 
    },
    { 
      field: 'createdAt', 
      headerName: 'Added On', 
      flex: 1, 
      minWidth: 130,
      valueFormatter: (value) => formatDisplayDate(value) 
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
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

  // Filtered suggestions based on user input
  const filteredSuggestions = suggestions.filter(s => 
    !genericName.trim() || 
    (s.genericName && s.genericName.toLowerCase().includes(genericName.toLowerCase())) || 
    (s.brandName && s.brandName.toLowerCase().includes(genericName.toLowerCase()))
  )

  return (
    <Box sx={{ pb: 4 }}>


      {/* Next Generation Form Card */}
      <Card 
        className="glass-card"
        sx={{ 
          mb: 4, 
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
              {editId ? '✏️ Edit Favorite Medicine' : '✨ Add New Favorite Medicine'}
            </Typography>
            <Chip 
              icon={<AutoAwesomeIcon fontSize="small" />} 
              label="Smart Suggestions Enabled" 
              size="small" 
              color="secondary" 
              variant="filled"
              sx={{ borderRadius: '8px', fontWeight: 600, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            />
          </Box>
          
          <Grid container spacing={2.5}>
            {/* Generic Name - Standard Input with Smart Suggestions Popover */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }} ref={genericInputRef} sx={{ position: 'relative' }}>
              <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                <Box>
                  <TextField
                    fullWidth
                    label="Generic Name"
                    placeholder="e.g. Paracetamol, Amoxicillin"
                    value={genericName}
                    onChange={(e) => {
                      const val = e.target.value
                      setGenericName(val)
                      if (val.trim().length >= 1) {
                        setShowSuggestions(true)
                        loadSuggestions(val)
                      } else {
                        setShowSuggestions(false)
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true)
                    }}

                    slotProps={{
                      input: {
                        endAdornment: fetchingSuggestions ? <CircularProgress color="inherit" size={18} /> : null
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '12px'
                      }
                    }}
                  />

                  {/* Smart Suggestions Popover */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <Paper
                      elevation={8}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1400,
                        mt: 0.5,
                        maxHeight: 280,
                        overflowY: 'auto',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <List disablePadding>
                        {filteredSuggestions.map((item, idx) => (
                          <ListItemButton
                            key={`${item.genericName || item.brandName || idx}-${idx}`}
                            onClick={() => handleSelectSuggestion(item)}
                            sx={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              py: 1.2,
                              px: 2,
                              borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.06)' }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <Typography fontWeight={700} color="primary.main" variant="subtitle2">
                                {item.genericName || item.brandName || 'Unnamed Medicine'} {item.genericName && item.brandName ? `(${item.brandName})` : ''}
                              </Typography>
                              <Chip 
                                label={`⭐ ${item.usageCount} ${item.usageCount === 1 ? 'doctor' : 'doctors'}`}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {item.category ? <>Category: <b>{item.category}</b> </> : null}{item.dose ? `| Dose: ${item.dose}` : ''} {item.frequency ? `| Freq: ${item.frequency}` : ''} {item.duration ? `| Duration: ${item.duration}` : ''}
                            </Typography>
                          </ListItemButton>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Box>
              </ClickAwayListener>
            </Grid>

            {/* Brand Name */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                label="Brand Name (Optional)"
                placeholder="e.g. Panadol, Augmentin"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>

            {/* Category - Standard Input */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                label="Category"
                placeholder="e.g. Analgesic, Antibiotic"
                value={category}
                onChange={(e) => setCategory(e.target.value)}

                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>

            {/* Dose */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <TextField
                fullWidth
                label="Dose (Optional)"
                placeholder="e.g. 500mg, 10ml"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>

            {/* Frequency */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <TextField
                fullWidth
                label="Frequency (Optional)"
                placeholder="e.g. TDS (3 times daily), BD"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>

            {/* Duration */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <TextField
                fullWidth
                label="Duration (Optional)"
                placeholder="e.g. 5 days, 1 week"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ 
                  height: 56, 
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)'
                }}
              >
                {editId ? (saving ? 'Updating...' : 'Update') : (saving ? 'Saving...' : 'Save')}
              </Button>
              
              {editId && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={resetForm}
                  disabled={saving}
                  startIcon={<CancelIcon />}
                  sx={{ height: 56, borderRadius: '12px', textTransform: 'none' }}
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
        sx={{ 
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)'
        }}
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
                  backgroundColor: 'rgba(241, 245, 249, 0.8)',
                  fontWeight: 700
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'rgba(255, 255, 255, 0.4)'
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: 'none',
                  backgroundColor: 'rgba(241, 245, 249, 0.8)'
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
