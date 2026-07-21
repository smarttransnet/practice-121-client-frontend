import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Stack,
  Button,
  Skeleton,
  Alert,
  Divider,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppointmentCalendar } from '../features/appointments/AppointmentCalendar';
import { PatientLookupStep, type PatientRecord } from '../features/appointments/PatientLookupStep';
import { getCentreAvailability, bookAppointment, type DayAvailability } from '../features/appointments/appointmentApi';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

interface CentreInfo {
  id: string;
  doctorId: string;
  clinicName: string;
  placeName: string;
  districtName: string;
  mohAreaName: string;
  sessionGroups: {
    id: string;
    daysOfWeek: string[];
    timeBlocks: { id: string; label: string; startTime: string; endTime: string }[];
  }[];
  maxPatients?: number | null;
}

interface DoctorInfo {
  fullName: string;
  specialty?: string;
  profilePictureUrl?: string;
}

const STEPS = ['Select Date', 'Your Details', 'Confirm'];

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BookAppointmentPage() {
  const { doctorId, centreId } = useParams<{ doctorId: string; centreId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Optional data passed via navigation state from PublicProfilePage
  const locationState = location.state as { doctorName?: string; clinicName?: string } | null;

  const [activeStep, setActiveStep] = useState(0);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [centre, setCentre] = useState<CentreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [confirmedPatient, setConfirmedPatient] = useState<PatientRecord | null>(null);
  const [initialMobile, setInitialMobile] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ ticketId: string; queueNumber: number; visitDate: string } | null>(null);

  // Build availability map for calendar
  const availabilityMap = useMemo(() => {
    const map: Record<string, DayAvailability> = {};
    availability.forEach(a => {
      map[a.date] = a;
    });
    return map;
  }, [availability]);

  // Load doctor + centre info
  useEffect(() => {
    if (!doctorId || !centreId) {
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const [docRes, centresRes] = await Promise.all([
          fetch(`${API_BASE}/api/public/doctors/${doctorId}`),
          fetch(`${API_BASE}/api/public/doctors/${doctorId}/practice-centres`),
        ]);

        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctor(docData.value ?? docData);
        }

        if (centresRes.ok) {
          const centres: CentreInfo[] = await centresRes.json();
          const found = centres.find(c => c.id === centreId);
          if (found) {
            setCentre(found);
          } else {
            setLoadError('Practice centre not found.');
          }
        }
      } catch {
        setLoadError('Failed to load booking information.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [doctorId, centreId]);

  // Load availability once centre is loaded
  useEffect(() => {
    if (!doctorId || !centreId) {
      return;
    }
    setAvailLoading(true);
    getCentreAvailability(doctorId, centreId)
      .then(data => setAvailability(data))
      .catch(() => setAvailability([]))
      .finally(() => setAvailLoading(false));
  }, [doctorId, centreId]);

  // Handle return from patient registration with mobile param
  useEffect(() => {
    const mobile = searchParams.get('registeredMobile');
    if (mobile) {
      // Clean the URL param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('registeredMobile');
      navigate(`${location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`, { replace: true });
      // Jump to Step 2 and pass the registered mobile
      setActiveStep(1);
      setInitialMobile(decodeURIComponent(mobile));
    }
  }, [searchParams]);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !confirmedPatient || !doctorId || !centreId) {
      return;
    }
    setBooking(true);
    setBookingError(null);
    try {
      const result = await bookAppointment({
        patientMobile: confirmedPatient.mobileNumber,
        doctorAccountId: doctorId,
        practiceCentreId: centreId,
        visitDate: formatDateLocal(selectedDate),
      });
      setBookingResult(result);
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const doctorName = doctor?.fullName ?? locationState?.doctorName ?? 'Doctor';
  const clinicName = centre?.clinicName ?? locationState?.clinicName ?? 'Clinic';
  const pageTitle = `Book Appointment – ${doctorName} at ${clinicName}`;
  const returnUrl = `/book/${doctorId}/centre/${centreId}`;

  // --- Success screen ---
  if (bookingResult) {
    return (
      <>
        <title>{pageTitle}</title>
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
          <Box sx={{ height: 140, background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)' }} />
          <Container maxWidth="sm" sx={{ mt: -6, position: 'relative', zIndex: 2, pb: 6 }}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center', p: 4 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleIcon sx={{ fontSize: '3rem', color: '#10b981' }} />
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Appointment Booked!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Your appointment has been confirmed. Please arrive a few minutes early.
              </Typography>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'left' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Doctor</Typography>
                    <Typography variant="body2" fontWeight={600}>{doctorName}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Clinic</Typography>
                    <Typography variant="body2" fontWeight={600}>{clinicName}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Visit Date</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatDisplayDate(bookingResult.visitDate)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Queue Number</Typography>
                    <Chip
                      icon={<ConfirmationNumberIcon />}
                      label={`#${bookingResult.queueNumber}`}
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '1rem', height: 32 }}
                    />
                  </Box>
                </Stack>
              </Paper>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/doctor/${doctorId}`)}
                sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 600 }}
              >
                Back to Doctor Profile
              </Button>
            </Card>
          </Container>
        </Box>
      </>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <Box sx={{ height: 140, background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)' }} />
        <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 2, pb: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', p: 4 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width="100%" height={300} />
          </Card>
        </Container>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error">{loadError}</Alert>
      </Container>
    );
  }

  return (
    <>
      {/* SEO meta tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={`Book an appointment with ${doctorName} at ${clinicName}. Choose an available date and confirm your slot online.`} />

      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        {/* Header Banner */}
        <Box sx={{ height: 140, background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)', position: 'relative' }}>
          <Container maxWidth="md" sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', pb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/doctor/${doctorId}`)}
              sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'none', '&:hover': { color: '#fff' } }}
            >
              Back to Profile
            </Button>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: -4, position: 'relative', zIndex: 2, pb: 8 }}>
          {/* Page heading card */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, rgba(143,0,255,0.04) 0%, rgba(184,84,255,0.04) 100%)', p: 3 }}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Book an Appointment
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                {doctorName}
                {doctor?.specialty ? ` · ${doctor.specialty}` : ''}
              </Typography>
              {centre && (
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                  <LocationOnIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {clinicName} &nbsp;·&nbsp; {centre.mohAreaName}, {centre.districtName}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Card>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>

              {/* ── Step 0: Select Date ── */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon color="primary" /> Select a Visit Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Highlighted dates have available slots. Greyed dates are either unavailable or fully booked.
                  </Typography>

                  {availLoading ? (
                    <Skeleton variant="rounded" width="100%" height={320} />
                  ) : (
                    <AppointmentCalendar
                      availabilityMap={availabilityMap}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                  )}

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      disabled={!selectedDate}
                      onClick={() => setActiveStep(1)}
                      sx={{ borderRadius: 6, px: 4, textTransform: 'none', fontWeight: 700 }}
                    >
                      Continue →
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ── Step 1: Patient Lookup ── */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Your Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    We need your patient record to complete the booking. Enter your mobile number to look it up.
                  </Typography>

                  <PatientLookupStep
                    onPatientConfirmed={patient => {
                      setConfirmedPatient(patient);
                      setActiveStep(2);
                    }}
                    registrationReturnUrl={returnUrl}
                    initialMobile={initialMobile ?? undefined}
                  />

                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setActiveStep(0)}
                    sx={{ mt: 2, textTransform: 'none', color: 'text.secondary' }}
                  >
                    Back
                  </Button>
                </Box>
              )}

              {/* ── Step 2: Confirm Booking ── */}
              {activeStep === 2 && confirmedPatient && selectedDate && (
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Confirm Your Booking
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Please review the details below and confirm your appointment.
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Doctor</Typography>
                        <Typography variant="body2" fontWeight={600}>{doctorName}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Clinic</Typography>
                        <Typography variant="body2" fontWeight={600}>{clinicName}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Visit Date</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Patient</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {confirmedPatient.firstName} {confirmedPatient.lastName ?? ''}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Mobile</Typography>
                        <Typography variant="body2" fontWeight={600}>{confirmedPatient.mobileNumber}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {bookingError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{bookingError}</Alert>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setActiveStep(1)}
                      variant="outlined"
                      sx={{ borderRadius: 6, textTransform: 'none', flex: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleConfirmBooking}
                      disabled={booking}
                      startIcon={booking ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                      sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 700, flex: 2, py: 1.5 }}
                    >
                      {booking ? 'Confirming…' : 'Confirm Booking'}
                    </Button>
                  </Stack>
                </Box>
              )}

            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
