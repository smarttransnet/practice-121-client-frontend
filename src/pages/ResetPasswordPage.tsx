import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  IconButton,
  InputAdornment,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export function ResetPasswordPage() {
  const { resetPassword, isLoading, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [accountId, setAccountId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [tokenMissing, setTokenMissing] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const aid = params.get('accountId')
    const tok = params.get('token')

    if (!aid || !tok) {
      setTokenMissing(true)
    } else {
      setAccountId(aid)
      setToken(tok)
    }
  }, [location.search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setApiError(null)
    clearError()

    if (!newPassword || newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    try {
      const message = await resetPassword(accountId!, token!, newPassword, confirmPassword)
      setSuccessMessage(message ?? 'Your password has been reset successfully.')
    } catch (err: any) {
      setApiError(err.message ?? 'Something went wrong. Please try again.')
    }
  }

  if (tokenMissing) {
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
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
          }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }} id="reset-token-missing">
                This password reset link is invalid or has expired. Please request a new one.
              </Alert>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold' }}
              >
                Request New Reset Link
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
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
                bgcolor: successMessage ? 'success.main' : 'primary.main',
                color: 'white',
                transition: 'background-color 0.3s ease',
              }}
            >
              {successMessage
                ? <CheckCircleOutlineIcon fontSize="large" />
                : <LockOutlinedIcon fontSize="large" />
              }
            </Box>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color={successMessage ? 'success.main' : 'primary.main'} gutterBottom>
                {successMessage ? 'Password Reset!' : 'Set New Password'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {successMessage
                  ? 'You can now log in with your new password.'
                  : 'Choose a strong password. It must be at least 8 characters.'}
              </Typography>
            </Box>

            {successMessage ? (
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Alert severity="success" sx={{ borderRadius: 2 }} id="reset-password-success">
                  {successMessage}
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold' }}
                  id="reset-go-to-login"
                >
                  Go to Login
                </Button>
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ width: '100%' }}>
                <Stack spacing={2.5}>
                  {(validationError || apiError) && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} id="reset-password-error">
                      {validationError || apiError}
                      {apiError && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            component={Link}
                            to="/forgot-password"
                            variant="text"
                            size="small"
                            sx={{ p: 0, fontWeight: 'bold', fontSize: '0.78rem' }}
                          >
                            Request a new reset link
                          </Button>
                        </Box>
                      )}
                    </Alert>
                  )}

                  <TextField
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    id="reset-new-password"
                    disabled={isLoading}
                  />

                  <TextField
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    id="reset-confirm-password"
                    disabled={isLoading}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    id="reset-password-submit"
                    sx={{
                      borderRadius: 2.5,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
                    }}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>

                  <Typography variant="body2" align="center" color="text.secondary">
                    <Button
                      component={Link}
                      to="/login"
                      variant="text"
                      color="primary"
                      startIcon={<ArrowBackIcon />}
                      sx={{ fontWeight: 500, fontSize: '0.8rem' }}
                    >
                      Back to Login
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
