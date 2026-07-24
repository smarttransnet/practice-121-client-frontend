import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { addChildPatient } from './patientsApi';
import { validateChildDob, calculateAge } from '../../utils/ageHelper';

export interface ChildRecord {
  id: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber: string;
  parentId?: string;
}

interface AddChildModalProps {
  open: boolean;
  parentId: string;
  onClose: () => void;
  onChildAdded: (newChild: ChildRecord) => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  open,
  parentId,
  onClose,
  onChildAdded,
}) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setDateOfBirth('');
    setGender('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validate full name
    if (!fullName.trim()) {
      setError('Child full name is required.');
      return;
    }

    // 2. Validate DOB (< 18 years old and in past)
    const dobValidation = validateChildDob(dateOfBirth);
    if (!dobValidation.isValid) {
      setError(dobValidation.error || 'Invalid date of birth.');
      return;
    }

    // 3. Validate gender
    if (!gender) {
      setError('Please select a gender.');
      return;
    }

    setSubmitting(true);
    try {
      const childData = await addChildPatient(parentId, {
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
      });

      onChildAdded(childData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register child patient. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentAgeFormatted = dateOfBirth ? calculateAge(dateOfBirth).formatted : '';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChildCareIcon color="primary" /> Add Child Patient
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              Register a child under the primary parent account. The child must be under 18 years of age.
            </Typography>

            <TextField
              label="Child Full Name"
              placeholder="e.g. Tommy Perera"
              fullWidth
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              slotProps={{
                input: {
                  id: 'add-child-name-input',
                },
              }}
            />

            <Box>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: { id: 'add-child-dob-input' },
                }}
                helperText={currentAgeFormatted ? `Calculated Age: ${currentAgeFormatted}` : 'Must be under 18 years old'}
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel id="add-child-gender-label">Gender</InputLabel>
              <Select
                labelId="add-child-gender-label"
                id="add-child-gender-select"
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={submitting}
            sx={{ borderRadius: 6, textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ChildCareIcon />}
            sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            {submitting ? 'Saving...' : 'Save Child'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
