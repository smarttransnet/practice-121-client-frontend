import { useState } from 'react';
import {
  Box,
  Typography,
  ButtonBase,
  IconButton,
  Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import type { DayAvailability } from './appointmentApi';

interface Props {
  availabilityMap: Record<string, DayAvailability>; // keyed by YYYY-MM-DD
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

function getCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, mo, d));
  }
  return cells;
}

function formatLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AppointmentCalendar({ availabilityMap, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 27);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const showPrev =
    currentMonth.getFullYear() > today.getFullYear() ||
    currentMonth.getMonth() > today.getMonth();
  const showNext =
    currentMonth.getFullYear() < maxDate.getFullYear() ||
    currentMonth.getMonth() < maxDate.getMonth();

  const days = getCalendarDays(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getSlotLabel = (avail: DayAvailability) => {
    if (avail.isFull) {
      return 'Fully Booked';
    }
    if (avail.totalSlots !== null) {
      const remaining = avail.totalSlots - avail.bookedCount;
      return remaining <= 3 ? `${remaining} slots left` : `${remaining} available`;
    }
    return 'Available';
  };

  const getSlotColor = (avail: DayAvailability) => {
    if (avail.isFull) {
      return '#ef4444';
    }
    if (avail.totalSlots !== null) {
      const remaining = avail.totalSlots - avail.bookedCount;
      if (remaining <= 3) {
        return '#f59e0b';
      }
    }
    return '#10b981';
  };

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 2.5, border: '1px solid #e5e7eb' }}>
      {/* Month navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} disabled={!showPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton size="small" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} disabled={!showNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day headers */}
      <Grid container columns={7} sx={{ textAlign: 'center', mb: 1 }}>
        {weekDays.map(wd => (
          <Grid key={wd} size={1}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {wd}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Date cells */}
      <Grid container columns={7} sx={{ textAlign: 'center' }}>
        {days.map((day, idx) => {
          if (!day) {
            return <Grid key={`e-${idx}`} size={1} />;
          }

          const dayReset = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const dateKey = formatLocal(dayReset);
          const avail = availabilityMap[dateKey];
          const inWindow = dayReset >= today && dayReset <= maxDate;
          const isAvailable = inWindow && !!avail && !avail.isFull;
          const isFull = inWindow && !!avail && avail.isFull;
          const isInactive = inWindow && !avail;
          const isPast = dayReset < today;
          const isSelected = selectedDate && formatLocal(dayReset) === formatLocal(selectedDate);

          const slotColor = avail ? getSlotColor(avail) : '#9ca3af';

          let tooltipTitle = '';
          if (isPast) {
            tooltipTitle = 'Past date';
          } else if (isFull) {
            tooltipTitle = 'Fully booked';
          } else if (isInactive) {
            tooltipTitle = 'No sessions this day';
          } else if (avail) {
            tooltipTitle = getSlotLabel(avail);
          }

          return (
            <Grid key={dateKey} size={1} sx={{ mb: 0.5 }}>
              <Tooltip title={tooltipTitle} placement="top" arrow>
                <span>
                  <ButtonBase
                    onClick={() => isAvailable && onSelectDate(dayReset)}
                    disabled={!isAvailable}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 500,
                      position: 'relative',
                      flexDirection: 'column',
                      bgcolor: isSelected
                        ? 'primary.main'
                        : isAvailable
                          ? 'rgba(143, 0, 255, 0.06)'
                          : 'transparent',
                      color: isSelected
                        ? '#fff'
                        : isAvailable
                          ? '#8F00FF'
                          : '#c4c4c4',
                      opacity: isPast || isInactive ? 0.3 : 1,
                      cursor: isAvailable ? 'pointer' : 'default',
                      '&:hover': {
                        bgcolor: isSelected
                          ? 'primary.dark'
                          : isAvailable
                            ? 'rgba(143, 0, 255, 0.16)'
                            : 'transparent',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {day.getDate()}
                    {/* Dot indicator */}
                    {inWindow && avail && !isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 3,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: slotColor,
                        }}
                      />
                    )}
                  </ButtonBase>
                </span>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: '1rem', color: '#10b981' }} />
          <Typography variant="caption" color="text.secondary">Available</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningAmberIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />
          <Typography variant="caption" color="text.secondary">Almost Full</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BlockIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
          <Typography variant="caption" color="text.secondary">Fully Booked</Typography>
        </Box>
      </Box>

      {/* Selected date chip */}
      {selectedDate && (
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Selected: ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}
    </Box>
  );
}
