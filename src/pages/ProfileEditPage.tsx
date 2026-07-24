import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { useAuth } from '../features/auth/useAuth'
import { httpClient } from '../api/httpClient'
import { isValidLkMobile, normalizeLkMobile } from '../utils/lkPhoneValidation'
import { isValidNic, normalizeNic } from '../utils/nicDecoder'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Grid,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface QualificationItem {
  id?: string;
  name: string;
  certificateUrl?: string;
  hasCertificate?: boolean;
  file?: File | null;
  isDeleted?: boolean;
  isNew?: boolean;
}

export function ProfileEditPage() {
  const location = useLocation()
  const { user, fetchProfile, updateProfile, logout } = useAuth()

  const getFullImageUrl = (url: string | null | undefined) => {
    if (!url) return ''
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
    return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  const initialMode = location.state?.mode === 'edit' ? 'edit' : 'view'

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Form Fields State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [subSpecialty, setSubSpecialty] = useState('')
  const [bio, setBio] = useState('')
  const [nicNumber, setNicNumber] = useState('')
  const [slmcRegNumber, setSlmcRegNumber] = useState('')
  const [qualifications, setQualifications] = useState<QualificationItem[]>([])
  
  // File Upload State
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null)

  const [signatureUrl, setSignatureUrl] = useState('')
  const [newSignatureFile, setNewSignatureFile] = useState<File | null>(null)
  const [newSignaturePreview, setNewSignaturePreview] = useState<string | null>(null)
  const [showReplaceSigWarning, setShowReplaceSigWarning] = useState(false)
  const [pendingSignature, setPendingSignature] = useState<File | null>(null)

  // SLMC Certificate Document State
  const [slmcCertUrl, setSlmcCertUrl] = useState('')
  const [slmcCertName, setSlmcCertName] = useState('')
  const [slmcCertFile, setSlmcCertFile] = useState<File | null>(null)

  // Specialty Enum State
  const [specialties, setSpecialties] = useState<Record<string, string[]>>({})

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const slmcCertInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    try {
      setPageLoading(true)
      setPageError(null)
      
      await fetchSpecialties()
      const profile = await fetchProfile()
      populateForm(profile)
      await fetchQualifications()
      
    } catch (err: any) {
      setPageError(err.userFriendlyMessage || err.message || 'Failed to load profile details. Please try again.')
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      setPageLoading(false)
    }
  }

  const fetchQualifications = async () => {
    try {
      const res = await httpClient.get('/api/profile/qualifications')
      if (res.data.success) {
        setQualifications(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load qualifications', err)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await httpClient.get('/api/enums/specialties')
      if (res.data.success) {
        setSpecialties(res.data.data)
      }
    } catch {
      // Ignored
    }
  }

  const populateForm = (profile: any) => {
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setEmail(profile.email ?? '')
    setMobileNumber(profile.mobileNumber ?? '')
    
    if (profile.dateOfBirth) {
      const datePart = profile.dateOfBirth.split('T')[0]
      setDateOfBirth(datePart)
    } else {
      setDateOfBirth('')
    }
    
    setGender(profile.gender ?? '')
    setSpecialty(profile.specialty ?? '')
    setSubSpecialty(profile.subSpecialty ?? '')
    setBio(profile.bio ?? '')
    setProfilePictureUrl(profile.profilePictureUrl ?? '')
    setSignatureUrl(profile.eSignature?.signatureDataUrl ?? (profile.eSignature?.signatureData ? `/api/files/signature/${profile.accountId}` : ''))
    setNicNumber(profile.nicNumber ?? '')
    setSlmcRegNumber(profile.slmcRegNumber ?? '')

    const slmcCert = profile.documents?.find((d: any) => d.type === 'SLMC_CERT' || d.type === 2)
    if (slmcCert) {
      setSlmcCertUrl(slmcCert.fileUrl || `/api/files/document/${slmcCert.id}`)
      setSlmcCertName(slmcCert.fileUrl?.split('/').pop() ?? 'slmc_certificate.pdf')
    } else {
      setSlmcCertUrl('')
      setSlmcCertName('')
    }

    setNewAvatarFile(null)
    setNewAvatarPreview(null)
    setNewSignatureFile(null)
    setNewSignaturePreview(null)
    setSlmcCertFile(null)
    setErrors({})
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (location.state?.mode === 'edit') {
      setMode('edit')
    }
  }, [location.state])

  const handleEditClick = () => {
    setMode('edit')
    setSaveError(null)
  }

  const handleCancelClick = () => {
    if (user) {
      populateForm(user)
      fetchQualifications()
    }
    setMode('view')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Avatar size cannot exceed 2 MB' }))
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Only JPG and PNG images are allowed' }))
      return
    }
    setNewAvatarFile(file)
    setNewAvatarPreview(URL.createObjectURL(file))
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.avatar
      return copy
    })
  }

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, signature: 'Signature size cannot exceed 2 MB' }))
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, signature: 'Only JPG, PNG, and SVG files are allowed' }))
      return
    }

    if (signatureUrl && !newSignatureFile) {
      setShowReplaceSigWarning(true)
      setPendingSignature(file)
    } else {
      applySignatureFile(file)
    }
  }

  const confirmSignatureReplace = () => {
    if (pendingSignature) {
      applySignatureFile(pendingSignature)
    }
    setShowReplaceSigWarning(false)
    setPendingSignature(null)
  }

  const applySignatureFile = (file: File) => {
    setNewSignatureFile(file)
    setNewSignaturePreview(URL.createObjectURL(file))
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.signature
      return copy
    })
  }

  const removeSelectedSignature = () => {
    setNewSignatureFile(null)
    setNewSignaturePreview(null)
  }

  const handleSlmcCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, slmcCert: 'Certificate size cannot exceed 2 MB' }))
      return
    }
    setSlmcCertFile(file)
    setSlmcCertName(file.name)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.slmcCert
      return copy
    })
  }

  const handleAddQualification = () => {
    setQualifications([...qualifications, { name: '', isNew: true }])
  }

  const handleQualificationChange = (index: number, name: string) => {
    const updated = [...qualifications]
    updated[index].name = name
    setQualifications(updated)
  }

  const handleQualificationFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Certificate size cannot exceed 2 MB')
      return
    }
    const updated = [...qualifications]
    updated[index].file = file
    setQualifications(updated)
  }

  const handleQualificationDelete = (index: number) => {
    const updated = [...qualifications]
    if (updated[index].isNew) {
      updated.splice(index, 1)
    } else {
      updated[index].isDeleted = true
    }
    setQualifications(updated)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!firstName.trim()) newErrors.firstName = 'First Name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required'
    if (!specialty) newErrors.specialty = 'Core Speciality is required'
    if (mobileNumber && !isValidLkMobile(mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567).'
    }
    if (nicNumber && !isValidNic(nicNumber)) {
      newErrors.nicNumber = 'Please enter a valid Sri Lankan NIC number.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!validateForm()) return

    try {
      setSaveLoading(true)

      const patchData = {
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        mobileNumber: mobileNumber ? (normalizeLkMobile(mobileNumber) || mobileNumber) : null,
        gender: gender || null,
        specialty: specialty || null,
        subSpecialty: subSpecialty || null,
        bio: bio || null,
        nicNumber: nicNumber ? (normalizeNic(nicNumber) || nicNumber) : null,
        slmcRegNumber: slmcRegNumber || null
      }

      await updateProfile(patchData)

      if (newAvatarFile) {
        const formData = new FormData()
        formData.append('file', newAvatarFile)
        await httpClient.post('/api/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      if (newSignatureFile) {
        const formData = new FormData()
        formData.append('file', newSignatureFile)
        await httpClient.post('/api/profile/signature', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      if (slmcCertFile) {
        const formData = new FormData()
        formData.append('file', slmcCertFile)
        formData.append('type', '2') 
        await httpClient.post('/api/profile/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // Process Qualifications
      for (const q of qualifications) {
        if (q.isDeleted && q.id) {
          await httpClient.delete(`/api/profile/qualifications/${q.id}`)
        } else if (q.isNew && q.name.trim()) {
          const formData = new FormData()
          formData.append('name', q.name.trim())
          if (q.file) formData.append('file', q.file)
          await httpClient.post('/api/profile/qualifications', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      }

      const finalProfile = await fetchProfile()
      populateForm(finalProfile)
      await fetchQualifications()

      setToastMessage('Profile updated successfully!')
      setToastOpen(true)
      setMode('view')
      
    } catch (err: any) {
      setSaveError(err.response?.data?.error?.message ?? err.message ?? 'An error occurred while saving.')
    } finally {
      setSaveLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: '20px', p: 1 }}>
        <CardContent>
          <Stack spacing={3}>
            <Skeleton variant="text" width={180} height={32} />
            <Skeleton variant="circular" width={80} height={80} />
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '8px' }} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (pageError) {
    return (
      <Card variant="outlined" sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {pageError}
          </Alert>
          <Button variant="contained" onClick={loadData} className="gradient-primary-btn" sx={{ px: 4, py: 1.2, borderRadius: '12px' }}>
            Retry Loading Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isEdit = mode === 'edit'
  const finalAvatarSrc = newAvatarPreview || getFullImageUrl(profilePictureUrl)
  const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'DR'

  return (
    <Box>
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
          {!isEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                position: 'absolute',
                top: { xs: 16, sm: 32 },
                right: { xs: 16, sm: 32 },
                borderRadius: '12px',
                px: 3,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                borderColor: 'rgba(143, 0, 255, 0.25)',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(143, 0, 255, 0.04)',
                },
              }}
            >
              Edit Profile
            </Button>
          )}
          <Stack component="form" onSubmit={handleSaveSubmit} spacing={4}>

            {saveError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {saveError}
              </Alert>
            )}

            {/* Basic Info */}
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
                Basic Information
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Avatar
                  src={finalAvatarSrc || undefined}
                  alt="Avatar"
                  sx={{ width: 100, height: 100, fontSize: '2.5rem', fontWeight: 800, bgcolor: 'primary.main' }}
                >
                  {initials}
                </Avatar>
                {isEdit && (
                  <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                    <input type="file" accept="image/png, image/jpeg" ref={avatarInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
                    <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} onClick={() => avatarInputRef.current?.click()}>Upload Photo</Button>
                    {errors.avatar && <Typography variant="caption" color="error.main">{errors.avatar}</Typography>}
                  </Stack>
                )}
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? <TextField label="First Name *" fullWidth value={firstName} onChange={e => setFirstName(e.target.value)} error={!!errors.firstName} helperText={errors.firstName} /> : <Box><Typography variant="caption" color="text.secondary">First Name</Typography><Typography variant="body1" fontWeight={700}>{firstName || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? <TextField label="Last Name *" fullWidth value={lastName} onChange={e => setLastName(e.target.value)} error={!!errors.lastName} helperText={errors.lastName} /> : <Box><Typography variant="caption" color="text.secondary">Last Name</Typography><Typography variant="body1" fontWeight={700}>{lastName || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box><Typography variant="caption" color="text.secondary">Email Address</Typography><Typography variant="body1" fontWeight={700}>{email || '—'}</Typography></Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? <TextField label="Phone Number" fullWidth value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} error={!!errors.mobileNumber} helperText={errors.mobileNumber} /> : <Box><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography variant="body1" fontWeight={700}>{mobileNumber || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? <TextField label="Date of Birth" type="date" fullWidth value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} InputLabelProps={{ shrink: true }} /> : <Box><Typography variant="caption" color="text.secondary">Date of Birth</Typography><Typography variant="body1" fontWeight={700}>{dateOfBirth || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? (
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select label="Gender" value={gender} onChange={e => setGender(e.target.value)}>
                        <MenuItem value=""><em>Select gender</em></MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  ) : <Box><Typography variant="caption" color="text.secondary">Gender</Typography><Typography variant="body1" fontWeight={700}>{gender || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? <TextField label="NIC Number" fullWidth value={nicNumber} onChange={e => setNicNumber(e.target.value)} error={!!errors.nicNumber} helperText={errors.nicNumber || 'e.g., 882441524V or 199824401524'} /> : <Box><Typography variant="caption" color="text.secondary">NIC Number</Typography><Typography variant="body1" fontWeight={700}>{nicNumber || '—'}</Typography></Box>}
                </Grid>
              </Grid>
            </Box>
            <Divider />

            {/* Profession Information */}
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
                Profession Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? (
                    <FormControl fullWidth error={!!errors.specialty}>
                      <InputLabel>Core Speciality *</InputLabel>
                      <Select label="Core Speciality *" value={specialty} onChange={e => { setSpecialty(e.target.value); setSubSpecialty(''); }}>
                        <MenuItem value=""><em>Select core speciality</em></MenuItem>
                        {Object.keys(specialties).map((spec) => <MenuItem key={spec} value={spec}>{spec}</MenuItem>)}
                      </Select>
                      {errors.specialty && <FormHelperText>{errors.specialty}</FormHelperText>}
                    </FormControl>
                  ) : <Box><Typography variant="caption" color="text.secondary">Core Speciality</Typography><Typography variant="body1" fontWeight={700}>{specialty || '—'}</Typography></Box>}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {isEdit ? (
                    <FormControl fullWidth>
                      <InputLabel>Sub-Speciality</InputLabel>
                      <Select label="Sub-Speciality" value={subSpecialty} onChange={e => setSubSpecialty(e.target.value)} disabled={!specialty}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {specialty && specialties[specialty]?.map((subSpec) => <MenuItem key={subSpec} value={subSpec}>{subSpec}</MenuItem>)}
                      </Select>
                    </FormControl>
                  ) : <Box><Typography variant="caption" color="text.secondary">Sub-Speciality</Typography><Typography variant="body1" fontWeight={700}>{subSpecialty || '—'}</Typography></Box>}
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(143,0,255,0.03)', borderRadius: 2, border: '1px solid rgba(143,0,255,0.1)' }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>SLMC Verification</Typography>
                <Grid container spacing={3} alignItems="center">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    {isEdit ? <TextField label="SLMC Registration Number" fullWidth value={slmcRegNumber} onChange={e => setSlmcRegNumber(e.target.value)} /> : <Box><Typography variant="caption" color="text.secondary">SLMC Number</Typography><Typography variant="body1" fontWeight={700}>{slmcRegNumber || '—'}</Typography></Box>}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    {!isEdit ? (
                      <Box>
                        {slmcCertUrl ? <Button href={getFullImageUrl(slmcCertUrl)} target="_blank" variant="outlined" size="small">View SLMC Certificate</Button> : <Typography variant="body2" color="text.secondary">No SLMC Certificate</Typography>}
                      </Box>
                    ) : (
                      <Box>
                        <input type="file" ref={slmcCertInputRef} onChange={handleSlmcCertChange} style={{ display: 'none' }} accept="application/pdf,image/*" />
                        <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => slmcCertInputRef.current?.click()} fullWidth sx={{ height: '56px' }}>
                          {slmcCertFile ? slmcCertName : (slmcCertName ? `Replace: ${slmcCertName}` : 'Upload SLMC Certificate')}
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Divider />

            {/* Qualifications Section */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  Qualifications
                </Typography>
                {isEdit && (
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddQualification}>
                    Add Qualification
                  </Button>
                )}
              </Stack>
              {qualifications.filter(q => !q.isDeleted).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No qualifications added.</Typography>
              ) : (
                <Stack spacing={2}>
                  {qualifications.map((q, idx) => {
                    if (q.isDeleted) return null
                    return (
                      <Card key={q.id || idx} variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          {isEdit ? (
                            <Grid container spacing={2} alignItems="center">
                              <Grid size={{ xs: 12, sm: 5 }}>
                                <TextField label="Qualification Name" fullWidth size="small" value={q.name} onChange={e => handleQualificationChange(idx, e.target.value)} />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 5 }}>
                                <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadIcon />} fullWidth>
                                  {q.file ? q.file.name : (q.hasCertificate ? 'Replace Certificate' : 'Upload Certificate')}
                                  <input type="file" hidden onChange={e => handleQualificationFileChange(idx, e)} />
                                </Button>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 2 }} textAlign="right">
                                <IconButton color="error" onClick={() => handleQualificationDelete(idx)}><DeleteIcon /></IconButton>
                              </Grid>
                            </Grid>
                          ) : (
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight={700}>{q.name}</Typography>
                              {q.certificateUrl && <Button href={getFullImageUrl(q.certificateUrl)} target="_blank" size="small" variant="text">View Certificate</Button>}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </Stack>
              )}
            </Box>
            <Divider />

            {/* Bio / About - Made fully viewable */}
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
                Bio / About
              </Typography>
              {isEdit ? (
                <Box sx={{
                  '.ql-editor': {
                    minHeight: '200px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  },
                  '.ql-container': {
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                  },
                  '.ql-toolbar': {
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                  }
                }}>
                  <ReactQuill theme="snow" value={bio} onChange={setBio} placeholder="Write something about yourself..." />
                </Box>
              ) : (
                <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  {bio ? (
                    <Box className="ql-snow" sx={{ '& .ql-editor': { p: 0, minHeight: 'auto', fontSize: '1rem', fontFamily: 'inherit' } }}>
                      <Box className="ql-editor" dangerouslySetInnerHTML={{ __html: bio }} />
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>No bio provided.</Typography>
                  )}
                </Box>
              )}
            </Box>
            <Divider />

            {/* E-Signature */}
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main" gutterBottom>
                E-Signature
              </Typography>
              {!isEdit ? (
                <Box>
                  {signatureUrl ? (
                    <Box sx={{ border: '1px solid rgba(143, 0, 255, 0.1)', borderRadius: 2, p: 2, display: 'inline-block', bgcolor: 'white' }}>
                      <img src={getFullImageUrl(signatureUrl)} alt="E-signature" style={{ maxHeight: 60, display: 'block' }} />
                    </Box>
                  ) : <Typography variant="body2" color="text.secondary">No e-signature uploaded.</Typography>}
                </Box>
              ) : (
                <Box>
                  <input type="file" ref={signatureInputRef} onChange={handleSignatureChange} style={{ display: 'none' }} accept="image/*" />
                  <Stack direction="row" spacing={3} alignItems="center">
                    {(newSignaturePreview || signatureUrl) && (
                      <Box sx={{ border: '1px solid rgba(143, 0, 255, 0.1)', borderRadius: 2, p: 2, bgcolor: 'white' }}>
                        <img src={newSignaturePreview || getFullImageUrl(signatureUrl)} alt="E-signature preview" style={{ maxHeight: 60, display: 'block' }} />
                      </Box>
                    )}
                    <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => signatureInputRef.current?.click()}>
                      {signatureUrl || newSignaturePreview ? 'Replace Signature' : 'Upload Signature'}
                    </Button>
                    {newSignaturePreview && <Button color="error" onClick={removeSelectedSignature}>Remove</Button>}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Save Buttons at Bottom */}
            {isEdit && (
              <Box sx={{ position: 'sticky', bottom: 16, zIndex: 10, bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="text" color="inherit" onClick={handleCancelClick} disabled={saveLoading} sx={{ px: 3 }}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={saveLoading} className="gradient-primary-btn" sx={{ px: 4 }}>
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}

          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showReplaceSigWarning} onClose={() => { setShowReplaceSigWarning(false); setPendingSignature(null); }}>
        <DialogTitle>Replace E-Signature?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will replace your existing signature on record. Do you want to continue?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowReplaceSigWarning(false); setPendingSignature(null); }}>Cancel</Button>
          <Button onClick={confirmSignatureReplace} color="primary" variant="contained">Continue</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
