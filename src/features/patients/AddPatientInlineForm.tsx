import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert
} from '@mui/material';
import { useNicAutoFill } from '../../hooks/useNicAutoFill';
import { calculateAge } from '../../utils/ageHelper';

export interface InlinePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nicNumber: string;
  gender: string;
  isMobileOwner: boolean;
}

interface Props {
  isMobileOwner: boolean;
  onSubmit: (data: InlinePatientData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddPatientInlineForm: React.FC<Props> = ({ isMobileOwner, onSubmit, onCancel, isLoading }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);

  const nicInput = useNicAutoFill({
    onAutoFill: (dob, g) => {
      if (!dateOfBirth) setDateOfBirth(dob);
      if (!gender) setGender(g);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    const ageInfo = calculateAge(dateOfBirth);
    if (ageInfo.years !== null && ageInfo.years > 18 && !nicInput.nicNumber.trim()) {
      setError('NIC is required for patients over 18 years old.');
      return;
    }

    if (nicInput.error) {
      setError(nicInput.error);
      return;
    }

    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        nicNumber: nicInput.nicNumber.trim(),
        gender,
        isMobileOwner,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add patient.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        {isMobileOwner ? 'Add My Details' : 'Add Family Member Details'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="First Name"
            size="small"
            required
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            size="small"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Date of Birth"
            type="date"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <TextField
            label="NIC Number (Optional if under 18)"
            size="small"
            fullWidth
            value={nicInput.nicNumber}
            onChange={(e) => nicInput.handleNicChange(e.target.value)}
            onBlur={nicInput.handleBlur}
            error={!!nicInput.error}
            helperText={nicInput.error}
          />
        </Stack>

        <FormControl size="small" fullWidth disabled={nicInput.autoFilled}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={gender}
            label="Gender"
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" size="small" onClick={onCancel} disabled={isLoading} sx={{ borderRadius: 6, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" size="small" type="submit" disabled={isLoading} sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700 }}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
