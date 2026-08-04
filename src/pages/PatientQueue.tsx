import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  ButtonBase,
  Stack,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppBreadcrumbs } from '../components/AppBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import StarRateIcon from '@mui/icons-material/StarRate';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { httpClient } from '../api/httpClient';
import {
  getPatientQueue,
  addPatientQueueTicket,
  updatePatientQueueTicketStatus,
  reorderPatientQueue,
  getPatientByMobile,
  searchPatients,
  updatePatientMobile,
  sendPatientOtp,
  verifyPatientOtp,
  resendPatientOtp,
  type PatientQueueTicket,
  type Patient
} from '../features/patient-queue/patientQueueApi';
import { isValidLkMobile, normalizeLkMobile } from '../utils/lkPhoneValidation';
import { formatDisplayDate, formatDisplayDateLong } from '../utils/dateUtils';
import { FamilyPatientSelector } from '../features/patients/FamilyPatientSelector';
import { AddChildModal } from '../features/patients/AddChildModal';
import { OtpVerificationDialog } from '../components/OtpVerificationDialog';

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

const getCalendarDays = (viewDate: Date) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  
  // Total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const days: (Date | null)[] = [];
  
  // Padding for empty days at start of grid
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

const CalendarPicker = ({
  availableDates,
  selectedDate,
  onSelectDate
}: {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 27);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getCalendarDays(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Check if prev/next month navigation should be disabled
  const showPrev = currentMonth.getFullYear() > today.getFullYear() || currentMonth.getMonth() > today.getMonth();
  const showNext = currentMonth.getFullYear() < maxDate.getFullYear() || currentMonth.getMonth() < maxDate.getMonth();

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={handlePrevMonth} disabled={!showPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton size="small" onClick={handleNextMonth} disabled={!showNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={1} columns={7} sx={{ textAlign: 'center', mb: 1 }}>
        {weekDays.map(wd => (
          <Grid key={wd} size={1}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {wd}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1} columns={7} sx={{ textAlign: 'center' }}>
        {days.map((day, idx) => {
          if (!day) {
            return <Grid key={`empty-${idx}`} size={1} />;
          }

          const dayReset = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const isWithinWindow = dayReset >= today && dayReset <= maxDate;
          const isAvailable = availableDates.some(ad => ad.toDateString() === dayReset.toDateString());
          const isSelectable = isWithinWindow && isAvailable;
          const isSelected = selectedDate && dayReset.toDateString() === selectedDate.toDateString();

          return (
            <Grid key={day.toISOString()} size={1}>
              <ButtonBase
                onClick={() => isSelectable && onSelectDate(dayReset)}
                disabled={!isSelectable}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected 
                    ? 'primary.main' 
                    : isSelectable 
                      ? 'rgba(143, 0, 255, 0.12)' 
                      : 'transparent',
                  color: isSelected 
                    ? '#ffffff' 
                    : isSelectable 
                      ? 'primary.main' 
                      : 'text.disabled',
                  opacity: isSelectable ? 1 : 0.4,
                  '&:hover': {
                    bgcolor: isSelected 
                      ? 'primary.dark' 
                      : isSelectable 
                        ? 'rgba(143, 0, 255, 0.22)' 
                        : 'transparent',
                  },
                  transition: 'all 0.2s'
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

export const PatientQueue = () => {
  const [practiceCentres, setPracticeCentres] = useState<PracticeCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PracticeCentre | null>(null);
  const [queue, setQueue] = useState<PatientQueueTicket[]>([]);


  
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog / Modal State
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [patientMobile, setPatientMobile] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Enhanced Queue dialog states
  const [dialogMode, setDialogMode] = useState<'input' | 'verify' | 'select' | 'notFound'>('input');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchNic, setSearchNic] = useState('');
  const [primaryPatientRecord, setPrimaryPatientRecord] = useState<Patient | null>(null);
  const [verifiedChildren, setVerifiedChildren] = useState<Patient[]>([]);
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [openAddChildModal, setOpenAddChildModal] = useState(false);

  const [openOtpDialogQueue, setOpenOtpDialogQueue] = useState(false);
  const [otpSessionIdQueue, setOtpSessionIdQueue] = useState<string>('');
  const [maskedMobileQueue, setMaskedMobileQueue] = useState<string>('');
  const [pendingMobileQueue, setPendingMobileQueue] = useState<string>('');

  const handleOtpVerifiedQueue = async (verificationToken: string) => {
    try {
      setVerificationLoading(true);
      const lookupResult = await getPatientByMobile(pendingMobileQueue, verificationToken);
      if (lookupResult) {
        setPrimaryPatientRecord(lookupResult.primaryPatient);
        setVerifiedChildren(lookupResult.children || []);
        setVerifiedPatient(lookupResult.primaryPatient);
        setDialogMode('verify');
      } else {
        setDialogMode('notFound');
      }
    } catch (err: any) {
      setAddError(err.response?.data?.detail || err.message || 'Failed to load patient after OTP verification.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Future Booking Date states
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
  const [targetSessionId, setTargetSessionId] = useState<string>('');

  // Compute active sessions for the selected date
  const daySessions = useMemo<DaySessionInfo[]>(() => {
    if (!selectedDate || !selectedCentre?.sessionGroups) return [];
    const dayAbbr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][selectedDate.getDay()];
    const sessions: DaySessionInfo[] = [];

    selectedCentre.sessionGroups.forEach((group) => {
      const isDayActive = group.daysOfWeek?.some(d => d.toUpperCase() === dayAbbr);
      if (isDayActive) {
        if (group.timeBlocks && group.timeBlocks.length > 0) {
          group.timeBlocks.forEach((tb) => {
            sessions.push({
              id: tb.id || group.id || '',
              groupId: group.id || '',
              label: tb.label || 'Session',
              timeRange: `${tb.startTime} - ${tb.endTime}`,
              startTime: tb.startTime,
              endTime: tb.endTime,
            });
          });
        } else {
          sessions.push({
            id: group.id || '',
            groupId: group.id || '',
            label: 'Scheduled Session',
            timeRange: group.daysOfWeek.join(', '),
            startTime: '',
            endTime: '',
          });
        }
      }
    });

    return sessions;
  }, [selectedDate, selectedCentre]);

  // Helper to filter tickets per session
  const getSessionTickets = (sessionId: string): PatientQueueTicket[] => {
    if (!sessionId || sessionId === 'ALL') return queue;
    const sessionIndex = daySessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return queue;

    const targetSession = daySessions[sessionIndex];

    return queue.filter((t, idx) => {
      // 1. Direct match with TimeBlock ID or SessionGroup ID
      if (t.sessionId) {
        if (t.sessionId === targetSession.id) {
          return true;
        }

        if (targetSession.groupId && t.sessionId === targetSession.groupId) {
          const groupSessions = daySessions.filter(s => s.groupId === targetSession.groupId);
          const subIndex = groupSessions.findIndex(s => s.id === targetSession.id);
          if (subIndex !== -1 && idx % groupSessions.length === subIndex) {
            return true;
          }
        }

        const matchesOtherSession = daySessions.some(s => s.id === t.sessionId);
        if (matchesOtherSession) {
          return false;
        }
      }

      // 2. Fallback for tickets with null/unmatched sessionId: round-robin across daySessions
      return idx % daySessions.length === sessionIndex;
    });
  };

  const getDayString = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAvailableDates = (centre: PracticeCentre | null): Date[] => {
    if (!centre || !centre.sessionGroups || centre.sessionGroups.length === 0) return [];
    
    const activeDays = new Set<string>();
    centre.sessionGroups.forEach(sg => {
      if (sg.daysOfWeek) {
        sg.daysOfWeek.forEach(d => activeDays.add(d.toUpperCase()));
      }
    });

    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const dayStr = getDayString(d);
      if (activeDays.has(dayStr)) {
        dates.push(d);
      }
    }
    
    return dates;
  };

  // Load Practice Centres on mount
  useEffect(() => {
    fetchPracticeCentres();
  }, []);

  // Update available dates when selected practice centre changes
  useEffect(() => {
    if (selectedCentre) {
      const dates = getAvailableDates(selectedCentre);
      setAvailableDates(dates);
      if (dates.length > 0) {
        const currentSelectedDateStr = selectedDate ? formatDateLocal(selectedDate) : null;
        const isStillAvailable = dates.some(d => formatDateLocal(d) === currentSelectedDateStr);
        if (!isStillAvailable) {
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

  // Fetch queue & subscribe to real-time SignalR push notifications + 5s polling fallback
  useEffect(() => {
    if (!selectedCentre || !selectedDate) {
      setQueue([]);
      return;
    }

    const dateStr = formatDateLocal(selectedDate);
    fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);

    // 1. Setup 5-second polling interval fallback
    const intervalId = setInterval(() => {
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
    }, 5000);

    // 2. Setup SignalR WebSocket connection for instant zero-latency push updates
    const apiBase = httpClient.defaults.baseURL || 'https://practice121-api-687271578749.asia-southeast1.run.app';
    const hubUrl = `${apiBase.replace(/\/$/, '')}/api/hubs/patient-queue`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.invoke('JoinQueueGroup', selectedCentre.id).catch(() => {});
        connection.on('QueueUpdated', (data: any) => {
          if (!data || !data.practiceCentreId || String(data.practiceCentreId).toLowerCase() === String(selectedCentre.id).toLowerCase()) {
            fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
          }
        });
      })
      .catch(() => {});

    return () => {
      clearInterval(intervalId);
      if (connection.state === HubConnectionState.Connected) {
        connection.invoke('LeaveQueueGroup', selectedCentre.id).catch(() => {});
        connection.stop().catch(() => {});
      }
    };
  }, [selectedCentre, selectedDate]);

  // Handle registeredMobile redirect callback from patient registration
  useEffect(() => {
    const registeredMobile = searchParams.get('registeredMobile');
    if (registeredMobile) {
      setPatientMobile(registeredMobile);
      setOpenAddModal(true);
      // Clean up url parameters
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('registeredMobile');
      setSearchParams(newParams, { replace: true });
      
      // Fetch and verify immediately
      checkAndVerifyPatient(registeredMobile);
    }
  }, [searchParams]);

  const fetchPracticeCentres = async () => {
    try {
      setLoadingCentres(true);
      setError(null);
      const res = await httpClient.get<PracticeCentre[]>('/api/practice-centres');
      setPracticeCentres(res.data);
      if (res.data.length > 0) {
        const savedCentreId = localStorage.getItem('selectedPracticeCentreId');
        const found = savedCentreId ? res.data.find(pc => pc.id === savedCentreId) : null;
        const initial = found || res.data[0];
        setSelectedCentre(initial);
        localStorage.setItem('selectedPracticeCentreId', initial.id);
      } else {
        setSelectedCentre(null);
      }
    } catch (err: any) {
      setError(err.userFriendlyMessage || err.message || 'Failed to load practice centres');
    } finally {
      setLoadingCentres(false);
    }
  };

  const handleSelectCentre = (centre: PracticeCentre) => {
    setSelectedCentre(centre);
    localStorage.setItem('selectedPracticeCentreId', centre.id);
  };

  const fetchQueue = async (centreId: string, doctorId?: string, visitDate?: string) => {
    try {
      setLoadingQueue(true);
      setError(null);
      const data = await getPatientQueue(centreId, doctorId, visitDate);
      setQueue(data);
    } catch (err: any) {
      setError(err.userFriendlyMessage || err.message || 'Failed to load patient queue');
    } finally {
      setLoadingQueue(false);
    }
  };

  const refreshQueue = () => {
    if (selectedCentre && selectedDate) {
      const dateStr = formatDateLocal(selectedDate);
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
    }
  };

  const checkAndVerifyPatient = async (mobile: string) => {
    try {
      setVerificationLoading(true);
      setAddError(null);
      
      const trimmedMobile = mobile.trim();
      const hasMobile = !!trimmedMobile;
      const hasAdvancedSearchTerms = searchFirstName.trim() || searchLastName.trim() || searchNic.trim();

      if (!hasMobile && !hasAdvancedSearchTerms) {
        setAddError('Patient Mobile Number is required or fill at least one Advanced Search field.');
        return;
      }

      // 1. Check if patient exists by mobile number if provided
      if (hasMobile) {
        if (!isValidLkMobile(trimmedMobile)) {
          setAddError('Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567).');
          return;
        }
        const normalizedMobile = normalizeLkMobile(trimmedMobile) ?? trimmedMobile;
        const otpSendRes = await sendPatientOtp(normalizedMobile);
        if (otpSendRes.patientExists && otpSendRes.sessionId) {
          setOtpSessionIdQueue(otpSendRes.sessionId);
          setMaskedMobileQueue(otpSendRes.maskedMobile || normalizedMobile);
          setPendingMobileQueue(normalizedMobile);
          setOpenOtpDialogQueue(true);
          return;
        }
        if (!hasAdvancedSearchTerms) {
          setDialogMode('notFound');
          return;
        }
      }
      
      // 2. If not exists or no mobile provided, check if advanced search parameters were provided
      if (hasAdvancedSearchTerms) {
        const results = await searchPatients({
          firstName: searchFirstName.trim(),
          lastName: searchLastName.trim(),
          nicNumber: searchNic.trim()
        });
        
        if (results.length > 0) {
          setSearchResults(results);
          setDialogMode('select');
          return;
        }
      }
      
      // 3. Otherwise, set mode to notFound
      setDialogMode('notFound');
      
    } catch (err: any) {
      console.error(err);
      setAddError(err.response?.data?.detail || err.message || 'Failed to verify patient');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    try {
      setVerificationLoading(true);
      setAddError(null);
      
      const newMobile = normalizeLkMobile(patientMobile) ?? patientMobile.trim();
      let updatedPatient = patient;
      if (newMobile && newMobile !== patient.mobileNumber) {
        // Update mobile in database to link
        await updatePatientMobile(patient.id, newMobile);
        updatedPatient = { ...patient, mobileNumber: newMobile };
      }
      setPrimaryPatientRecord(updatedPatient);
      setVerifiedChildren([]);
      setVerifiedPatient(updatedPatient);
      setDialogMode('verify');
    } catch (err: any) {
      console.error(err);
      setAddError(err.response?.data?.detail || err.message || 'Failed to link patient');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setPatientMobile('');
    setPriority(0);
    setDialogMode('input');
    setShowAdvanced(false);
    setSearchFirstName('');
    setSearchLastName('');
    setSearchNic('');
    setPrimaryPatientRecord(null);
    setVerifiedChildren([]);
    setVerifiedPatient(null);
    setSearchResults([]);
    setAddError(null);
    setOpenAddChildModal(false);
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentre || !verifiedPatient) return;

    try {
      setSubmitting(true);
      setAddError(null);

      // Client-side duplicate check for the same session
      const targetSessionTickets = targetSessionId ? getSessionTickets(targetSessionId) : queue;
      const isAlreadyInSession = targetSessionTickets.some(t => {
        if (t.status >= 4) return false; // Completed, Cancelled, No Show allowed
        if (verifiedPatient.id && t.patientId) {
          return t.patientId === verifiedPatient.id;
        }
        return false;
      });

      if (isAlreadyInSession) {
        const patientDisplayName = `${verifiedPatient.firstName} ${verifiedPatient.lastName || ''}`.trim();
        setAddError(`Patient (${patientDisplayName}) is already in the queue for this session.`);
        setSubmitting(false);
        return;
      }

      await addPatientQueueTicket({
        patientMobile: primaryPatientRecord?.mobileNumber || verifiedPatient.mobileNumber,
        patientId: verifiedPatient.id,
        doctorId: selectedCentre.doctorId,
        practiceCentreId: selectedCentre.id,
        priority: priority,
        visitDate: selectedDate ? formatDateLocal(selectedDate) : undefined,
        sessionId: targetSessionId || (selectedSessionId !== 'ALL' ? selectedSessionId : undefined)
      });
      handleCloseAddModal();
      refreshQueue();
    } catch (err: any) {
      console.error(err);
      setAddError(err.userFriendlyMessage || err.response?.data?.detail || err.message || 'Failed to add patient to queue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: number) => {
    if (!selectedCentre) return;
    try {
      setError(null);
      await updatePatientQueueTicketStatus(ticketId, newStatus);
      refreshQueue();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update ticket status');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedQueue = [...queue];
    const [draggedItem] = reorderedQueue.splice(draggedIndex, 1);
    reorderedQueue.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setQueue(reorderedQueue);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    setDraggedIndex(null);
    
    try {
      const ticketIds = queue.map(t => t.id);
      await reorderPatientQueue(ticketIds);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to persist queue order');
    }
  };

  const handleMoveUp = async (ticketIndex: number, currentList: PatientQueueTicket[]) => {
    if (ticketIndex <= 0) return;
    const itemToMove = currentList[ticketIndex];
    const prevItem = currentList[ticketIndex - 1];

    const mainIndex = queue.findIndex(t => t.id === itemToMove.id);
    const mainPrevIndex = queue.findIndex(t => t.id === prevItem.id);
    if (mainIndex === -1 || mainPrevIndex === -1) return;

    const newQueue = [...queue];
    const [moved] = newQueue.splice(mainIndex, 1);
    newQueue.splice(mainPrevIndex, 0, moved);

    setQueue(newQueue);
    try {
      await reorderPatientQueue(newQueue.map(t => t.id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reorder queue');
    }
  };

  const handleMoveDown = async (ticketIndex: number, currentList: PatientQueueTicket[]) => {
    if (ticketIndex >= currentList.length - 1) return;
    const itemToMove = currentList[ticketIndex];
    const nextItem = currentList[ticketIndex + 1];

    const mainIndex = queue.findIndex(t => t.id === itemToMove.id);
    const mainNextIndex = queue.findIndex(t => t.id === nextItem.id);
    if (mainIndex === -1 || mainNextIndex === -1) return;

    const newQueue = [...queue];
    const [moved] = newQueue.splice(mainIndex, 1);
    newQueue.splice(mainNextIndex, 0, moved);

    setQueue(newQueue);
    try {
      await reorderPatientQueue(newQueue.map(t => t.id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reorder queue');
    }
  };

  const getPriorityChip = (prio: number) => {
    switch (prio) {
      case 2: // Emergency
        return <Chip label="Emergency" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
      case 1: // High
        return <Chip label="High" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
      default: // Normal
        return <Chip label="Normal" color="default" size="small" />;
    }
  };

  const getStatusChip = (status: number) => {
    switch (status) {
      case 0:
        return <Chip label="Waiting" color="primary" variant="outlined" size="small" />;
      case 1:
        return <Chip label="Ready" color="secondary" variant="outlined" size="small" />;
      case 2:
        return <Chip label="Called" color="warning" sx={{ color: '#fff', fontWeight: 'bold' }} size="small" />;
      case 3:
        return <Chip label="In Consultation" color="info" size="small" />;
      case 4:
        return <Chip label="Completed" color="success" size="small" />;
      case 5:
        return <Chip label="Cancelled" color="error" size="small" />;
      case 6:
        return <Chip label="No Show" variant="outlined" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  const renderQueueList = (ticketsList: PatientQueueTicket[]) => (
    <Box sx={{ width: '100%' }}>
      {/* Mobile Touch-Friendly Card View (< 900px / md) */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {ticketsList.map((ticket, index) => (
          <Card
            key={ticket.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              borderColor: 'divider',
              backgroundColor: draggedIndex === index ? 'action.hover' : 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Touch-Friendly Move Up/Down Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'action.hover', borderRadius: 2, p: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index, ticketsList)}
                    disabled={index === 0}
                    sx={{ p: 0.25 }}
                    title="Move Up"
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index, ticketsList)}
                    disabled={index === ticketsList.length - 1}
                    sx={{ p: 0.25 }}
                    title="Move Down"
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Chip
                  label={`#${index + 1}`}
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '1rem', height: 32, px: 0.5 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {ticket.patientName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.patientMobile}
                  </Typography>
                </Box>
              </Box>

              <Box>{getPriorityChip(ticket.priority)}</Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box>{getStatusChip(ticket.status)}</Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {ticket.status === 0 && (
                  <IconButton color="secondary" size="small" onClick={() => handleUpdateStatus(ticket.id, 1)}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                )}
                {(ticket.status === 0 || ticket.status === 1) && (
                  <IconButton color="warning" size="small" onClick={() => handleUpdateStatus(ticket.id, 2)}>
                    <RecordVoiceOverIcon fontSize="small" />
                  </IconButton>
                )}
                {ticket.status === 2 && (
                  <IconButton color="info" size="small" onClick={() => handleUpdateStatus(ticket.id, 3)}>
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                )}
                {ticket.status === 3 && (
                  <IconButton color="success" size="small" onClick={() => handleUpdateStatus(ticket.id, 4)}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                )}
                {ticket.status < 4 && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.75rem', borderRadius: 2 }}
                      onClick={() => handleUpdateStatus(ticket.id, 6)}
                    >
                      No Show
                    </Button>
                    <IconButton color="error" size="small" onClick={() => handleUpdateStatus(ticket.id, 5)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Desktop Table View (>= 900px / md) */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, boxShadow: 'none', background: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80, fontWeight: 700 }}>Arrange</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketsList.map((ticket, index) => (
              <TableRow
                key={ticket.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: draggedIndex === index ? 0.5 : 1,
                  backgroundColor: draggedIndex === index ? 'rgba(0,0,0,0.05)' : 'inherit',
                  transition: 'opacity 0.2s, background-color 0.2s',
                }}
              >
                <TableCell sx={{ width: 80 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(index, ticketsList)}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(index, ticketsList)}
                      disabled={index === ticketsList.length - 1}
                      title="Move Down"
                    >
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  #{index + 1}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{ticket.patientName}</TableCell>
                <TableCell>{ticket.patientMobile}</TableCell>
                <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                <TableCell>{getStatusChip(ticket.status)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {ticket.status === 0 && (
                      <Tooltip title="Mark Ready">
                        <IconButton color="secondary" onClick={() => handleUpdateStatus(ticket.id, 1)}>
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(ticket.status === 0 || ticket.status === 1) && (
                      <Tooltip title="Call Patient">
                        <IconButton color="warning" onClick={() => handleUpdateStatus(ticket.id, 2)}>
                          <RecordVoiceOverIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {ticket.status === 2 && (
                      <Tooltip title="Start Consultation">
                        <IconButton color="info" onClick={() => handleUpdateStatus(ticket.id, 3)}>
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {ticket.status === 3 && (
                      <Tooltip title="Complete Consultation">
                        <IconButton color="success" onClick={() => handleUpdateStatus(ticket.id, 4)}>
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {ticket.status < 4 && (
                      <>
                        <Tooltip title="No Show">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ textTransform: 'none', px: 1, py: 0.5, borderRadius: 2 }}
                            onClick={() => handleUpdateStatus(ticket.id, 6)}
                          >
                            No Show
                          </Button>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton color="error" onClick={() => handleUpdateStatus(ticket.id, 5)}>
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Calculate statistics
  const waitingCount = queue.filter(q => q.status === 0 || q.status === 1).length;
  const activeCount = queue.filter(q => q.status === 2 || q.status === 3).length;
  const completedCount = queue.filter(q => q.status === 4).length;

  return (
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'background.default' }}>
      <AppBreadcrumbs />
      {/* Top Header Card */}
      <Box className="glass-card" sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Patient Queue
          </Typography>
        </Box>

        {selectedCentre && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RecordVoiceOverIcon />}
              href={`https://storage.googleapis.com/note366-stt-frontend-dev/index.html?doctorId=${selectedCentre.doctorId}&practiceCentreId=${selectedCentre.id}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 700, borderRadius: 3, px: 2.5, py: 1, textTransform: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              Start AI Consultation
            </Button>
            <Button
              onClick={refreshQueue}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{ fontWeight: 700, borderRadius: 3, px: 2 }}
            >
              Refresh Queue
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loadingCentres ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : practiceCentres.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No practice centres available. Please create a practice centre from Doctor's Settings first.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {/* Controls & Stats */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      Select Practice Centre
                    </Typography>
                    {practiceCentres.length > 1 && (
                      <Chip
                        label={`${practiceCentres.length} Centres`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      maxHeight: practiceCentres.length > 3 ? 320 : 'none',
                      overflowY: practiceCentres.length > 3 ? 'auto' : 'visible',
                      pr: practiceCentres.length > 3 ? 0.5 : 0,
                    }}
                  >
                    {practiceCentres.map((pc) => {
                      const isSelected = selectedCentre?.id === pc.id;
                      return (
                        <Card
                          key={pc.id}
                          component={ButtonBase}
                          onClick={() => handleSelectCentre(pc)}
                          variant="outlined"
                          sx={{
                            width: '100%',
                            p: 2,
                            borderRadius: 3,
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'all 0.25s ease-in-out',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            borderWidth: isSelected ? 2 : 1,
                            bgcolor: isSelected
                              ? 'rgba(143, 0, 255, 0.06)'
                              : 'background.paper',
                            boxShadow: isSelected
                              ? '0 4px 16px rgba(143, 0, 255, 0.12)'
                              : '0 2px 6px rgba(0,0,0,0.02)',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : 'primary.light',
                              bgcolor: isSelected
                                ? 'rgba(143, 0, 255, 0.09)'
                                : 'action.hover',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  bgcolor: isSelected ? 'primary.main' : 'rgba(143, 0, 255, 0.1)',
                                  color: isSelected ? '#ffffff' : 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                }}
                              >
                                <MedicalServicesIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    color: isSelected ? 'primary.main' : 'text.primary',
                                  }}
                                >
                                  {pc.clinicName}
                                </Typography>
                                {pc.placeName && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                      {pc.placeName} {pc.districtName ? `• ${pc.districtName}` : ''}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>

                            {isSelected ? (
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
                              />
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  px: 1.5,
                                  py: 0.25,
                                  fontSize: '0.75rem',
                                  borderColor: 'divider',
                                  color: 'text.secondary',
                                  pointerEvents: 'none',
                                }}
                              >
                                Select
                              </Button>
                            )}
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>

                {selectedCentre && availableDates.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      Select Visit Date
                    </Typography>
                    <CalendarPicker
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                  </Box>
                )}

                {selectedCentre && availableDates.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    Doctor has no schedule set on any day of week in the next 4 weeks. Go to settings to set availability.
                  </Alert>
                )}

                {/* Queue Statistics */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    {selectedDate && selectedDate.toDateString() === new Date().toDateString() 
                      ? "Today's Statistics" 
                      : `Statistics for ${formatDisplayDate(selectedDate)}`}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(143, 0, 255, 0.08)', borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#8F00FF' }}>
                          {waitingCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Waiting</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(255, 145, 0, 0.08)', borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'warning.main' }}>
                          {activeCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Active</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(46, 125, 50, 0.08)', borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                          {completedCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Done</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Button
                  onClick={() => setOpenAddModal(true)}
                  variant="contained"
                  className="gradient-primary-btn"
                  fullWidth
                  disabled={!selectedCentre || !selectedDate}
                  startIcon={<AddIcon />}
                  sx={{ py: 1.5, mt: 2 }}
                >
                  Add Patient to Queue
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Queue List Table */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card className="glass-card" sx={{ p: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Patient Queue - {selectedDate ? formatDisplayDateLong(selectedDate) : ''}
                </Typography>

                {daySessions.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1} sx={{ letterSpacing: 0.5 }}>
                      SCHEDULED SESSIONS
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      <Chip
                        label={`All Sessions (${queue.length})`}
                        color={selectedSessionId === 'ALL' ? 'primary' : 'default'}
                        variant={selectedSessionId === 'ALL' ? 'filled' : 'outlined'}
                        onClick={() => setSelectedSessionId('ALL')}
                        sx={{ fontWeight: 700, borderRadius: 3, cursor: 'pointer' }}
                      />
                      {daySessions.map((session: DaySessionInfo) => {
                        const sessTickets = getSessionTickets(session.id);
                        const isSelected = selectedSessionId === session.id;
                        return (
                          <Chip
                            key={session.id}
                            icon={<AccessTimeIcon fontSize="small" />}
                            label={`${session.label} (${session.timeRange}) • ${sessTickets.length} Patients`}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            onClick={() => setSelectedSessionId(session.id)}
                            sx={{ fontWeight: 700, borderRadius: 3, cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {loadingQueue ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : queue.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">
                      No patients in the queue for this date.
                    </Typography>
                  </Box>
                ) : selectedSessionId === 'ALL' && daySessions.length > 1 ? (
                  <Stack spacing={3}>
                    {daySessions.map((session: DaySessionInfo) => {
                      const sessTickets = getSessionTickets(session.id);
                      return (
                        <Paper key={session.id} variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon color="primary" fontSize="small" />
                              <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                                {session.label} ({session.timeRange})
                              </Typography>
                            </Box>
                            <Chip label={`${sessTickets.length} Patients`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                          </Box>

                          {sessTickets.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" py={2}>
                              No patients in queue for this session.
                            </Typography>
                          ) : (
                            renderQueueList(sessTickets)
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  renderQueueList(selectedSessionId === 'ALL' ? queue : getSessionTickets(selectedSessionId))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Queue Ticket Dialog Modal */}
      {/* Add Queue Ticket Dialog Modal */}
      <Dialog
        open={openAddModal}
        onClose={handleCloseAddModal}
        PaperProps={{ sx: { borderRadius: 4, p: 2, minWidth: 450, maxWidth: 600 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {dialogMode === 'input' && "Add Patient to Queue"}
          {dialogMode === 'verify' && "Verify Patient Details"}
          {dialogMode === 'select' && "Select Matching Patient"}
          {dialogMode === 'notFound' && "Patient Not Found"}
        </DialogTitle>
        
        {dialogMode === 'input' && (
          <form onSubmit={(e) => { e.preventDefault(); checkAndVerifyPatient(patientMobile); }}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              {addError && <Alert severity="error">{addError}</Alert>}
              <TextField
                label="Patient Mobile Number"
                variant="outlined"
                fullWidth
                value={patientMobile}
                onChange={(e) => setPatientMobile(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SettingsPhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }
                }}
              />
              
              <Button
                variant="text"
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
              >
                {showAdvanced ? "Hide Advanced Search" : "Use Advanced Search (If phone number changed)"}
              </Button>

              {showAdvanced && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px dashed #ccc', borderRadius: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Advanced Search (Optional)
                  </Typography>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={searchFirstName}
                    onChange={(e) => setSearchFirstName(e.target.value)}
                  />
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={searchLastName}
                    onChange={(e) => setSearchLastName(e.target.value)}
                  />
                  <TextField
                    label="NIC Number"
                    variant="outlined"
                    fullWidth
                    value={searchNic}
                    onChange={(e) => setSearchNic(e.target.value)}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseAddModal} variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="gradient-primary-btn"
                disabled={verificationLoading}
                sx={{ px: 3 }}
              >
                {verificationLoading ? <CircularProgress size={24} /> : 'Check Patient'}
              </Button>
            </DialogActions>
          </form>
        )}

        {dialogMode === 'verify' && (
          <form onSubmit={handleAddTicket}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              {addError && <Alert severity="error">{addError}</Alert>}
              
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Patient record found. Select who this appointment/queue ticket is for:
              </Alert>

              {primaryPatientRecord ? (
                <FamilyPatientSelector
                  primaryPatient={primaryPatientRecord}
                  children={verifiedChildren}
                  selectedPatientId={verifiedPatient?.id || primaryPatientRecord.id}
                  onSelectPatient={(p) => setVerifiedPatient(p)}
                  onOpenAddChild={() => setOpenAddChildModal(true)}
                />
              ) : (
                <Card sx={{ bgcolor: '#f8f9fa', borderRadius: 3, boxShadow: 'none', border: '1px solid #e9ecef', p: 2 }}>
                  <CardContent sx={{ p: '8px !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {verifiedPatient?.firstName} {verifiedPatient?.lastName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>NIC Number:</strong> {verifiedPatient?.nicNumber}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Mobile Number:</strong> {verifiedPatient?.mobileNumber}
                    </Typography>
                    {verifiedPatient?.gender && (
                      <Typography variant="body1">
                        <strong>Gender:</strong> {verifiedPatient?.gender}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {primaryPatientRecord && (
                <AddChildModal
                  open={openAddChildModal}
                  parentId={primaryPatientRecord.id}
                  onClose={() => setOpenAddChildModal(false)}
                  onChildAdded={(newChild) => {
                    setVerifiedChildren(prev => [...prev, newChild]);
                    setVerifiedPatient(newChild);
                  }}
                />
              )}

              {daySessions.length > 1 && (
                <FormControl fullWidth>
                  <InputLabel>Session</InputLabel>
                  <Select
                    value={targetSessionId}
                    label="Session"
                    onChange={(e) => setTargetSessionId(e.target.value)}
                    startAdornment={<AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    {daySessions.map((session: DaySessionInfo) => (
                      <MenuItem key={session.id} value={session.id}>
                        {session.label} ({session.timeRange})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(Number(e.target.value))}
                  startAdornment={<StarRateIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value={0}>Normal Priority</MenuItem>
                  <MenuItem value={1}>High Priority</MenuItem>
                  <MenuItem value={2}>Emergency Priority</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDialogMode('input')} variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="gradient-primary-btn"
                disabled={submitting}
                sx={{ px: 3 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Confirm & Add to Queue'}
              </Button>
            </DialogActions>
          </form>
        )}

        {dialogMode === 'select' && (
          <Box>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {addError && <Alert severity="error">{addError}</Alert>}
              <Typography variant="body2" color="text.secondary">
                No patient matches the mobile number <strong>{patientMobile}</strong>, but matching records were found based on your advanced search. Select the correct patient to link this phone number and add to queue:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto', mt: 1 }}>
                {searchResults.map((patient) => (
                  <Card key={patient.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, boxShadow: 'none', p: 1.5 }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid size={{ xs: 8 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          NIC: {patient.nicNumber} | Old Mobile: {patient.mobileNumber}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSelectPatient(patient)}
                          disabled={verificationLoading}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Select & Link
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              <Button onClick={() => setDialogMode('input')} variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setOpenAddModal(false);
                  navigate(`/register/patient?redirect=/patient-queue&mobile=${encodeURIComponent(patientMobile)}`);
                }}
                variant="contained"
                color="secondary"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Register New Patient
              </Button>
            </DialogActions>
          </Box>
        )}

        {dialogMode === 'notFound' && (
          <Box>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                No Patient Record Found
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                We couldn't find any patient matching the mobile number or advanced search details in our database.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
              <Button onClick={() => setDialogMode('input')} variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setOpenAddModal(false);
                  navigate(`/register/patient?redirect=/patient-queue&mobile=${encodeURIComponent(patientMobile)}`);
                }}
                variant="contained"
                className="gradient-primary-btn"
                sx={{ textTransform: 'none', px: 3 }}
              >
                Register New Patient
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <OtpVerificationDialog
        open={openOtpDialogQueue}
        onClose={() => setOpenOtpDialogQueue(false)}
        maskedMobile={maskedMobileQueue}
        sessionId={otpSessionIdQueue}
        onVerified={handleOtpVerifiedQueue}
        onVerifyOtp={(sid, code) => verifyPatientOtp(sid, code)}
        onResendOtp={(sid) => resendPatientOtp(sid)}
      />
    </Box>
  );
};
