import { useState } from 'react'
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
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined'

export function RegisterPage() {
  const { register, error, clearError, isLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    if (!name.trim()) {
      setValidationError('Full Name is required')
      return
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('A valid email address is required')
      return
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    try {
      await register(name, email, password)
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
                Register with your credentials. Remaining details can be completed progressively.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2.5}>
                {(validationError || error) && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {validationError || error}
                  </Alert>
                )}

                <TextField
                  label="Full Name"
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Sunil Perera"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

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
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>

                <Typography variant="body2" align="center" color="text.secondary">
                  Already have an account?{' '}
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
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
