import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { PracticeCentreList } from './PracticeCentreList'
import { PracticeCentreForm } from './PracticeCentreForm'
import type { PracticeCentre } from './types'

export function PracticeCentresTab() {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingCentre, setEditingCentre] = useState<PracticeCentre | undefined>()
  
  // Initialize from localStorage
  const [centres, setCentres] = useState<PracticeCentre[]>(() => {
    const saved = localStorage.getItem('mock_practice_centres')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return []
  })

  // Save to localStorage whenever centres change
  useEffect(() => {
    localStorage.setItem('mock_practice_centres', JSON.stringify(centres))
  }, [centres])

  const handleCreateNew = () => {
    setEditingCentre(undefined)
    setView('form')
  }

  const handleEdit = (centre: PracticeCentre) => {
    setEditingCentre(centre)
    setView('form')
  }

  const handleDelete = (id: string) => {
    setCentres(centres.filter(c => c.id !== id))
  }

  const handleSave = (data: PracticeCentre) => {
    if (data.id) {
      setCentres(centres.map(c => (c.id === data.id ? data : c)))
    } else {
      setCentres([...centres, { ...data, id: crypto.randomUUID() }])
    }
    setView('list')
  }

  return (
    <Box>
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
