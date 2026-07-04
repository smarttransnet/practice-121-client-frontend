import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileDropdown } from '../ProfileDropdown'
import { useAuth } from '../../features/auth/useAuth'
import { useNavigate } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock useAuth
vi.mock('../../features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}))

describe('ProfileDropdown Component', () => {
  const mockNavigate = vi.fn()
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useNavigate as any).mockReturnValue(mockNavigate)
  })

  it('does not render if the user is not authenticated', () => {
    ;(useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: mockLogout,
    })

    const { container } = render(<ProfileDropdown />)
    expect(container.firstChild).toBeNull()
  })

  it('renders loading skeleton when isLoading is true', () => {
    ;(useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<ProfileDropdown />)
    // Skeletons are rendered as HTMLSpanElement with class or styles
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders user details when authenticated and loaded', () => {
    ;(useAuth as any).mockReturnValue({
      user: {
        accountId: '123',
        fullName: 'Sunil Perera',
        email: 'sunil.perera@example.com',
        profilePictureUrl: null,
        completionStatus: 'MINIMAL',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<ProfileDropdown />)

    // Name and Email displayed
    expect(screen.getByText('Sunil Perera')).toBeInTheDocument()
    expect(screen.getByText('sunil.perera@example.com')).toBeInTheDocument()
  })

  it('falls back to initials when avatar image is missing or errors', () => {
    ;(useAuth as any).mockReturnValue({
      user: {
        accountId: '123',
        fullName: 'Sunil Perera',
        email: 'sunil.perera@example.com',
        profilePictureUrl: null,
        completionStatus: 'MINIMAL',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<ProfileDropdown />)

    // Initials "SP" for "Sunil Perera" should be displayed in the Avatar
    expect(screen.getByText('SP')).toBeInTheDocument()
  })

  it('opens and closes the menu on click and navigates to Edit Profile', () => {
    ;(useAuth as any).mockReturnValue({
      user: {
        accountId: '123',
        fullName: 'Sunil Perera',
        email: 'sunil.perera@example.com',
        profilePictureUrl: '/avatar.jpg',
        completionStatus: 'MINIMAL',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<ProfileDropdown />)

    // Trigger button should have aria-expanded="false" initially
    const trigger = screen.getByRole('button', { name: 'User menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click to open
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // Menu options should be visible
    const editProfileOption = screen.getByText('Edit Profile')
    expect(editProfileOption).toBeInTheDocument()

    // Click Edit Profile -> closes menu and navigates
    fireEvent.click(editProfileOption)
    expect(mockNavigate).toHaveBeenCalledWith('/settings')
  })

  it('calls logout action and navigates to login when Sign Out is clicked', () => {
    ;(useAuth as any).mockReturnValue({
      user: {
        accountId: '123',
        fullName: 'Sunil Perera',
        email: 'sunil.perera@example.com',
        profilePictureUrl: '/avatar.jpg',
        completionStatus: 'MINIMAL',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<ProfileDropdown />)

    const trigger = screen.getByRole('button', { name: 'User menu' })
    fireEvent.click(trigger)

    const signOutOption = screen.getByText('Sign Out')
    fireEvent.click(signOutOption)

    expect(mockLogout).toHaveBeenCalled()
  })
})
