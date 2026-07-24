import { useState, useEffect } from 'react';
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
  ButtonBase
} from '@mui/material';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import StarRateIcon from '@mui/icons-material/StarRate';
import RefreshIcon from '@mui/icons-material/Refresh';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { httpClient } from '../api/httpClient';
import {
  getPatientQueue,
  addPatientQueueTicket,
  updatePatientQueueTicketStatus,
  reorderPatientQueue,
  getPatientByMobile,
  searchPatients,
  updatePatientMobile,
  type PatientQueueTicket,
  type Patient
} from '../features/patient-queue/patientQueueApi';
import { isValidLkMobile, normalizeLkMobile } from '../utils/lkPhoneValidation';

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
    <Box sx={{ width: '100%', bgcolor: '#ffffff', borderRadius: 3, p: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={handlePrevMonth} disabled={!showPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
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
                      ? 'rgba(143, 0, 255, 0.06)' 
                      : 'transparent',
                  color: isSelected 
                    ? '#ffffff' 
                    : isSelectable 
                      ? '#8F00FF' 
                      : '#b0b0b0',
                  opacity: isSelectable ? 1 : 0.4,
                  '&:hover': {
                    bgcolor: isSelected 
                      ? 'primary.dark' 
                      : isSelectable 
                        ? 'rgba(143, 0, 255, 0.15)' 
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
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Future Booking Date states
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  // Fetch queue when selected practice centre or selected date changes
  useEffect(() => {
    if (selectedCentre && selectedDate) {
      const dateStr = formatDateLocal(selectedDate);
      fetchQueue(selectedCentre.id, selectedCentre.doctorId, dateStr);
    } else {
      setQueue([]);
    }
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
        setSelectedCentre(res.data[0]);
      }
    } catch (err: any) {
      setError(err.userFriendlyMessage || err.message || 'Failed to load practice centres');
    } finally {
      setLoadingCentres(false);
    }
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
        const patient = await getPatientByMobile(normalizedMobile);
        if (patient) {
          setVerifiedPatient(patient);
          setDialogMode('verify');
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
      if (newMobile && newMobile !== patient.mobileNumber) {
        // Update mobile in database to link
        await updatePatientMobile(patient.id, newMobile);
        const updatedPatient = { ...patient, mobileNumber: newMobile };
        setVerifiedPatient(updatedPatient);
      } else {
        // Keep their current mobile number if newMobile is empty
        setVerifiedPatient(patient);
      }
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
    setVerifiedPatient(null);
    setSearchResults([]);
    setAddError(null);
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentre || !verifiedPatient) return;

    try {
      setSubmitting(true);
      setAddError(null);
      await addPatientQueueTicket({
        patientMobile: verifiedPatient.mobileNumber,
        doctorId: selectedCentre.doctorId,
        practiceCentreId: selectedCentre.id,
        priority: priority,
        visitDate: selectedDate ? formatDateLocal(selectedDate) : undefined
      });
      handleCloseAddModal();
      refreshQueue();
    } catch (err: any) {
      console.error(err);
      setAddError(err.message || 'Failed to add patient to queue');
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

  // Calculate statistics
  const waitingCount = queue.filter(q => q.status === 0 || q.status === 1).length;
  const activeCount = queue.filter(q => q.status === 2 || q.status === 3).length;
  const completedCount = queue.filter(q => q.status === 4).length;

  return (
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: '#f4f6f9' }}>
      {/* Top Header Card */}
      <Box className="glass-card" sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={NavLink}
            to="/dashboard"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
          >
            Back to Portal
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Patient Queue
          </Typography>
        </Box>

        {selectedCentre && (
          <Button
            onClick={refreshQueue}
            variant="text"
            startIcon={<RefreshIcon />}
            sx={{ fontWeight: 700 }}
          >
            Refresh Queue
          </Button>
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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Select Practice Centre
                </Typography>
                <FormControl fullWidth size="medium">
                  <InputLabel>Practice Centre</InputLabel>
                  <Select
                    value={selectedCentre?.id || ''}
                    label="Practice Centre"
                    onChange={(e) => {
                      const centre = practiceCentres.find(pc => pc.id === e.target.value);
                      setSelectedCentre(centre || null);
                    }}
                    sx={{ borderRadius: 3 }}
                  >
                    {practiceCentres.map((pc) => (
                      <MenuItem key={pc.id} value={pc.id}>
                        {pc.clinicName} ({pc.placeName})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                      : `Statistics for ${selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Patient Queue - {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}
                </Typography>

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
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', background: 'transparent' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 50 }}></TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Mobile</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {queue.map((ticket, index) => (
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
                            <TableCell sx={{ width: 50 }}>
                              <DragIndicatorIcon sx={{ color: 'text.secondary', cursor: 'grab', display: 'block', margin: 'auto' }} />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                              #{ticket.queueNumber}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{ticket.patientName}</TableCell>
                            <TableCell>{ticket.patientMobile}</TableCell>
                            <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                            <TableCell>{getStatusChip(ticket.status)}</TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                {ticket.status === 0 && (
                                  <Tooltip title="Mark Ready">
                                    <IconButton
                                      color="secondary"
                                      onClick={() => handleUpdateStatus(ticket.id, 1)}
                                    >
                                      <CheckIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {(ticket.status === 0 || ticket.status === 1) && (
                                  <Tooltip title="Call Patient">
                                    <IconButton
                                      color="warning"
                                      onClick={() => handleUpdateStatus(ticket.id, 2)}
                                    >
                                      <RecordVoiceOverIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {ticket.status === 2 && (
                                  <Tooltip title="Start Consultation">
                                    <IconButton
                                      color="info"
                                      onClick={() => handleUpdateStatus(ticket.id, 3)}
                                    >
                                      <PlayArrowIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {ticket.status === 3 && (
                                  <Tooltip title="Complete Consultation">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleUpdateStatus(ticket.id, 4)}
                                    >
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
                                      <IconButton
                                        color="error"
                                        onClick={() => handleUpdateStatus(ticket.id, 5)}
                                      >
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
                Patient found. Please verify the details before adding to the queue.
              </Alert>

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
    </Box>
  );
};
