import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import type { SessionGroup } from './types'
import { SessionGroupStepper } from './SessionGroupStepper'

interface Props {
  groups: SessionGroup[]
  onChange: (groups: SessionGroup[]) => void
}

export function SessionGroupList({ groups, onChange }: Props) {
  const [isStepperOpen, setIsStepperOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = () => {
    setEditingIndex(null)
    setIsStepperOpen(true)
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsStepperOpen(true)
  }

  const handleRemove = (index: number) => {
    const next = [...groups]
    next.splice(index, 1)
    onChange(next)
  }

  const handleSaveGroup = (group: SessionGroup) => {
    const next = [...groups]
    if (editingIndex !== null) {
      next[editingIndex] = group
    } else {
      next.push(group)
    }
    onChange(next)
    setIsStepperOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>
      {groups.map((group, gIdx) => (
        <Card key={group.id || gIdx} className="glass-card" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                Session Group {gIdx + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.specificDate 
                  ? `Specific Date: ${group.specificDate}` 
                  : `Recurring: ${group.daysOfWeek.join(', ')}`}
              </Typography>
            </Box>
            <Box>
              <IconButton color="primary" size="small" onClick={() => handleEdit(gIdx)} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" size="small" onClick={() => handleRemove(gIdx)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
            Time Blocks ({group.timeBlocks.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {group.timeBlocks.map((tb, i) => (
              <Box key={i} sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.50', color: 'primary.900', borderRadius: 1, fontSize: '0.8rem', fontWeight: 600 }}>
                {tb.label}: {tb.startTime} - {tb.endTime}
              </Box>
            ))}
          </Box>

          {group.daysOff && group.daysOff.length > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom color="error.main">
                Exception Days Off ({group.daysOff.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {group.daysOff.map((dOff, i) => (
                  <Box key={i} sx={{ px: 1.5, py: 0.5, bgcolor: 'error.50', color: 'error.900', borderRadius: 1, fontSize: '0.8rem', fontWeight: 600 }}>
                    {dOff}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Card>
      ))}

      <Button
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ alignSelf: 'flex-start', borderRadius: 2.5, px: 3, py: 1 }}
      >
        Add Session Group
      </Button>

      <Dialog
        open={isStepperOpen}
        onClose={() => setIsStepperOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', pb: 0 }}>
          {editingIndex !== null ? 'Edit Session Group' : 'New Session Group'}
        </DialogTitle>
        <DialogContent>
          {isStepperOpen && (
            <SessionGroupStepper
              initialGroup={editingIndex !== null ? groups[editingIndex] : undefined}
              onSave={handleSaveGroup}
              onCancel={() => setIsStepperOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
