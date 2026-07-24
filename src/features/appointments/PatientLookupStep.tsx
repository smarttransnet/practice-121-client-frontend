import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Collapse,
  Card,
  CardContent,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { getPatientByMobilePublic, searchPatientsPublic } from './appointmentApi';
import { isValidLkMobile, normalizeLkMobile } from '../../utils/lkPhoneValidation';
import { FamilyPatientSelector } from '../patients/FamilyPatientSelector';
import { AddChildModal } from '../patients/AddChildModal';

export interface PatientRecord {
  id: string;
  firstName: string;
  lastName?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber: string;
  parentId?: string;
}

interface Props {
  onPatientConfirmed: (patient: PatientRecord) => void;
  registrationReturnUrl: string;
  initialMobile?: string; // pre-filled mobile returned from registration
}

export function PatientLookupStep({ onPatientConfirmed, registrationReturnUrl, initialMobile }: Props) {
  const [mobile, setMobile] = useState(initialMobile ?? '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nicNumber, setNicNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [primaryPatient, setPrimaryPatient] = useState<PatientRecord | null>(null);
  const [childrenPatients, setChildrenPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);
  const [mode, setMode] = useState<'input' | 'notFound' | 'select' | 'confirm'>('input');

  const [openAddChildModal, setOpenAddChildModal] = useState(false);

  const reset = () => {
    setPrimaryPatient(null);
    setChildrenPatients([]);
    setSelectedPatient(null);
    setSearchResults([]);
    setError(null);
    setMode('input');
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(async (overrideMobile?: string) => {
    const searchMobile = overrideMobile ?? mobile;
    setError(null);
    const hasMobile = searchMobile.trim().length > 0;
    const hasAdvanced = firstName.trim() || lastName.trim() || nicNumber.trim();

    if (!hasMobile && !hasAdvanced) {
      setError('Please enter a mobile number or use Advanced Search.');
      return;
    }

    setLoading(true);
    try {
      if (hasMobile) {
        if (!isValidLkMobile(searchMobile)) {
          setError('Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567).');
          setLoading(false);
          return;
        }
        const normalizedMobile = normalizeLkMobile(searchMobile) ?? searchMobile.trim();
        const lookupResult = await getPatientByMobilePublic(normalizedMobile);
        if (lookupResult) {
          setPrimaryPatient(lookupResult.primaryPatient);
          setChildrenPatients(lookupResult.children || []);
          setSelectedPatient(lookupResult.primaryPatient);
          setMode('confirm');
          return;
        }
        if (!hasAdvanced) {
          setMode('notFound');
          return;
        }
      }

      // Advanced search
      const results = await searchPatientsPublic({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        nicNumber: nicNumber.trim() || undefined,
      });

      if (results.length === 0) {
        setMode('notFound');
      } else if (results.length === 1) {
        setPrimaryPatient(results[0]);
        setChildrenPatients([]);
        setSelectedPatient(results[0]);
        setMode('confirm');
      } else {
        setSearchResults(results);
        setMode('select');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mobile, firstName, lastName, nicNumber]);

  // Auto-search when returning from patient registration
  useEffect(() => {
    if (initialMobile) {
      handleSearch(initialMobile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMobile]);

  const handleSelectFromResults = (patient: PatientRecord) => {
    setPrimaryPatient(patient);
    setChildrenPatients([]);
    setSelectedPatient(patient);
    setSearchResults([]);
    setMode('confirm');
  };

  const handleChildAdded = (newChild: PatientRecord) => {
    setChildrenPatients(prev => [...prev, newChild]);
    setSelectedPatient(newChild);
  };

  // ---------- Confirm card with Family Selector ----------
  if (mode === 'confirm' && primaryPatient && selectedPatient) {
    return (
      <Box>
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Patient record found! Select who this appointment is for below:
        </Alert>

        <FamilyPatientSelector
          primaryPatient={primaryPatient}
          children={childrenPatients}
          selectedPatientId={selectedPatient.id}
          onSelectPatient={(p) => setSelectedPatient(p)}
          onOpenAddChild={() => setOpenAddChildModal(true)}
        />

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={reset} sx={{ borderRadius: 6, textTransform: 'none' }}>
            Not me – Search Again
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onPatientConfirmed(selectedPatient)}
            sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, flex: 1 }}
          >
            Confirm Patient: {selectedPatient.firstName} {selectedPatient.lastName ?? ''}
          </Button>
        </Stack>

        <AddChildModal
          open={openAddChildModal}
          parentId={primaryPatient.id}
          onClose={() => setOpenAddChildModal(false)}
          onChildAdded={handleChildAdded}
        />
      </Box>
    );
  }

  // ---------- Multiple search results ----------
  if (mode === 'select') {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Multiple records found. Please select your profile:
        </Typography>
        <Stack spacing={1.5} mb={3}>
          {searchResults.map(p => (
            <Card
              key={p.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(143,0,255,0.1)' },
              }}
              onClick={() => handleSelectFromResults(p)}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {p.firstName} {p.lastName ?? ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  NIC: {p.nicNumber} &nbsp;|&nbsp; Mobile: {p.mobileNumber}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
        <Button variant="outlined" onClick={reset} size="small" sx={{ borderRadius: 6, textTransform: 'none' }}>
          ← Search Again
        </Button>
      </Box>
    );
  }

  // ---------- Not found ----------
  if (mode === 'notFound') {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          No patient record found with the provided details.
        </Alert>
        <Typography variant="body2" color="text.secondary" mb={2}>
          You need to be registered as a patient before booking an appointment.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="outlined" onClick={reset} sx={{ borderRadius: 6, textTransform: 'none' }}>
            ← Try Again
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddAltIcon />}
            component={MuiLink}
            href={`#/register/patient?redirect=${encodeURIComponent(registrationReturnUrl)}`}
            sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, flex: 1, textDecoration: 'none' }}
          >
            Register as New Patient
          </Button>
        </Stack>
      </Box>
    );
  }

  // ---------- Search input ----------
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter your mobile number to find your patient record.
      </Typography>

      <TextField
        fullWidth
        label="Mobile Number"
        placeholder="+94 77 000 0000"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        sx={{ mb: 2 }}
        inputProps={{ id: 'appt-mobile-input' }}
      />

      {/* Advanced search toggle */}
      <Button
        size="small"
        startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setShowAdvanced(p => !p)}
        sx={{ textTransform: 'none', color: 'text.secondary', mb: 1 }}
      >
        {showAdvanced ? 'Hide' : 'Advanced Search (optional)'}
      </Button>

      <Collapse in={showAdvanced}>
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Search by name or NIC if mobile number is not available.
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </Stack>
            <TextField
              fullWidth
              size="small"
              label="NIC Number"
              value={nicNumber}
              onChange={e => setNicNumber(e.target.value)}
            />
          </Stack>
        </Box>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonSearchIcon />}
        disabled={loading}
        onClick={() => handleSearch()}
        sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, py: 1.5 }}
      >
        {loading ? 'Searching…' : 'Find My Record'}
      </Button>

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" align="center" display="block">
        Not registered yet?{' '}
        <MuiLink href={`#/register/patient?redirect=${encodeURIComponent(registrationReturnUrl)}`} underline="hover" color="primary">
          Register here
        </MuiLink>
      </Typography>
    </Box>
  );
}
