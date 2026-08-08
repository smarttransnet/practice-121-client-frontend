import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { httpClient } from '../api/httpClient';
import {
  getPatientQueue,
  addPatientQueueTicket,
  updatePatientQueueTicketStatus,
  reorderPatientQueue,
  type PatientQueueTicket
} from '../features/patient-queue/patientQueueApi';
import { formatDisplayDate, formatDisplayDateLong } from '../utils/dateUtils';
import { QueueFormBuilder } from '../features/patient-queue/QueueFormBuilder';

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
  onSelectDate,
  calendarRef,
}: {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  calendarRef?: React.RefObject<HTMLDivElement | null>;
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
    <Box ref={calendarRef} tabIndex={-1} sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', outline: 'none' }}>
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
  const calendarRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const isEditingQueueRef = useRef<boolean>(false);
  const hasPendingSignalRUpdateRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const [practiceCentres, setPracticeCentres] = useState<PracticeCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PracticeCentre | null>(null);
  const [queue, setQueue] = useState<PatientQueueTicket[]>([]);

  const [loadingCentres, setLoadingCentres] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queue Modal State
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Future Booking Date states
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');

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

  // Fetch queue & subscribe to real-time SignalR push notifications + 30s background sync fallback
  useEffect(() => {
    if (!selectedCentre || !selectedDate) {
      setQueue([]);
      return;
    }

    const dateStr = formatDateLocal(selectedDate);
    fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);

    // 1. Setup 30-second background sync fallback (pauses during edit/reorder & skips if fetching)
    const intervalId = setInterval(() => {
      if (!isEditingQueueRef.current && !isFetchingRef.current) {
        fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
      }
    }, 30000);

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
            if (isEditingQueueRef.current) {
              hasPendingSignalRUpdateRef.current = true;
            } else {
              fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
            }
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
    const mobile = searchParams.get('registeredMobile');
    if (mobile) {
      setOpenAddModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('registeredMobile');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      calendarRef.current?.focus();
    }, 120);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setTimeout(() => {
      addButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addButtonRef.current?.focus();
    }, 120);
  };

  const fetchQueue = async (centreId: string, doctorId?: string, visitDate?: string, force?: boolean) => {
    if (isFetchingRef.current && !force) return;
    try {
      isFetchingRef.current = true;
      setError(null);
      const data = await getPatientQueue(centreId, doctorId, visitDate);
      setQueue(data);
    } catch (err: any) {
      setError(err.userFriendlyMessage || err.message || 'Failed to load patient queue');
    } finally {
      setLoadingQueue(false);
      isFetchingRef.current = false;
    }
  };

  const refreshQueue = () => {
    if (selectedCentre && selectedDate) {
      const dateStr = formatDateLocal(selectedDate);
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
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
    isEditingQueueRef.current = true;
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
    if (draggedIndex === null) {
      isEditingQueueRef.current = false;
      return;
    }
    setDraggedIndex(null);
    
    try {
      const ticketIds = queue.map(t => t.id);
      await reorderPatientQueue(ticketIds);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to persist queue order');
    } finally {
      isEditingQueueRef.current = false;
      if (hasPendingSignalRUpdateRef.current && selectedCentre && selectedDate) {
        hasPendingSignalRUpdateRef.current = false;
        fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate), true);
      }
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
    isEditingQueueRef.current = true;
    try {
      await reorderPatientQueue(newQueue.map(t => t.id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reorder queue');
    } finally {
      isEditingQueueRef.current = false;
      if (hasPendingSignalRUpdateRef.current && selectedCentre && selectedDate) {
        hasPendingSignalRUpdateRef.current = false;
        fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate), true);
      }
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
    isEditingQueueRef.current = true;
    try {
      await reorderPatientQueue(newQueue.map(t => t.id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reorder queue');
    } finally {
      isEditingQueueRef.current = false;
      if (hasPendingSignalRUpdateRef.current && selectedCentre && selectedDate) {
        hasPendingSignalRUpdateRef.current = false;
        fetchQueue(selectedCentre.id, selectedCentre.doctorId, formatDateLocal(selectedDate), true);
      }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Touch-Friendly Move Up/Down & Drag Indicator */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(143, 0, 255, 0.05)',
                    borderRadius: 2.5,
                    p: 0.5,
                    border: '1px solid rgba(143, 0, 255, 0.15)',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index, ticketsList)}
                    disabled={index === 0}
                    sx={{ p: 0.5 }}
                    title="Move Up"
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index, ticketsList)}
                    disabled={index === ticketsList.length - 1}
                    sx={{ p: 0.5 }}
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
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                {ticket.status === 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleUpdateStatus(ticket.id, 1)}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      boxShadow: '0 2px 8px rgba(156, 39, 176, 0.25)',
                    }}
                  >
                    Mark Ready
                  </Button>
                )}
                {ticket.status === 1 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleUpdateStatus(ticket.id, 3)}
                    sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', px: 2, py: 0.75 }}
                  >
                    Start
                  </Button>
                )}
                {ticket.status === 3 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleUpdateStatus(ticket.id, 4)}
                    sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', px: 2, py: 0.75 }}
                  >
                    Complete
                  </Button>
                )}
                {ticket.status < 4 && (
                  <IconButton color="error" size="small" title="Cancel Queue Ticket" onClick={() => handleUpdateStatus(ticket.id, 5)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
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
              <TableCell sx={{ width: 130, fontWeight: 700 }}>Arrange</TableCell>
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
                <TableCell sx={{ width: 130 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(143, 0, 255, 0.05)',
                      borderRadius: 2.5,
                      p: 0.5,
                      border: '1px solid rgba(143, 0, 255, 0.15)',
                    }}
                  >
                    <Tooltip title="Drag or click arrows to reorder">
                      <DragIndicatorIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 0.5, cursor: 'grab' }} />
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(index, ticketsList)}
                      disabled={index === 0}
                      title="Move Up"
                      sx={{ p: 0.5 }}
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(index, ticketsList)}
                      disabled={index === ticketsList.length - 1}
                      title="Move Down"
                      sx={{ p: 0.5 }}
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                    {ticket.status === 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleUpdateStatus(ticket.id, 1)}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          px: 2,
                          py: 0.75,
                          boxShadow: '0 2px 8px rgba(156, 39, 176, 0.25)',
                        }}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {ticket.status === 1 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleUpdateStatus(ticket.id, 3)}
                        sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', px: 2, py: 0.75 }}
                      >
                        Start
                      </Button>
                    )}
                    {ticket.status === 3 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleUpdateStatus(ticket.id, 4)}
                        sx={{ fontWeight: 700, borderRadius: 2.5, textTransform: 'none', px: 2, py: 0.75 }}
                      >
                        Complete
                      </Button>
                    )}
                    {ticket.status < 4 && (
                      <Tooltip title="Cancel Queue Ticket">
                        <IconButton color="error" onClick={() => handleUpdateStatus(ticket.id, 5)}>
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
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
                      onSelectDate={handleSelectDate}
                      calendarRef={calendarRef}
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
                  ref={addButtonRef}
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

      {/* Dynamic Queue Form Generator */}
      <QueueFormBuilder
        open={openAddModal}
        onClose={handleCloseAddModal}
        practiceCentres={practiceCentres}
        selectedCentreId={selectedCentre?.id || ''}
        onSelectCentre={(id) => {
          const found = practiceCentres.find(c => c.id === id);
          if (found) setSelectedCentre(found);
        }}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        daySessions={daySessions}
        onConfirmAdd={async (payload) => {
          if (!selectedCentre) return;
          await addPatientQueueTicket({
            patientMobile: payload.patientMobile,
            doctorId: selectedCentre.doctorId,
            practiceCentreId: selectedCentre.id,
            priority: payload.priority,
            visitDate: payload.visitDate,
            patientId: payload.patientId,
            sessionId: payload.sessionId,
          });
          refreshQueue();
        }}
        onRegisterRedirect={(mobile) => {
          handleCloseAddModal();
          navigate(`/register/patient?redirect=/patient-queue&mobile=${encodeURIComponent(mobile)}`);
        }}
      />
    </Box>
  );
};
