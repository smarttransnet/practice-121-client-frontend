import { useAuthStore } from './authStore'

export function useAuth() {
  const store = useAuthStore()
  
  return {
    token: store.token,
    user: store.user,
    otpSessionId: store.otpSessionId,
    otpAccountId: store.otpAccountId,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    
    login: store.login,
    register: store.register,
    googleLogin: store.googleLogin,
    verifyOtp: store.verifyOtp,
    resendOtp: store.resendOtp,
    logout: store.logout,
    fetchProfile: store.fetchProfile,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
  }
}
