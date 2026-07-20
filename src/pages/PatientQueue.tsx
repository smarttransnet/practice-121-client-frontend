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
  Tooltip
} from '@mui/material';
import { NavLink } from 'react-router-dom';
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
import { httpClient } from '../api/httpClient';
import {
  getPatientQueue,
  addPatientQueueTicket,
  updatePatientQueueTicketStatus,
  reorderPatientQueue,
  type PatientQueueTicket
} from '../features/patient-queue/patientQueueApi';

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

export const PatientQueue = () => {
  const [practiceCentres, setPracticeCentres] = useState<PracticeCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<PracticeCentre | null>(null);
  const [queue, setQueue] = useState<PatientQueueTicket[]>([]);

  const getTodayDayString = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date().getDay()];
  };

  const hasScheduleToday = (centre: PracticeCentre | null): boolean => {
    if (!centre) return false;
    if (!centre.sessionGroups || centre.sessionGroups.length === 0) return false;
    const today = getTodayDayString();
    return centre.sessionGroups.some(sg =>
      sg.daysOfWeek && sg.daysOfWeek.map(d => d.toUpperCase()).includes(today)
    );
  };
  
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog / Modal State
  const [openAddModal, setOpenAddModal] = useState(false);
  const [patientMobile, setPatientMobile] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load Practice Centres on mount
  useEffect(() => {
    fetchPracticeCentres();
  }, []);

  // Fetch queue when selected practice centre changes
  useEffect(() => {
    if (selectedCentre) {
      fetchQueue(selectedCentre.id);
    } else {
      setQueue([]);
    }
  }, [selectedCentre]);

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
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to load practice centres');
    } finally {
      setLoadingCentres(false);
    }
  };

  const fetchQueue = async (centreId: string) => {
    try {
      setLoadingQueue(true);
      setError(null);
      const data = await getPatientQueue(centreId);
      setQueue(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch patient queue tickets');
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentre) return;
    if (!patientMobile.trim()) {
      setAddError('Patient Mobile is required');
      return;
    }

    try {
      setSubmitting(true);
      setAddError(null);
      await addPatientQueueTicket({
        patientMobile: patientMobile.trim(),
        doctorId: selectedCentre.doctorId,
        practiceCentreId: selectedCentre.id,
        priority: priority
      });
      setPatientMobile('');
      setPriority(0);
      setOpenAddModal(false);
      fetchQueue(selectedCentre.id);
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
      fetchQueue(selectedCentre.id);
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
            onClick={() => fetchQueue(selectedCentre.id)}
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

                {selectedCentre && !hasScheduleToday(selectedCentre) && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    Doctor doesn't have practice schedule for this location for today ({getTodayDayString()}).
                  </Alert>
                )}

                {/* Queue Statistics */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Today's Statistics
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
                  disabled={!selectedCentre || !hasScheduleToday(selectedCentre)}
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
                  Active Patient Queue
                </Typography>

                {loadingQueue ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : queue.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">
                      No patients in the queue for today.
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
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 2, minWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Patient to Queue</DialogTitle>
        <form onSubmit={handleAddTicket}>
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
              required
            />
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
            <Button onClick={() => setOpenAddModal(false)} variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="gradient-primary-btn"
              disabled={submitting}
              sx={{ px: 3 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Add to Queue'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
