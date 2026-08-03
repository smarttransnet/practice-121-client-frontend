import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setApiError(null)
    clearError()

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('A valid email address is required.')
      return
    }

    try {
      const message = await forgotPassword(email.trim().toLowerCase())
      setSuccessMessage(message ?? 'If this email is registered, a password reset link has been sent.')
    } catch (err: any) {
      setApiError(err.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgb(18, 28, 54) 0%, rgb(9, 14, 28) 100%)',
        p: 2,
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center">
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <LockResetOutlinedIcon fontSize="large" />
            </Box>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                Forgot Password?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your registered email address and we'll send you a link to reset your password.
              </Typography>
            </Box>

            {successMessage ? (
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Alert
                  severity="success"
                  sx={{ borderRadius: 2 }}
                  id="forgot-password-success"
                >
                  {successMessage}
                </Alert>
                <Typography variant="body2" align="center" color="text.secondary">
                  Check your email inbox (and spam folder) for the reset link.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold' }}
                >
                  Back to Login
                </Button>
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ width: '100%' }}>
                <Stack spacing={2.5}>
                  {(validationError || apiError) && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} id="forgot-password-error">
                      {validationError || apiError}
                    </Alert>
                  )}

                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sunil.perera@example.com"
                    InputProps={{ sx: { borderRadius: 2 } }}
                    id="forgot-password-email"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    id="forgot-password-submit"
                    sx={{
                      borderRadius: 2.5,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
                    }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Typography variant="body2" align="center" color="text.secondary">
                    Remember your password?{' '}
                    <Button
                      component={Link}
                      to="/login"
                      variant="text"
                      color="primary"
                      sx={{ fontWeight: 'bold', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
                    >
                      Log In
                    </Button>
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
