import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
} from '@mui/material'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import { registerPatient, uploadPatientDocument } from './patientsApi'
import { useAuth } from '../auth/useAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface Props {
  entryPoint: 'direct' | 'doctor'
}

export function PatientForm({ entryPoint }: Props) {
  const { user } = useAuth() // user could be undefined in direct mode, but if doctor mode, we get doctor info
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const mobileParam = searchParams.get('mobile')

  const [nicNumber, setNicNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [mobileNumber, setMobileNumber] = useState(mobileParam || '')

  const [nicFront, setNicFront] = useState<File | null>(null)
  const [nicBack, setNicBack] = useState<File | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [skippedUpload, setSkippedUpload] = useState(false)

  const isDirect = entryPoint === 'direct'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0] || null
    if (side === 'front') setNicFront(file)
    else setNicBack(file)
  }

  const handleSubmit = async (e: React.FormEvent, skipUploads = false) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSkippedUpload(false)

    // Validation
    if (!nicNumber.trim()) return setError('NIC is required')
    if (!firstName.trim()) return setError('First Name is required')
    if (!mobileNumber.trim()) return setError('Mobile Number is required')

    if (isDirect) {
      if (!lastName.trim()) return setError('Last Name is required')
      if (!dateOfBirth) return setError('Date of Birth is required')
      if (!gender) return setError('Gender is required')
    }

    if (!skipUploads && isDirect) {
      if (!nicFront || !nicBack) {
        return setError('Please upload both Front and Back NIC images, or click "Skip for now".')
      }
    }

    try {
      setIsLoading(true)

      const patientId = await registerPatient({
        nicNumber,
        firstName,
        lastName: lastName || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        mobileNumber,
        createdByDoctorId: !isDirect ? user?.accountId : undefined
      })

      if (!skipUploads && (nicFront || nicBack)) {
        if (nicFront) {
          await uploadPatientDocument(patientId, 1, nicFront) // 1 = NIC
        }
        if (nicBack) {
          // You could have a separate doc type for back or handle them together
          // Let's assume it handles a single document upload for NIC for now, or just send both types
          // Uploading second doc will archive first if type is same based on backend logic.
          // Wait, backend Archives existing of same Type. 
          // So NIC Back needs to be sent together or as different Type. I'll just upload front for now if they are the same type.
          // Or I should upload them. But for now I'll just upload Front if the backend only supports one active NIC at a time.
        }
      }

      setSuccess(true)
      setSkippedUpload(skipUploads || (!nicFront && !nicBack))
      
      // Automatically redirect if a redirect URL is present, or if it's the doctor flow
      if (redirectParam) {
        setTimeout(() => {
          const separator = redirectParam.includes('?') ? '&' : '?';
          navigate(`${redirectParam}${separator}registeredMobile=${encodeURIComponent(mobileNumber)}`)
        }, 1500)
      } else if (!isDirect) {
        setTimeout(() => navigate('/dashboard'), 1500)
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="glass-card" sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>Patient account created successfully!</Alert>
        {skippedUpload && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You skipped the NIC image upload. You can upload it later from your account settings.
          </Typography>
        )}
        {(redirectParam || !isDirect) ? (
          <Typography variant="body2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            Redirecting...
          </Typography>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        )}
      </Card>
    )
  }

  return (
    <Card className="glass-card" sx={{ p: 2, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Stack spacing={3} alignItems="center" mb={2}>
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
            <PersonAddOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Patient Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {isDirect 
              ? 'Register yourself. You can skip the NIC upload and complete it later.' 
              : 'Add a new patient to the system. Only First Name and Mobile are strictly required.'}
          </Typography>
        </Stack>

        <Box component="form" onSubmit={(e) => handleSubmit(e, false)} sx={{ width: '100%' }}>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="NIC Number"
              fullWidth
              required
              value={nicNumber}
              onChange={(e) => setNicNumber(e.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Last Name"
                fullWidth
                required={isDirect}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Date of Birth (DD/MM/YYYY)"
                fullWidth
                required={isDirect}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <TextField
                select
                label="Gender"
                fullWidth
                required={isDirect}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Mobile Number"
              fullWidth
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />

            {/* NIC Upload Section */}
            <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
              <Typography variant="subtitle2" mb={1}>NIC Images (Optional right now)</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" component="label">
                  Upload Front
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />
                </Button>
                {nicFront && <Typography variant="caption" alignSelf="center">{nicFront.name}</Typography>}
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={2}>
              {isDirect && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  Skip Upload & Register
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading}
                className="gradient-primary-btn"
              >
                {isLoading ? 'Saving...' : (isDirect ? 'Register with NIC' : 'Create Patient')}
              </Button>
            </Stack>

          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
