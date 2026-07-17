const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const registerPatient = async (data: {
  nicNumber: string
  firstName: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
  mobileNumber: string
  createdByDoctorId?: string
}) => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/patients/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.title || 'Registration failed')
  }

  return response.json()
}

export const uploadPatientDocument = async (
  patientId: string,
  type: number,
  file: File
) => {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('type', type.toString())
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/patients/${patientId}/documents`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.title || 'Upload failed')
  }

  return response.json()
}
