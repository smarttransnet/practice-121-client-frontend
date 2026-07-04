import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'
import GoogleIcon from '@mui/icons-material/Google'

export function LoginPage() {
  const { login, googleLogin, error, clearError, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Google OAuth configuration check
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isGoogleConfigured = GOOGLE_CLIENT_ID && 
    GOOGLE_CLIENT_ID !== 'your-google-client-id-here.apps.googleusercontent.com'

  // Google OAuth Simulator states
  const [openGoogleSim, setOpenGoogleSim] = useState(false)
  const [simName, setSimName] = useState('Dr. Sunil Perera')
  const [simEmail, setSimEmail] = useState('sunil.perera@example.com')

  // Handle parsing returned Google ID Token from URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const idToken = params.get('id_token')
      if (idToken) {
        // Clear hash from URL immediately to keep URL bar clean
        window.history.replaceState(null, '', window.location.pathname)
        
        const loginWithToken = async () => {
          setValidationError(null)
          clearError()
          try {
            await googleLogin(idToken)
            navigate('/verify-otp')
          } catch (err) {
            // Error is handled by authStore/useAuth
          }
        }
        loginWithToken()
      }
    }
  }, [googleLogin, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('A valid email address is required')
      return
    }
    if (!password) {
      setValidationError('Password is required')
      return
    }

    try {
      await login(email, password)
      navigate('/verify-otp')
    } catch (err) {
      // Error handled by store
    }
  }

  const handleGoogleSignIn = () => {
    if (isGoogleConfigured) {
      setValidationError(null)
      clearError()
      const redirectUri = `${window.location.origin}/login`
      const nonce = Math.random().toString(36).substring(2, 15)
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20profile%20email&nonce=${nonce}`
      window.location.href = authUrl
    } else {
      setOpenGoogleSim(true)
    }
  }

  const handleGoogleSimulate = async () => {
    setOpenGoogleSim(false)
    setValidationError(null)
    clearError()
    
    // In local development, we encode a simple simulated JWT token containing name and email.
    // The backend's Mock/GoogleAuthService will extract this or we simulate passing a token.
    // For this implementation, we will pass a structured string that our mock token verifier can parse.
    // Format: "mock-google-token:{name}:{email}:{subId}"
    const mockSubId = `google-sub-${simEmail.replace(/[^a-zA-Z0-9]/g, '')}`
    const idToken = `mock-google-token:${simName}:${simEmail}:${mockSubId}`

    try {
      await googleLogin(idToken)
      navigate('/verify-otp')
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
              <MedicalServicesOutlinedIcon fontSize="large" />
            </Box>

            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                Doctor Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sri Lankan Medical Professional Sign-In
              </Typography>
            </Box>

            {/* Email/Password Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2.5}>
                {(validationError || error) && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {validationError || error}
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
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.5,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Log In'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ width: '100%', my: 1 }}>OR</Divider>

            {!isGoogleConfigured && (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 2, 
                  width: '100%', 
                  fontSize: '0.775rem',
                  bgcolor: 'rgba(2, 136, 209, 0.05)',
                  border: '1px solid rgba(2, 136, 209, 0.2)',
                  color: 'info.dark',
                }}
              >
                Google Auth is running in <strong>Simulation Mode</strong>. Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code> to redirect to Google.
              </Alert>
            )}

            {/* Google Login button */}
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              fullWidth
              startIcon={<GoogleIcon sx={{ color: '#db4437' }} />}
              onClick={handleGoogleSignIn}
              sx={{
                borderRadius: 2.5,
                py: 1.5,
                borderColor: 'grey.300',
                fontWeight: 'bold',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: 'grey.50',
                  borderColor: 'grey.400',
                },
              }}
            >
              Sign In with Google
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Don't have an account?{' '}
              <Button
                component={Link}
                to="/register"
                variant="text"
                color="primary"
                sx={{ fontWeight: 'bold', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
              >
                Register
              </Button>
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Google Sign-In Simulator Dialog */}
      <Dialog open={openGoogleSim} onClose={() => setOpenGoogleSim(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <GoogleIcon color="primary" /> Google OAuth Simulator
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Simulate a Google OAuth sign-in flow locally for development and testing.
          </Typography>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Google Account Name"
              fullWidth
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
            />
            <TextField
              label="Google Account Email"
              fullWidth
              type="email"
              value={simEmail}
              onChange={(e) => setSimEmail(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenGoogleSim(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button onClick={handleGoogleSimulate} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
            Choose Account & Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
