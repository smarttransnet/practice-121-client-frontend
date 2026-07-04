import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'

export function OTPVerifyPage() {
  const { verifyOtp, resendOtp, otpSessionId, error, clearError, isLoading } = useAuth()
  const navigate = useNavigate()

  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''))
  const [countdown, setCountdown] = useState(60)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  
  // Track input refs to auto-focus next boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // If no session is active, go back to login
    if (!otpSessionId) {
      navigate('/login')
    }
  }, [otpSessionId, navigate])

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown === 0) {
      setResendDisabled(false)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleInputChange = (value: string, index: number) => {
    // Keep only numbers
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (!cleanValue) return

    const newCode = [...otpCode]
    newCode[index] = cleanValue.slice(-1) // Take the last digit
    setOtpCode(newCode)

    // Clear errors when user types
    setVerifyError(null)
    clearError()

    // Auto-focus next input
    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      // Focus previous input on backspace
      const newCode = [...otpCode]
      newCode[index - 1] = ''
      setOtpCode(newCode)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setOtpCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otpCode.join('')
    if (code.length < 6) {
      setVerifyError('Please enter all 6 digits of the verification code')
      return
    }

    try {
      await verifyOtp(code)
      navigate('/dashboard')
    } catch (err) {
      // Error handled by store
    }
  }

  const handleResend = async () => {
    setVerifyError(null)
    clearError()
    try {
      await resendOtp()
      setCountdown(60)
      setResendDisabled(true)
      setOtpCode(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      // Error handled by store
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
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          p: 2,
        }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center">
            {/* Logo */}
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
              <ShieldOutlinedIcon fontSize="large" />
            </Box>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                Enter Verification Code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For security, we sent a 6-digit one-time passcode (MFA) to your registered email.
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
                (Check the backend API console/logger to copy the simulated OTP code)
              </Typography>
            </Box>

            <Stack spacing={2.5} sx={{ width: '100%' }}>
              {(verifyError || error) && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {verifyError || error}
                </Alert>
              )}

              {/* 6 Digit Input Group */}
              <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ my: 1 }}>
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value, index)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    style={{
                      width: 48,
                      height: 54,
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: digit ? '#1976d2' : '#ccc',
                      outline: 'none',
                      backgroundColor: 'white',
                      boxShadow: digit ? '0 0 8px 0 rgba(25, 118, 210, 0.25)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Stack>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleVerify}
                disabled={isLoading}
                sx={{
                  borderRadius: 2.5,
                  py: 1.5,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
              </Button>

              <Box textAlign="center">
                {resendDisabled ? (
                  <Typography variant="body2" color="text.secondary">
                    Resend code in <strong>{countdown}s</strong>
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    Didn't receive a code?{' '}
                    <Link
                      component="button"
                      onClick={handleResend}
                      sx={{ fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      Resend OTP
                    </Link>
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" align="center">
                <Link
                  component="button"
                  onClick={() => navigate('/login')}
                  color="text.secondary"
                  sx={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  Back to Sign In
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
