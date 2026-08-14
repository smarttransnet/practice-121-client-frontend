import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Skeleton,
  Alert,
} from '@mui/material';
import { type PatientRecord } from '../features/appointments/PatientLookupStep';
import { getCentreAvailability, bookAppointment, type DayAvailability } from '../features/appointments/appointmentApi';
import { AppointmentFormBuilder } from '../features/appointments/AppointmentFormBuilder';
import { formatIsoDate } from '../utils/dateUtils';

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

export function BookAppointmentPage() {
  const { doctorId, centreId } = useParams<{ doctorId: string; centreId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const locationState = location.state as { doctorName?: string; clinicName?: string } | null;

  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [centre, setCentre] = useState<CentreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [confirmedPatient, setConfirmedPatient] = useState<PatientRecord | null>(null);
  const [initialMobile, setInitialMobile] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ ticketId: string; queueNumber: number; visitDate: string } | null>(null);

  const availabilityMap = useMemo(() => {
    const map: Record<string, DayAvailability> = {};
    availability.forEach(a => {
      map[a.date] = a;
    });
    return map;
  }, [availability]);

  const availableSessions = useMemo(() => {
    if (!selectedDate || !centre?.sessionGroups) return [];
    const dayAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][selectedDate.getDay()];
    const sessions: { id: string; name: string; timeRange: string }[] = [];

    centre.sessionGroups.forEach((group) => {
      const isDayActive = group.daysOfWeek?.some(d => d.toUpperCase() === dayAbbr);
      if (isDayActive) {
        if (group.timeBlocks && group.timeBlocks.length > 0) {
          group.timeBlocks.forEach((tb) => {
            sessions.push({
              id: tb.id,
              name: tb.label || 'Session',
              timeRange: `${tb.startTime} - ${tb.endTime}`,
            });
          });
        } else {
          sessions.push({
            id: group.id,
            name: 'Scheduled Session',
            timeRange: 'Regular Practice Hours',
          });
        }
      }
    });
    return sessions;
  }, [selectedDate, centre]);

  useEffect(() => {
    if (availableSessions.length === 1) {
      setSelectedSessionId(availableSessions[0].id);
    } else if (availableSessions.length > 1) {
      if (!selectedSessionId || !availableSessions.some(s => s.id === selectedSessionId)) {
        setSelectedSessionId(null);
      }
    } else {
      setSelectedSessionId(null);
    }
  }, [availableSessions]);

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

  useEffect(() => {
    const mobile = searchParams.get('registeredMobile');
    const returnDate = searchParams.get('returnDate');
    
    if (mobile) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('registeredMobile');
      newParams.delete('returnDate');
      navigate(`${location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`, { replace: true });
      
      if (returnDate) {
        const [y, m, d] = returnDate.split('-').map(Number);
        if (y && m && d) {
          setSelectedDate(new Date(y, m - 1, d));
        }
      }
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
        visitDate: formatIsoDate(selectedDate),
        patientId: confirmedPatient.id,
        sessionId: selectedSessionId ?? undefined,
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <Box sx={{ height: 140, background: 'linear-gradient(135deg, #8F00FF 0%, #B854FF 100%)' }} />
        <Container maxWidth="md" sx={{ mt: -6, position: 'relative', zIndex: 2, pb: 6 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={300} />
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
      <title>{pageTitle}</title>
      <meta name="description" content={`Book an appointment with ${doctorName} at ${clinicName}. Choose an available date and confirm your slot online.`} />

      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
          <AppointmentFormBuilder
            doctor={doctor}
            centre={centre}
            availabilityMap={availabilityMap}
            availLoading={availLoading}
            availableSessions={availableSessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
            confirmedPatient={confirmedPatient}
            onConfirmPatient={setConfirmedPatient}
            initialMobile={initialMobile ?? undefined}
            booking={booking}
            bookingError={bookingError}
            bookingResult={bookingResult}
            onBook={handleConfirmBooking}
            onCancel={() => navigate(`/doctor/${doctorId}`)}
            doctorId={doctorId}
          />
        </Container>
      </Box>
    </>
  );
}
