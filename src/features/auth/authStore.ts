import { create } from 'zustand'
import { httpClient } from '../../api/httpClient'

export type UserProfile = {
  accountId: string;
  email: string;
  fullName: string;
  completionStatus: 'MINIMAL' | 'PARTIAL' | 'COMPLETE';
  profilePictureUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  bio?: string | null;
  mobileNumber?: string | null;
  dateOfBirth?: string | null;
  specialty?: string | null;
  subSpecialty?: string | null;
  slmcRegNumber?: string | null;
  nicNumber?: string | null;
  qualifications?: any[] | null;
  eSignature?: {
    signatureDataUrl: string;
    signedAt: string;
  } | null;
  documents?: {
    id: string;
    type: string | number;
    fileUrl: string;
    status: string;
    uploadedAt: string;
  }[] | null;
}

type AuthState = {
  token: string | null
  user: UserProfile | null
  otpSessionId: string | null
  otpAccountId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<string>
  register: (name: string, email: string, password: string) => Promise<string>
  googleLogin: (idToken: string) => Promise<string>
  verifyOtp: (code: string) => Promise<UserProfile>
  resendOtp: () => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<UserProfile>
  updateProfile: (data: any) => Promise<void>
  clearError: () => void
}

// Read initial token from localStorage if present
const initialToken = localStorage.getItem('token')
const initialUserStr = localStorage.getItem('user')
let initialUser: UserProfile | null = null
if (initialUserStr) {
  try {
    initialUser = JSON.parse(initialUserStr)
  } catch {
    // ignore
  }
}

if (initialToken) {
  httpClient.defaults.headers.common.Authorization = `Bearer ${initialToken}`
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: initialUser,
  otpSessionId: null,
  otpAccountId: null,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.post('/api/auth/login', { email, password })
      const resData = response.data
      if (resData.success) {
        const { accountId, otpSessionId } = resData.data
        set({ otpSessionId, otpAccountId: accountId, isLoading: false })
        return otpSessionId
      } else {
        throw new Error(resData.error?.message ?? 'Login failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Login failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.post('/api/auth/register', { name, email, password })
      const resData = response.data
      if (resData.success) {
        const { accountId, otpSessionId } = resData.data
        set({ otpSessionId, otpAccountId: accountId, isLoading: false })
        return otpSessionId
      } else {
        throw new Error(resData.error?.message ?? 'Registration failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Registration failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  googleLogin: async (idToken) => {
    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.post('/api/auth/google', { idToken })
      const resData = response.data
      if (resData.success) {
        const { accountId, otpSessionId } = resData.data
        set({ otpSessionId, otpAccountId: accountId, isLoading: false })
        return otpSessionId
      } else {
        throw new Error(resData.error?.message ?? 'Google Login failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Google Login failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  verifyOtp: async (code) => {
    const { otpSessionId } = get()
    if (!otpSessionId) {
      throw new Error('No active OTP session found')
    }

    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.post('/api/auth/verify-otp', {
        sessionId: otpSessionId,
        code,
      })
      const resData = response.data
      if (resData.success) {
        const { accessToken, refreshToken: _, profileCompletionStatus, accountId, email, fullName } = resData.data
        
        localStorage.setItem('token', accessToken)
        const userObj: UserProfile = {
          accountId,
          email,
          fullName,
          completionStatus: profileCompletionStatus,
        }
        localStorage.setItem('user', JSON.stringify(userObj))
        
        httpClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`

        set({
          token: accessToken,
          user: userObj,
          isAuthenticated: true,
          otpSessionId: null,
          otpAccountId: null,
          isLoading: false,
        })
        return userObj
      } else {
        throw new Error(resData.error?.message ?? 'Verification failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Verification failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  resendOtp: async () => {
    const { otpAccountId } = get()
    if (!otpAccountId) {
      throw new Error('No active registration or login account found')
    }

    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.post('/api/auth/resend-otp', {
        accountId: otpAccountId,
        channel: 2, // Default OtpChannel.EMAIL = 2
      })
      const resData = response.data
      if (resData.success) {
        set({ otpSessionId: resData.data.otpSessionId, isLoading: false })
      } else {
        throw new Error(resData.error?.message ?? 'Resend OTP failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Resend OTP failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

    logout: async () => {
    set({ isLoading: true })
    try {
      // Clear token and HttpOnly cookie
      await httpClient.post('/api/auth/logout', { refreshToken: null })
    } catch {
      // ignore logout failures
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete httpClient.defaults.headers.common.Authorization

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.get('/api/profile/me')
      const resData = response.data
      if (resData.success) {
        const profile = resData.data
        const userObj: UserProfile = {
          accountId: profile.accountId,
          email: profile.email,
          fullName: profile.fullName,
          completionStatus: profile.completionStatus,
          profilePictureUrl: profile.profilePictureUrl,
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          bio: profile.bio,
          mobileNumber: profile.mobileNumber,
          dateOfBirth: profile.dateOfBirth,
          specialty: profile.specialty,
          subSpecialty: profile.subSpecialty,
          slmcRegNumber: profile.slmcRegNumber,
          nicNumber: profile.nicNumber,
          qualifications: profile.qualifications,
          eSignature: profile.eSignature,
          documents: profile.documents,
        }
        localStorage.setItem('user', JSON.stringify(userObj))
        set({ user: userObj, isLoading: false })
        return userObj
      } else {
        throw new Error(resData.error?.message ?? 'Fetch profile failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Fetch profile failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await httpClient.patch('/api/profile/me', data)
      const resData = response.data
      if (resData.success) {
        // Fetch fresh profile state to update Zustand store
        await get().fetchProfile()
      } else {
        throw new Error(resData.error?.message ?? 'Update profile failed')
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message ?? err.message ?? 'Update profile failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },
}))
