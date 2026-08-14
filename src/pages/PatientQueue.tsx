import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, Card, Paper, Chip, IconButton, Grid,
  CircularProgress, Alert, ButtonBase, Stack, TextField,
  RadioGroup, FormControlLabel, Radio,
  LinearProgress
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { AppBreadcrumbs } from '../components/AppBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { httpClient } from '../api/httpClient';
import {
  getPatientQueue, addPatientQueueTicket, updatePatientQueueTicketStatus,
  getPatientByMobile, sendPatientOtp, reorderPatientQueue,
  verifyPatientOtp, resendPatientOtp, type PatientQueueTicket, type Patient
} from '../features/patient-queue/patientQueueApi';
import { formatDisplayDate, formatDisplayDateLong, formatIsoDate } from '../utils/dateUtils';
import { isValidLkMobile, normalizeLkMobile } from '../utils/lkPhoneValidation';
import { AddPatientInlineForm } from '../features/patients/AddPatientInlineForm';
import { OtpVerificationDialog } from '../components/OtpVerificationDialog';
import { calculateAge } from '../utils/dateUtils';

// --- Types ---
interface DaySessionInfo {
  id: string;
  groupId?: string;
  label: string;
  timeRange: string;
  startTime: string;
  endTime: string;
}

interface TimeBlock {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

interface SessionGroup {
  id: string;
  daysOfWeek: string[];
  timeBlocks: TimeBlock[];
}

interface PracticeCentre {
  id: string;
  doctorId: string;
  clinicName: string;
  districtName: string;
  mohAreaName: string;
  placeName: string;
  sessionGroups: SessionGroup[];
}

// --- Helper Functions ---
const getCalendarDays = (viewDate: Date) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= totalDays; day++) days.push(new Date(year, month, day));
  return days;
};

