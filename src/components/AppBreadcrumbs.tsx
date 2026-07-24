import React from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs,
  Link,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'patient-queue': 'Patient Queue',
  patients: 'Patients',
  new: 'Register Patient',
  reports: 'Reports',
  todos: 'Todos',
  settings: 'Settings',
  'profile-edit': 'Profile Settings',
  'favorites-list': 'Favorites List',
  'practice-centres': 'Practice Centres',
  'verify-process': 'Verification',
  book: 'Book Appointment',
  doctor: 'Doctor Profile',
  register: 'Register',
};

export const AppBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  // If on dashboard/home index, render clean single home indicator or skip
  const isHome = pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const formatSegment = (segment: string): string => {
    if (ROUTE_LABELS[segment]) {
      return ROUTE_LABELS[segment];
    }
    // Handle IDs or generic parameters
    if (segment.length > 12) {
      return 'Details';
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{
        mb: 2.5,
        py: 1,
        px: 2,
        borderRadius: '16px',
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(143, 0, 255, 0.08)',
        '.dark-theme &': {
          bgcolor: 'rgba(18, 24, 38, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      {/* Go Back Action Button */}
      <Button
        variant="text"
        size="small"
        startIcon={<ArrowBackIcon sx={{ fontSize: '1.1rem !important' }} />}
        onClick={handleGoBack}
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          borderRadius: '10px',
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          bgcolor: 'rgba(143, 0, 255, 0.06)',
          '&:hover': {
            bgcolor: 'rgba(143, 0, 255, 0.12)',
            transform: 'translateX(-2px)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        Back
      </Button>

      {/* Dynamic Breadcrumbs Trail */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary', opacity: 0.6 }} />}
        aria-label="breadcrumb"
        sx={{ fontSize: '0.875rem' }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: isHome ? 'primary.main' : 'text.secondary',
            fontWeight: isHome ? 800 : 600,
            '&:hover': { color: 'primary.main' },
          }}
        >
          <HomeRoundedIcon sx={{ fontSize: 18 }} />
          Home
        </Link>

        {!isHome &&
          pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = formatSegment(value);

            return last ? (
              <Typography
                key={to}
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                }}
              >
                {label}
              </Typography>
            ) : (
              <Link
                key={to}
                component={RouterLink}
                to={to}
                underline="hover"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {label}
              </Link>
            );
          })}
      </Breadcrumbs>
    </Stack>
  );
};
