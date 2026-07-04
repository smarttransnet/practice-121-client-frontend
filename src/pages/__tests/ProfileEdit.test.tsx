import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileEditPage } from '../ProfileEditPage'
import { useAuth } from '../../features/auth/useAuth'
import { httpClient } from '../../api/httpClient'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock useAuth
vi.mock('../../features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock httpClient
vi.mock('../../api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('ProfileEditPage Component', () => {
  const mockFetchProfile = vi.fn()
  const mockUpdateProfile = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user: {
        accountId: '123',
        firstName: 'Sunil',
        lastName: 'Perera',
        email: 'sunil.perera@example.com',
        mobileNumber: '+94771234567',
        dateOfBirth: '1985-05-10T00:00:00Z',
        gender: 'Male',
        specialty: 'Cardiology',
        bio: 'Experienced cardiologist.',
        profilePictureUrl: '/avatar.jpg',
        eSignature: {
          signatureDataUrl: '/signature.png',
        },
      },
      fetchProfile: mockFetchProfile,
      updateProfile: mockUpdateProfile,
    })

    // Mock enums response
    ;(httpClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: ['Cardiology', 'Neurology', 'Pediatrics'],
      },
    })

    // Mock fetchProfile response
    mockFetchProfile.mockResolvedValue({
      firstName: 'Sunil',
      lastName: 'Perera',
      email: 'sunil.perera@example.com',
      mobileNumber: '+94771234567',
      dateOfBirth: '1985-05-10T00:00:00Z',
      gender: 'Male',
      specialty: 'Cardiology',
      bio: 'Experienced cardiologist.',
      profilePictureUrl: '/avatar.jpg',
      eSignature: {
        signatureDataUrl: '/signature.png',
      },
    })
  })

  it('renders read-only view mode initially with retrieved values', async () => {
    render(<ProfileEditPage />)

    // Initially loading skeleton is shown
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument()

    // Wait for data load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // Read-only values should be visible
    expect(screen.getByText('Sunil')).toBeInTheDocument()
    expect(screen.getByText('Perera')).toBeInTheDocument()
    expect(screen.getByText('sunil.perera@example.com')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('Experienced cardiologist.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument()
  })

  it('toggles to edit mode when clicking Edit Profile', async () => {
    render(<ProfileEditPage />)

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    const editBtn = screen.getByRole('button', { name: 'Edit Profile' })
    fireEvent.click(editBtn)

    // Edit controls (inputs/textfields) should be visible
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Bio / About')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('shows error messages for empty required fields in edit mode', async () => {
    render(<ProfileEditPage />)

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))

    // Clear First Name and Last Name
    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')

    fireEvent.change(firstNameInput, { target: { value: '' } })
    fireEvent.change(lastNameInput, { target: { value: '' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    // Validation alerts should trigger
    await waitFor(() => {
      expect(screen.getByText('First Name is required')).toBeInTheDocument()
      expect(screen.getByText('Last Name is required')).toBeInTheDocument()
    })
  })

  it('enforces character limit on bio', async () => {
    render(<ProfileEditPage />)

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))

    const bioInput = screen.getByLabelText('Bio / About')
    // Generate text longer than 500 characters
    const longBio = 'a'.repeat(505)

    fireEvent.change(bioInput, { target: { value: longBio } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    await waitFor(() => {
      expect(screen.getByText('Bio cannot exceed 500 characters')).toBeInTheDocument()
    })
  })

  it('reverts all changes on Cancel click', async () => {
    render(<ProfileEditPage />)

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }))

    const firstNameInput = screen.getByLabelText('First Name *')
    fireEvent.change(firstNameInput, { target: { value: 'NewName' } })
    expect(firstNameInput).toHaveValue('NewName')

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Form returns to view mode with original value
    await waitFor(() => {
      expect(screen.getByText('Sunil')).toBeInTheDocument()
      expect(screen.queryByText('NewName')).not.toBeInTheDocument()
    })
  })
})
