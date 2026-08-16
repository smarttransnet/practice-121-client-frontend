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
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {
  getPatientByMobilePublic,
  searchPatientsPublic,
  sendPatientOtpPublic,
  verifyPatientOtpPublic,
  resendPatientOtpPublic,
} from './appointmentApi';
import { registerPatient } from '../patients/patientsApi';
import { isValidLkMobile, normalizeLkMobile } from '../../utils/lkPhoneValidation';
import { calculateAge } from '../../utils/dateUtils';
import { AddPatientInlineForm } from '../patients/AddPatientInlineForm';
import { OtpVerificationDialog } from '../../components/OtpVerificationDialog';

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

  initialMobile?: string; // pre-filled mobile returned from registration
  createdByDoctorId?: string;
}

export function PatientLookupStep({ onPatientConfirmed, initialMobile, createdByDoctorId }: Props) {
  const [mobile, setMobile] = useState(initialMobile ?? '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nicNumber, setNicNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [primaryPatient, setPrimaryPatient] = useState<PatientRecord | null>(null);
  const [childrenPatients, setChildrenPatients] = useState<PatientRecord[]>([]);
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);
  const [mode, setMode] = useState<'input' | 'notFound' | 'select' | 'confirm'>('input');

  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState<string>('');
  const [maskedMobile, setMaskedMobile] = useState<string>('');
  const [pendingMobile, setPendingMobile] = useState<string>('');

  const [showAddInlineForm, setShowAddInlineForm] = useState<'myself' | 'family' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInlineSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      // Need to use the verified mobile number
      const targetMobile = pendingMobile || mobile;
      const patientId = await registerPatient({
        ...data,
        mobileNumber: targetMobile,
        createdByDoctorId: createdByDoctorId,
      });

      const newPatient: PatientRecord = {
        id: patientId,
        firstName: data.firstName,
        lastName: data.lastName,
        nicNumber: data.nicNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        mobileNumber: targetMobile,
      };

      if (data.isMobileOwner) {
        setPrimaryPatient(newPatient);
      } else {
        setChildrenPatients(prev => [...prev, newPatient]);
      }
      
      setShowAddInlineForm(null);
      // Auto-select the newly added patient
      onPatientConfirmed(newPatient);
    } catch (err: any) {
      setError(err.message || 'Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerified = async (verificationToken: string) => {
    setLoading(true);
    try {
      const lookupResult = await getPatientByMobilePublic(pendingMobile, verificationToken);
      if (lookupResult) {
        let pPatient = lookupResult.primaryPatient;
        let pFamily = lookupResult.familyMembers || [];

        // If no primary patient but we have family members, use the first family member as primary
        if (!pPatient && pFamily.length > 0) {
          pPatient = pFamily[0];
          pFamily = pFamily.slice(1);
        }

        setPrimaryPatient(pPatient);
        setChildrenPatients(pFamily);
        setMode('confirm');
      } else {
        setMode('confirm');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient record after verification.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPrimaryPatient(null);
    setChildrenPatients([]);
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
        const otpSendRes = await sendPatientOtpPublic(normalizedMobile);
        if (otpSendRes.patientExists && otpSendRes.sessionId) {
          setOtpSessionId(otpSendRes.sessionId);
          setMaskedMobile(otpSendRes.maskedMobile || normalizedMobile);
          setPendingMobile(normalizedMobile);
          setOpenOtpDialog(true);
          return;
        }
        if (!hasAdvanced) {
          setPendingMobile(normalizedMobile);
          setMode('confirm');
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
        setMode('confirm');
      } else if (results.length === 1) {
        setPrimaryPatient(results[0]);
        setChildrenPatients([]);
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
    setSearchResults([]);
    setMode('confirm');
  };

  // ---------- Confirm card with Family Selector ----------
  if (mode === 'confirm') {
    return (
      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={2}>Who is this appointment for?</Typography>

        {!showAddInlineForm && (
          <Stack spacing={2}>
            {primaryPatient && (
              <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography fontWeight={700}>For Me ({primaryPatient.firstName})</Typography></Box>
                <Button size="small" variant="contained" onClick={() => onPatientConfirmed(primaryPatient)}>Select</Button>
              </Card>
            )}
            {!primaryPatient && (
              <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography fontWeight={700}>For Me (New Patient)</Typography></Box>
                <Button size="small" variant="outlined" onClick={() => setShowAddInlineForm('myself')}>Add Details</Button>
              </Card>
            )}

            <Typography variant="subtitle2" fontWeight={700} mt={2}>Family Members</Typography>
            
            {(() => {
              const adults = childrenPatients.filter(p => {
                const age = calculateAge(p.dateOfBirth);
                return age === null || age >= 18;
              });
              const children = childrenPatients.filter(p => {
                const age = calculateAge(p.dateOfBirth);
                return age !== null && age < 18;
              });

              return (
                <>
                  {adults.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block" mb={1}>Adults (18+)</Typography>
                      <Stack spacing={1}>
                        {adults.map(fm => (
                          <Card key={fm.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box><Typography fontWeight={700}>{fm.firstName} {fm.lastName}</Typography></Box>
                            <Button size="small" variant="contained" onClick={() => onPatientConfirmed(fm)}>Select</Button>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {children.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block" mb={1}>Children (Under 18)</Typography>
                      <Stack spacing={1}>
                        {children.map(fm => (
                          <Card key={fm.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box><Typography fontWeight={700}>{fm.firstName} {fm.lastName}</Typography></Box>
                            <Button size="small" variant="contained" onClick={() => onPatientConfirmed(fm)}>Select</Button>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  {childrenPatients.length === 0 && (
                     <Typography variant="body2" color="text.secondary" fontStyle="italic">No other family members found.</Typography>
                  )}
                </>
              );
            })()}
            
            <Button color="secondary" onClick={() => setShowAddInlineForm('family')} startIcon={<PersonAddAltIcon />}>Add Family Member</Button>
          </Stack>
        )}

        {showAddInlineForm && (
          <AddPatientInlineForm
            isMobileOwner={showAddInlineForm === 'myself'}
            onSubmit={handleInlineSubmit}
            onCancel={() => setShowAddInlineForm(null)}
            isLoading={submitting}
          />
        )}

        <Button variant="outlined" onClick={reset} size="small" sx={{ borderRadius: 6, textTransform: 'none', mt: 3, display: showAddInlineForm ? 'none' : 'inline-flex' }}>
          Not me – Search Again
        </Button>
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


  // ---------- Search input ----------
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter your mobile number to find your patient record.
      </Typography>

      <TextField
        fullWidth
        autoFocus
        type="tel"
        label="Mobile Number"
        placeholder="077 000 0000"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        slotProps={{
          htmlInput: {
            id: 'appt-mobile-input',
            inputMode: 'numeric',
            pattern: '[0-9]*',
          },
        }}
        sx={{ mb: 2 }}
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
        Not registered yet? Use the search above, and if no record is found you will be prompted to register.
      </Typography>

      <OtpVerificationDialog
        open={openOtpDialog}
        onClose={() => setOpenOtpDialog(false)}
        maskedMobile={maskedMobile}
        sessionId={otpSessionId}
        onVerified={handleOtpVerified}
        onVerifyOtp={(sid, code) => verifyPatientOtpPublic(sid, code)}
        onResendOtp={(sid) => resendPatientOtpPublic(sid)}
      />
    </Box>
  );
}