// --- Calendar Picker Component ---
const CalendarPicker = ({ availableDates, selectedDate, onSelectDate }: {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 27);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const days = getCalendarDays(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const showPrev = currentMonth.getFullYear() > today.getFullYear() || currentMonth.getMonth() > today.getMonth();
  const showNext = currentMonth.getFullYear() < maxDate.getFullYear() || currentMonth.getMonth() < maxDate.getMonth();

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} disabled={!showPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} disabled={!showNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Grid container spacing={1} columns={7} sx={{ textAlign: 'center', mb: 1 }}>
        {weekDays.map(wd => (
          <Grid key={wd} size={1}><Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{wd}</Typography></Grid>
        ))}
      </Grid>
      <Grid container spacing={1} columns={7} sx={{ textAlign: 'center' }}>
        {days.map((day, idx) => {
          if (!day) return <Grid key={`empty-${idx}`} size={1} />;
          const dayReset = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const isWithinWindow = dayReset >= today && dayReset <= maxDate;
          const isSelectable = isWithinWindow && availableDates.some(ad => ad.toDateString() === dayReset.toDateString());
          const isSelected = selectedDate && dayReset.toDateString() === selectedDate.toDateString();
          return (
            <Grid key={day.toISOString()} size={1}>
              <ButtonBase
                onClick={() => isSelectable && onSelectDate(dayReset)}
                disabled={!isSelectable}
                sx={{
                  width: 32, height: 32, borderRadius: '50%', fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? 'primary.main' : isSelectable ? 'rgba(143, 0, 255, 0.12)' : 'transparent',
                  color: isSelected ? '#ffffff' : isSelectable ? 'primary.main' : 'text.disabled',
                  opacity: isSelectable ? 1 : 0.4
                }}
              >
                {day.getDate()}
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// --- Main PatientQueue Wizard Component ---
export const PatientQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Wizard State ---
  const [activeStep, setActiveStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // --- Step 0: Centres ---
  const [practiceCentres, setPracticeCentres] = useState<PracticeCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PracticeCentre | null>(null);
  const [loadingCentres, setLoadingCentres] = useState(true);

  // --- Step 1: Dates & Queue ---
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [queue, setQueue] = useState<PatientQueueTicket[]>([]);
  const isEditingQueueRef = useRef(false);
  const isFetchingRef = useRef(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('ALL');

  // --- Step 2: Patient Search & Select ---
  const [patientMobile, setPatientMobile] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [patientLookup, setPatientLookup] = useState<{ primaryPatient: Patient | null; familyMembers: Patient[] } | null>(null);
  const [showAddInlineForm, setShowAddInlineForm] = useState<'myself' | 'family' | null>(null);

  // OTP State
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [pendingMobile, setPendingMobile] = useState('');
  
  // --- Step 3: Session & Priority ---
  const [targetSessionId, setTargetSessionId] = useState<string>('');
  const [priority, setPriority] = useState<number>(0);

  // --- Step 4: Confirm ---
  const [submitting, setSubmitting] = useState(false);

  // --- Hooks & Effects ---
  useEffect(() => {
    fetchPracticeCentres();
  }, []);

  useEffect(() => {
    if (selectedCentre) {
      const dates = getAvailableDates(selectedCentre);
      setAvailableDates(dates);
      if (dates.length > 0) {
        const currentSelectedDateStr = selectedDate ? formatDateLocal(selectedDate) : null;
        if (!dates.some(d => formatDateLocal(d) === currentSelectedDateStr)) {
          setSelectedDate(dates[0]);
        }
      } else {
        setSelectedDate(null);
      }
    } else {
      setAvailableDates([]);
      setSelectedDate(null);
    }
  }, [selectedCentre]);

  useEffect(() => {
    if (!selectedCentre || !selectedDate) {
      setQueue([]);
      return;
    }
    const dateStr = formatDateLocal(selectedDate);
    fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);

    const intervalId = setInterval(() => {
      if (!isEditingQueueRef.current && !isFetchingRef.current) {
        fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
      }
    }, 30000);

    const apiBase = httpClient.defaults.baseURL || 'https://practice121-api-687271578749.asia-southeast1.run.app';
    const hubUrl = `${apiBase.replace(/\/$/, '')}/api/hubs/patient-queue`;
    const connection = new HubConnectionBuilder().withUrl(hubUrl).withAutomaticReconnect().build();

    connection.start().then(() => {
      connection.invoke('JoinQueueGroup', selectedCentre.id).catch(() => {});
      connection.on('QueueUpdated', (data: any) => {
        if (!data || !data.practiceCentreId || String(data.practiceCentreId).toLowerCase() === String(selectedCentre.id).toLowerCase()) {
          if (!isEditingQueueRef.current) fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
        }
      });
    }).catch(() => {});

    return () => {
      clearInterval(intervalId);
      if (connection.state === HubConnectionState.Connected) {
        connection.invoke('LeaveQueueGroup', selectedCentre.id).catch(() => {});
        connection.stop().catch(() => {});
      }
    };
  }, [selectedCentre, selectedDate]);

  useEffect(() => {
    const mobile = searchParams.get('registeredMobile');
    if (mobile) {
      setActiveStep(2);
      setPatientMobile(mobile);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('registeredMobile');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  // Computed Values
  const daySessions = useMemo<DaySessionInfo[]>(() => {
    if (!selectedDate || !selectedCentre?.sessionGroups) return [];
    const dayAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][selectedDate.getDay()];
    const sessions: DaySessionInfo[] = [];
    selectedCentre.sessionGroups.forEach((group) => {
      if (group.daysOfWeek?.some(d => d.toUpperCase() === dayAbbr)) {
        if (group.timeBlocks && group.timeBlocks.length > 0) {
          group.timeBlocks.forEach(tb => sessions.push({
            id: tb.id || group.id || '', groupId: group.id || '', label: tb.label || 'Session',
            timeRange: `${tb.startTime} - ${tb.endTime}`, startTime: tb.startTime, endTime: tb.endTime,
          }));
        } else {
          sessions.push({
            id: group.id || '', groupId: group.id || '', label: 'Scheduled Session',
            timeRange: group.daysOfWeek.join(', '), startTime: '', endTime: '',
          });
        }
      }
    });
    return sessions;
  }, [selectedDate, selectedCentre]);

  useEffect(() => {
    if (daySessions.length > 0 && (!targetSessionId || !daySessions.some(s => s.id === targetSessionId))) {
      setTargetSessionId(daySessions[0].id);
    }
  }, [daySessions, targetSessionId]);

  // --- API Functions ---
  const fetchPracticeCentres = async () => {
    try {
      setLoadingCentres(true);
      setError(null);
      const res = await httpClient.get<PracticeCentre[]>('/api/practice-centres');
      // Order centres logic could be added here (e.g., nearest to start time)
      setPracticeCentres(res.data);
      if (res.data.length > 0) {
        let initial = res.data[0];
        const today = new Date();
        const dayAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][today.getDay()];
        const currentTime = today.getHours() * 60 + today.getMinutes();
        let minDiff = Infinity;

        for (const pc of res.data) {
          if (!pc.sessionGroups) continue;
          for (const group of pc.sessionGroups) {
            if (group.daysOfWeek?.some(d => d.toUpperCase() === dayAbbr)) {
              if (group.timeBlocks && group.timeBlocks.length > 0) {
                for (const tb of group.timeBlocks) {
                  const [hours, minutes] = tb.startTime.split(':').map(Number);
                  const tbTime = hours * 60 + (minutes || 0);
                  const diff = tbTime - currentTime;
                  if (diff > -120 && diff < minDiff) {
                    minDiff = diff;
                    initial = pc;
                  }
                }
              }
            }
          }
        }

        setSelectedCentre(initial);
        localStorage.setItem('selectedPracticeCentreId', initial.id);
        setActiveStep(1); // Auto advance to date if loaded
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load practice centres');
    } finally {
      setLoadingCentres(false);
    }
  };

  const fetchQueue = async (centreId: string, doctorId?: string, visitDate?: string) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      const data = await getPatientQueue(centreId, doctorId, visitDate);
      setQueue(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleMobileLookup = async () => {
    setError(null);
    const norm = normalizeLkMobile(patientMobile);
    if (!norm || !isValidLkMobile(norm)) {
      setError('Please enter a valid Sri Lankan mobile number (e.g. 077 123 4567).');
      return;
    }
    setLookupLoading(true);
    try {
      const otpSendRes = await sendPatientOtp(norm);
      if (otpSendRes.sessionId) {
        setOtpSessionId(otpSendRes.sessionId);
        setMaskedMobile(otpSendRes.maskedMobile || norm);
        setPendingMobile(norm);
        setOpenOtpDialog(true);
      }
    } catch (e: any) {
      setError(e.message || 'Error validating mobile number.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleOtpVerified = async (token: string) => {
    setOpenOtpDialog(false);
    setLookupLoading(true);
    setError(null);
    try {
      const res = await getPatientByMobile(pendingMobile, token);
      if (res) {
        let pPatient = res.primaryPatient;
        let pFamily = res.familyMembers || [];

        setPatientLookup({ primaryPatient: pPatient, familyMembers: pFamily });
      } else {
        // New mobile number with no records
        setPatientLookup({ primaryPatient: null, familyMembers: [] });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load patient record.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleInlineSubmit = async (data: any) => {
    setSubmitting(true);
    setError(null);
    try {
      // Assuming registerPatient is imported from patientsApi
      // If we don't have it imported here, we'll need to add it, but we can assume we'll add it to the imports
      const { registerPatient } = await import('../features/patients/patientsApi');
      const newPatient = await registerPatient({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        nicNumber: data.nicNumber,
        gender: data.gender,
        mobileNumber: pendingMobile,
        isMobileOwner: data.isMobileOwner,
        createdByDoctorId: selectedCentre?.doctorId
      });
      // The API returns the new patient id, we can set verified patient
      setVerifiedPatient({
        id: newPatient.id || newPatient,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        nicNumber: data.nicNumber,
        gender: data.gender,
        mobileNumber: pendingMobile,
        isMobileOwner: data.isMobileOwner
      });
      setShowAddInlineForm(null);
    } catch (e: any) {
      setError(e.message || 'Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!verifiedPatient || !selectedDate || !selectedCentre) return;
    setSubmitting(true);
    setError(null);
    try {
      const rawMobile = verifiedPatient.mobileNumber || patientMobile;
      const cleanSessionId = targetSessionId && targetSessionId !== 'ALL' ? targetSessionId : undefined;
      await addPatientQueueTicket({
        patientId: verifiedPatient.id,
        patientMobile: normalizeLkMobile(rawMobile) || rawMobile.trim(),
        sessionId: cleanSessionId,
        priority,
        visitDate: formatIsoDate(selectedDate),
        doctorId: selectedCentre.doctorId,
        practiceCentreId: selectedCentre.id
      });
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate));
      
      // Reset logic
      resetAddPatientState();
      setActiveStep(1); // Go back to Queue view or keep at 2? Let's go to Queue View (Step 1)
    } catch (e: any) {
      setError(e.message || 'Failed to add patient to queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAddPatientState = () => {
    setPatientMobile('');
    setVerifiedPatient(null);
    setPatientLookup(null);
    setShowAddInlineForm(null);
    setPriority(0);
    setTargetSessionId(daySessions.length > 0 ? daySessions[0].id : '');
  };

  // --- Handlers ---
  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const getAvailableDates = (centre: PracticeCentre | null) => {
    if (!centre || !centre.sessionGroups) return [];
    const activeDays = new Set(centre.sessionGroups.flatMap(sg => sg.daysOfWeek?.map(d => d.toUpperCase()) || []));
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (activeDays.has(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()])) dates.push(d);
    }
    return dates;
  };
  
  const handleUpdateStatus = async (ticketId: string, status: number) => {
    if (!selectedCentre) return;
    try { await updatePatientQueueTicketStatus(ticketId, status); fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate!)); } catch {}
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0 || !selectedCentre) return;
    isEditingQueueRef.current = true;
    const newQueue = [...queue];
    const temp = newQueue[index - 1];
    newQueue[index - 1] = newQueue[index];
    newQueue[index] = temp;
    setQueue(newQueue);
    try {
      await reorderPatientQueue(newQueue.map(q => q.id));
    } catch {
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate!));
    } finally {
      isEditingQueueRef.current = false;
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= queue.length - 1 || !selectedCentre) return;
    isEditingQueueRef.current = true;
    const newQueue = [...queue];
    const temp = newQueue[index + 1];
    newQueue[index + 1] = newQueue[index];
    newQueue[index] = temp;
    setQueue(newQueue);
    try {
      await reorderPatientQueue(newQueue.map(q => q.id));
    } catch {
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate!));
    } finally {
      isEditingQueueRef.current = false;
    }
  };

  // Next/Back Logic
  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedCentre) { setError("Please select a practice centre"); return; }
    }
    if (activeStep === 1) {
      if (!selectedDate) { setError("Please select a date"); return; }
    }
    if (activeStep === 2) {
      if (!verifiedPatient) { setError("Please search and verify a patient"); return; }
    }
    setError(null);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeStep < 4) setActiveStep(activeStep + 1);
    else handleFinalSubmit();
  };

  const handleBack = () => {
    setError(null);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Only intercept if we are showing the inline Add Family form
    if (activeStep === 2 && showAddInlineForm) {
      setShowAddInlineForm(null);
      return;
    }
    
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  // --- Queue Grouping & Filtering ---
  const { groupedQueue, sessionFilters } = useMemo(() => {
    const grouped: Record<string, PatientQueueTicket[]> = {};
    const filters = new Set<string>();
    
    // Pre-populate with today's expected sessions
    daySessions.forEach(ds => {
      const label = ds.timeRange ? `${ds.label} (${ds.timeRange})` : ds.label;
      filters.add(label);
      grouped[label] = [];
    });

    queue.forEach(t => {
      let resolvedName = t.sessionName;
      if (!resolvedName && t.sessionId) {
        const sid = String(t.sessionId).toLowerCase();
        // Try to find in today's active sessions first
        const match = daySessions.find(ds => String(ds.id).toLowerCase() === sid || String(ds.groupId).toLowerCase() === sid);
        if (match) {
          resolvedName = match.timeRange ? `${match.label} (${match.timeRange})` : match.label;
        } else if (selectedCentre?.sessionGroups) {
          // Fallback: search all session groups in the centre
          for (const group of selectedCentre.sessionGroups) {
            if (String(group.id).toLowerCase() === sid) {
              resolvedName = `Scheduled Session (${group.daysOfWeek?.join(', ')})`;
              break;
            }
            const tbMatch = group.timeBlocks?.find(tb => String(tb.id).toLowerCase() === sid);
            if (tbMatch) {
              resolvedName = `${tbMatch.label || 'Session'} (${tbMatch.startTime} - ${tbMatch.endTime})`;
              break;
            }
          }
        }
      }
      const sName = resolvedName || 'Unassigned / Other';
      if (!grouped[sName]) grouped[sName] = [];
      grouped[sName].push(t);
      filters.add(sName);
    });

    return { groupedQueue: grouped, sessionFilters: ['ALL', ...Array.from(filters)] };
  }, [queue, daySessions, selectedCentre]);

  const filteredQueue = useMemo(() => {
    if (selectedSessionFilter === 'ALL') return queue;
    return groupedQueue[selectedSessionFilter] || [];
  }, [queue, groupedQueue, selectedSessionFilter]);

  // Set default session filter
  useEffect(() => {
    if (daySessions.length > 0) {
      const today = new Date();
      const isToday = selectedDate && selectedDate.toDateString() === today.toDateString();
      let defaultLabel = 'ALL';
      if (isToday) {
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const upcomingSessions = daySessions.filter(s => {
          if (!s.startTime) return true;
          const [h, m] = s.startTime.split(':').map(Number);
          return (h * 60 + (m || 0)) >= currentTime;
        });
        const target = upcomingSessions.length > 0 ? upcomingSessions[0] : daySessions[0];
        defaultLabel = target.timeRange ? `${target.label} (${target.timeRange})` : target.label;
      } else {
        const target = daySessions[0];
        defaultLabel = target.timeRange ? `${target.label} (${target.timeRange})` : target.label;
      }
      setSelectedSessionFilter(defaultLabel);
    } else {
      setSelectedSessionFilter('ALL');
    }
  }, [daySessions, selectedDate]);

  const renderQueueTable = () => {
    const groupsToRender = selectedSessionFilter === 'ALL' 
      ? Object.keys(groupedQueue) 
      : [selectedSessionFilter].filter(k => groupedQueue[k]);

    return (
      <Box>
        {groupsToRender.map(sessionName => {
          const tickets = groupedQueue[sessionName] || [];
          if (tickets.length === 0 && selectedSessionFilter === 'ALL') return null;

          return (
            <Box key={sessionName} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
                {sessionName} ({tickets.length} patients)
              </Typography>
              {tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic" pl={1}>No patients in this session yet.</Typography>
              ) : tickets.map((t) => {
                 // We need original index for handleMoveUp / handleMoveDown
                 const originalIndex = queue.findIndex(ticket => ticket.id === t.id);
               return (
                 <Card key={t.id} sx={{ mb: 1, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                       <Box display="flex" flexDirection="column">
                          <IconButton size="small" onClick={() => handleMoveUp(originalIndex)} disabled={originalIndex === 0}><KeyboardArrowUpIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => handleMoveDown(originalIndex)} disabled={originalIndex === queue.length - 1}><KeyboardArrowDownIcon fontSize="small" /></IconButton>
                       </Box>
                       <Box>
                         <Typography variant="subtitle1" fontWeight={700}>{t.patientName}</Typography>
                         <Typography variant="caption" color="text.secondary">{t.patientMobile}</Typography>
                       </Box>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip label={['Waiting','Ready','Called','In Consultation','Completed','Cancelled','No Show'][t.status] || 'Unknown'} size="small" />
                      {t.status === 0 && <Button size="small" variant="contained" color="secondary" onClick={() => handleUpdateStatus(t.id, 1)}>Ready</Button>}
                      {t.status === 1 && <Button size="small" variant="contained" color="info" onClick={() => handleUpdateStatus(t.id, 3)}>Start</Button>}
                      {t.status === 3 && <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(t.id, 4)}>Done</Button>}
                      {t.status < 4 && <IconButton size="small" color="error" onClick={() => handleUpdateStatus(t.id, 5)}><CloseIcon fontSize="small" /></IconButton>}
                    </Box>
                 </Card>
               );
            })}
          </Box>
        );
      })}
      </Box>
    );
  };

  const renderStepButtons = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: activeStep === 1 ? 2 : 0 }}>
       <Button 
         variant="outlined" 
         disabled={activeStep === 0 || submitting} 
         onClick={handleBack} 
         startIcon={<ArrowBackIcon />}
         sx={{ borderRadius: 8, px: {xs:2, md:4}, fontWeight: 700, textTransform: 'none', bgcolor: 'background.paper' }}
       >
          Back
       </Button>
       <Button 
         variant="contained" 
         color="primary" 
         onClick={handleNext} 
         disabled={submitting} 
         endIcon={activeStep < 4 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
         sx={{ borderRadius: 8, px: {xs:2, md:4}, fontWeight: 700, textTransform: 'none', boxShadow: 3 }}
       >
          {activeStep === 0 ? 'Next: Select Date' : 
           activeStep === 1 ? 'Next: Add Patient' : 
           activeStep === 2 ? 'Next: Select Session' : 
           activeStep === 3 ? 'Next: Confirm' : 
           (submitting ? 'Adding...' : 'Confirm')}
       </Button>
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Header - Hidden on Mobile */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', zIndex: 10, display: { xs: 'none', md: 'block' } }}>
        <AppBreadcrumbs />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="h5" fontWeight={800}>Patient Queue</Typography>
          {selectedCentre && (
            <Button
              variant="contained" color="primary" startIcon={<RecordVoiceOverIcon />}
              href={`https://storage.googleapis.com/note366-stt-frontend-dev/index.html?doctorId=${selectedCentre.doctorId}&practiceCentreId=${selectedCentre.id}`}
              target="_blank" rel="noopener noreferrer" sx={{ borderRadius: 2 }}
            >
              AI Consultation
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content Scrollable Area */}
      <Box ref={contentRef} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, pb: 10 }}>
        <LinearProgress variant="determinate" value={((activeStep + 1) / 5) * 100} sx={{ mb: 3, borderRadius: 2, height: 6 }} />
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* --- STEP 0: Select Centre --- */}
        {activeStep === 0 && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Card sx={{ p: 4, borderRadius: 3, border: '2px solid', borderColor: 'primary.main' }}>
               <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>Select Practice Centre</Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>Choose a centre to view its queue.</Typography>
               {loadingCentres ? <CircularProgress /> : (
               <Stack spacing={1.5}>
                 {practiceCentres.map(pc => (
                   <Card key={pc.id} component={ButtonBase} onClick={() => { setSelectedCentre(pc); setActiveStep(1); }}
                         sx={{ p: 2, textAlign: 'left', bgcolor: selectedCentre?.id === pc.id ? 'primary.light' : 'background.paper', 
                               color: selectedCentre?.id === pc.id ? 'primary.contrastText' : 'text.primary', borderRadius: 2 }}>
                      <Typography fontWeight={700}>{pc.clinicName}</Typography>
                      <Typography variant="caption">{pc.placeName}</Typography>
                   </Card>
                 ))}
               </Stack>
               )}
            </Card>
          </Box>
        )}

        {/* --- STEP 1: Date & Queue Layout (Grid) --- */}
        {activeStep === 1 && (
          <Grid container spacing={4}>
            {/* Left Panel: Date */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 2, border: '2px solid', borderColor: 'primary.main' }}>
                 <Typography variant="subtitle1" fontWeight={700} mb={2}>Select Visit Date</Typography>
                 {selectedCentre ? (
                   <CalendarPicker availableDates={availableDates} selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); }} />
                 ) : (
                   <Typography variant="body2" color="text.secondary">Please select a practice centre first.</Typography>
                 )}
              </Card>
              {activeStep === 1 && renderStepButtons()}
            </Grid>
            {/* Right Panel: Queue & Stats */}
            <Grid size={{ xs: 12, md: 8 }}>
               <Card sx={{ p: 3, height: '100%', opacity: selectedDate ? 1 : 0.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                     <Typography variant="h6" fontWeight={700}>
                        {selectedDate ? `Queue for ${formatDisplayDate(selectedDate)}` : 'Queue Overview'}
                     </Typography>
                     <IconButton onClick={() => fetchQueue(selectedCentre!.id, selectedCentre!.doctorId, formatDateLocal(selectedDate!))} disabled={!selectedDate}><RefreshIcon /></IconButton>
                  </Box>
                  {selectedDate && (
                    <Box mb={3}>
                      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
                        {sessionFilters.map(filter => (
                          <Chip 
                            key={filter} 
                            label={filter === 'ALL' ? 'Show All' : filter} 
                            onClick={() => setSelectedSessionFilter(filter)}
                            color={selectedSessionFilter === filter ? 'primary' : 'default'}
                            variant={selectedSessionFilter === filter ? 'filled' : 'outlined'}
                            sx={{ fontWeight: selectedSessionFilter === filter ? 700 : 500, cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{xs: 4}}><Box sx={{p: 2, bgcolor: 'primary.light', borderRadius: 2, textAlign: 'center'}}><Typography variant="h5" fontWeight={800}>{filteredQueue.filter(q=>q.status<=1).length}</Typography><Typography variant="caption">Waiting</Typography></Box></Grid>
                        <Grid size={{xs: 4}}><Box sx={{p: 2, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center'}}><Typography variant="h5" fontWeight={800}>{filteredQueue.filter(q=>q.status===2||q.status===3).length}</Typography><Typography variant="caption">Active</Typography></Box></Grid>
                        <Grid size={{xs: 4}}><Box sx={{p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center'}}><Typography variant="h5" fontWeight={800}>{filteredQueue.filter(q=>q.status===4).length}</Typography><Typography variant="caption">Done</Typography></Box></Grid>
                      </Grid>
                    </Box>
                  )}
                  {sessionFilters.length > 1 ? renderQueueTable() : <Typography color="text.secondary" textAlign="center" py={4}>No patients in queue yet.</Typography>}
               </Card>
            </Grid>
          </Grid>
        )}

        {/* --- STEP 2: Patient Search --- */}
        {activeStep === 2 && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
             <Card sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>Patient Search & Verification</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Enter patient's mobile number or search by details.</Typography>

                {!patientLookup && !verifiedPatient ? (
                  <Stack spacing={3}>
                    <Box display="flex" gap={1.5}>
                      <TextField fullWidth label="Mobile Number" placeholder="077 123 4567" value={patientMobile} onChange={(e) => setPatientMobile(e.target.value)} />
                      <Button variant="contained" onClick={handleMobileLookup} disabled={lookupLoading} startIcon={lookupLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}>Search</Button>
                    </Box>
                  </Stack>
                ) : !verifiedPatient && patientLookup ? (
                  <Stack spacing={3}>
                    <Typography variant="subtitle2" fontWeight={700}>Who is this consultation for?</Typography>
                    
                    {!showAddInlineForm && (
                      <Stack spacing={2}>
                        {patientLookup.primaryPatient && (
                          <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box><Typography fontWeight={700}>For Me ({patientLookup.primaryPatient.firstName})</Typography></Box>
                            <Button size="small" variant="contained" onClick={() => setVerifiedPatient(patientLookup.primaryPatient!)}>Select</Button>
                          </Card>
                        )}
                        {!patientLookup.primaryPatient && (
                          <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box><Typography fontWeight={700}>For Me (New Patient)</Typography></Box>
                            <Button size="small" variant="outlined" onClick={() => setShowAddInlineForm('myself')}>Add Details</Button>
                          </Card>
                        )}
                        
                        <Typography variant="subtitle2" fontWeight={700} mt={2}>Family Members</Typography>
                        
                        {(() => {
                          const adults = (patientLookup.familyMembers || []).filter((p: any) => {
                            const age = calculateAge(p.dateOfBirth);
                            return age === null || age >= 18;
                          });
                          const children = (patientLookup.familyMembers || []).filter((p: any) => {
                            const age = calculateAge(p.dateOfBirth);
                            return age !== null && age < 18;
                          });

                          return (
                            <>
                              {adults.length > 0 && (
                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block" mb={1}>Adults (18+)</Typography>
                                  <Stack spacing={1}>
                                    {adults.map((fm: any) => (
                                      <Card key={fm.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box><Typography fontWeight={700}>{fm.firstName} {fm.lastName}</Typography></Box>
                                        <Button size="small" variant="contained" onClick={() => setVerifiedPatient(fm)}>Select</Button>
                                      </Card>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {children.length > 0 && (
                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block" mb={1}>Children (Under 18)</Typography>
                                  <Stack spacing={1}>
                                    {children.map((fm: any) => (
                                      <Card key={fm.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box><Typography fontWeight={700}>{fm.firstName} {fm.lastName}</Typography></Box>
                                        <Button size="small" variant="contained" onClick={() => setVerifiedPatient(fm)}>Select</Button>
                                      </Card>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                              
                              {(patientLookup.familyMembers || []).length === 0 && (
                                 <Typography variant="body2" color="text.secondary" fontStyle="italic">No other family members found.</Typography>
                              )}
                            </>
                          );
                        })()}
                        
                        <Button color="secondary" onClick={() => setShowAddInlineForm('family')} startIcon={<AddIcon />}>Add Family Member</Button>
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

                    <Button size="small" onClick={() => setPatientLookup(null)} sx={{ alignSelf: 'flex-start' }}>← Try a different number</Button>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    <Card sx={{ p: 2.5, bgcolor: 'rgba(143, 0, 255, 0.04)', border: '1px solid', borderColor: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />
                        <Box>
                          <Typography fontWeight={800}>{verifiedPatient?.firstName} {verifiedPatient?.lastName}</Typography>
                          <Typography variant="caption">Mobile: {verifiedPatient?.mobileNumber}</Typography>
                        </Box>
                      </Box>
                      <Button size="small" onClick={() => setVerifiedPatient(null)}>Change</Button>
                    </Card>
                  </Stack>
                )}
             </Card>
          </Box>
        )}

        {/* --- STEP 3: Session & Priority --- */}
        {activeStep === 3 && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Card sx={{ p: 4, borderRadius: 3 }}>
               <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>Session & Priority</Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>Select the session time slot and priority level.</Typography>
               <Stack spacing={4}>
                  <Box>
                     <Typography variant="subtitle2" fontWeight={700} mb={2}>Select Session</Typography>
                     <RadioGroup value={targetSessionId} onChange={e => setTargetSessionId(e.target.value)}>
                        {daySessions.map(s => (
                           <Card key={s.id} variant="outlined" sx={{ mb: 1, p: 1, borderColor: targetSessionId === s.id ? 'primary.main' : 'divider', bgcolor: targetSessionId === s.id ? 'primary.light' : 'transparent' }}>
                              <FormControlLabel value={s.id} control={<Radio />} label={`${s.label} (${s.timeRange})`} sx={{ width: '100%', m: 0 }} />
                           </Card>
                        ))}
                     </RadioGroup>
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" fontWeight={700} mb={2}>Ticket Priority</Typography>
                     <RadioGroup row value={priority} onChange={e => setPriority(Number(e.target.value))}>
                        <FormControlLabel value={0} control={<Radio />} label="Normal" />
                        <FormControlLabel value={1} control={<Radio color="warning" />} label="High" />
                        <FormControlLabel value={2} control={<Radio color="error" />} label="Emergency" />
                     </RadioGroup>
                  </Box>
               </Stack>
            </Card>
          </Box>
        )}

        {/* --- STEP 4: Confirm --- */}
        {activeStep === 4 && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Card sx={{ p: 4, borderRadius: 3 }}>
               <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>Confirm Queue Ticket</Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>Verify details before adding to queue.</Typography>
               <Card variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Stack spacing={2}>
                     <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Centre</Typography><Typography fontWeight={700}>{selectedCentre?.clinicName}</Typography></Box>
                     <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Date</Typography><Typography fontWeight={700}>{selectedDate && formatDisplayDateLong(selectedDate)}</Typography></Box>
                     <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Patient</Typography><Typography fontWeight={700} color="primary.main">{verifiedPatient?.firstName} {verifiedPatient?.lastName}</Typography></Box>
                     <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Session</Typography><Typography fontWeight={700}>{daySessions.find(s=>s.id===targetSessionId)?.label || 'Any'}</Typography></Box>
                     <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Priority</Typography><Chip label={priority === 2 ? 'Emergency' : priority === 1 ? 'High' : 'Normal'} size="small" color={priority === 2 ? 'error' : priority === 1 ? 'warning' : 'primary'} /></Box>
                  </Stack>
               </Card>
            </Card>
          </Box>
        )}
      </Box>

      {/* Fixed Footer */}
      {activeStep !== 1 && (
        <Paper elevation={6} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', justifyContent: 'space-between', zIndex: 1200, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
           {renderStepButtons()}
        </Paper>
      )}

      <OtpVerificationDialog open={openOtpDialog} onClose={() => setOpenOtpDialog(false)} maskedMobile={maskedMobile} sessionId={otpSessionId} onVerified={handleOtpVerified} onVerifyOtp={verifyPatientOtp} onResendOtp={resendPatientOtp} />
    </Box>
  );
};
