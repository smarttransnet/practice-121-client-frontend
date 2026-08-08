import React from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  IconButton
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'

export interface StepInfo {
  label: string
  subtitle: string
  icon: React.ReactNode
}

export const FORM_STEPS: StepInfo[] = [
  { label: 'Location & Details', subtitle: 'District, MOH, Place & Name', icon: <LocationOnIcon /> },
  { label: 'Session Schedule', subtitle: 'Days & Time Blocks', icon: <AccessTimeIcon /> },
  { label: 'Staff & Assistants', subtitle: 'Nurses & Support Staff', icon: <PeopleIcon /> },
  { label: 'Review & Save', subtitle: 'Confirm & Validate', icon: <CheckCircleIcon /> }
]

interface FormBuilderStepperProps {
  activeStep: number
  onStepClick: (stepIndex: number) => void
  completedSteps: boolean[]
  onCancel?: () => void
}

export const FormBuilderStepper: React.FC<FormBuilderStepperProps> = ({
  activeStep,
  onStepClick,
  completedSteps,
  onCancel
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const progressPercent = ((activeStep + 1) / FORM_STEPS.length) * 100

  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(143, 0, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            {onCancel && (
              <IconButton size="small" onClick={onCancel} sx={{ color: 'text.secondary', mr: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              {activeStep + 1}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
                {FORM_STEPS[activeStep].label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {FORM_STEPS[activeStep].subtitle}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`Step ${activeStep + 1} of ${FORM_STEPS.length}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(143, 0, 255, 0.08)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #8f00ff 0%, #6200ea 100%)'
            }
          }}
        />
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3.5,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(143, 0, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(143, 0, 255, 0.04)'
      }}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {FORM_STEPS.map((step, index) => {
          const isCompleted = completedSteps[index]
          const isActive = activeStep === index

          return (
            <Step key={step.label} completed={isCompleted}>
              <StepButton
                onClick={() => onStepClick(index)}
                disabled={index > activeStep && !isCompleted && !completedSteps[index - 1]}
              >
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isActive
                          ? 'primary.main'
                          : isCompleted
                          ? 'success.light'
                          : 'action.hover',
                        color: isActive
                          ? 'white'
                          : isCompleted
                          ? 'success.dark'
                          : 'text.secondary',
                        transition: 'all 0.3s ease',
                        boxShadow: isActive ? '0 4px 14px rgba(143, 0, 255, 0.35)' : 'none',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)'
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="body2" fontWeight={isActive ? 700 : 500} color={isActive ? 'primary.main' : 'text.primary'}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {step.subtitle}
                  </Typography>
                </StepLabel>
              </StepButton>
            </Step>
          )
        })}
      </Stepper>
    </Paper>
  )
}
