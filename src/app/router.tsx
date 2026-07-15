import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsLayout } from '../layout/SettingsLayout'
import { ProfileEditPage } from '../pages/ProfileEditPage'
import { FavoritesListPage } from '../pages/FavoritesListPage'
import { TodosPage } from '../pages/TodosPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { OTPVerifyPage } from '../pages/OTPVerifyPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { VerifyProcessPage } from '../pages/VerifyProcessPage'
import { PublicProfilePage } from '../pages/PublicProfilePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-otp',
    element: <OTPVerifyPage />,
  },
  {
    path: '/doctor/:id',
    element: <PublicProfilePage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'todos', element: <TodosPage /> },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="profile-edit" replace /> },
          { path: 'profile-edit', element: <ProfileEditPage /> },
          { path: 'favorites-list', element: <FavoritesListPage /> },
        ],
      },
      { path: 'verify-process', element: <VerifyProcessPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])


