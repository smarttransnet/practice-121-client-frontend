import { useState, useEffect } from 'react'
import { Box, CircularProgress, Alert } from '@mui/material'
import { PracticeCentreList } from './PracticeCentreList'
import { PracticeCentreForm } from './PracticeCentreForm'
import type { PracticeCentre } from './types'
import { httpClient } from '../../api/httpClient'

export function PracticeCentresTab() {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingCentre, setEditingCentre] = useState<PracticeCentre | undefined>()
  
  const [centres, setCentres] = useState<PracticeCentre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCentres = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await httpClient.get<Record<string, unknown>[]>('/api/practice-centres')
      const mapped: PracticeCentre[] = res.data.map(item => ({
        id: item.id as string,
        placeId: item.placeId as string,
        placeName: (item.placeName as string) || '',
        mohArea: (item.mohAreaName as string) || '',
        district: (item.districtName as string) || '',
        clinicName: (item.clinicName as string) || '',
        maxPatients: item.maxPatients as number | undefined,
        sessionGroups: (item.sessionGroups as any[]) || [],
        nurses: (item.nurses as any[]) || []
      }))
      setCentres(mapped)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { title?: string } }; message?: string };
      setError(err.response?.data?.title || err.message || 'Failed to load practice centres')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCentres()
  }, [])

  const handleCreateNew = () => {
    setEditingCentre(undefined)
    setView('form')
  }

  const handleEdit = (centre: PracticeCentre) => {
    setEditingCentre(centre)
    setView('form')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this practice centre?')) return
    
    try {
      await httpClient.delete(`/api/practice-centres/${id}`)
      setCentres(centres.filter(c => c.id !== id))
    } catch (e: unknown) {
      const err = e as { response?: { data?: { title?: string } }; message?: string };
      alert(err.response?.data?.title || err.message || 'Failed to delete practice centre')
    }
  }

  const handleSave = async (data: PracticeCentre) => {
    try {
      const payload = {
        clinicName: data.clinicName,
        placeId: data.placeId,
        maxPatients: data.maxPatients,
        sessionGroups: data.sessionGroups,
        nurses: data.nurses
      }

      if (data.id) {
        await httpClient.put(`/api/practice-centres/${data.id}`, payload)
      } else {
        await httpClient.post('/api/practice-centres', payload)
      }
      
      await fetchCentres()
      setView('list')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { title?: string } }; message?: string };
      alert(err.response?.data?.title || err.message || 'Failed to save practice centre')
    }
  }

  if (loading && centres.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {view === 'list' ? (
        <PracticeCentreList
          centres={centres}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <PracticeCentreForm
          initialData={editingCentre}
          otherCentres={centres.filter(c => c.id !== editingCentre?.id)}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
      )}
    </Box>
  )
}
