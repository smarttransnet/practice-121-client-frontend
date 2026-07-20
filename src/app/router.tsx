import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsLayout } from '../layout/SettingsLayout';
import { ProfileEditPage } from '../pages/ProfileEditPage';
import { FavoritesListPage } from '../pages/FavoritesListPage';
import { TodosPage } from '../pages/TodosPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OTPVerifyPage } from '../pages/OTPVerifyPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { VerifyProcessPage } from '../pages/VerifyProcessPage';
import { PublicProfilePage } from '../pages/PublicProfilePage';
import { PracticeCentresTab } from '../features/practice-centres/PracticeCentresTab';
import { RegisterPatientPage } from '../pages/RegisterPatientPage';
import { CreatePatientPage } from '../pages/CreatePatientPage';
import { PatientQueue } from '../pages/PatientQueue';

const router = createBrowserRouter([
  { path: '/patient-queue', element: <PatientQueue /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/patient', element: <RegisterPatientPage /> },
  { path: '/verify-otp', element: <OTPVerifyPage /> },
  { path: '/doctor/:id', element: <PublicProfilePage /> },
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
      { path: 'patients/new', element: <CreatePatientPage /> },
      { path: 'todos', element: <TodosPage /> },
      {
        path: 'settings',
        element: <SettingsLayout />, // Settings layout wrapper
        children: [
          { index: true, element: <Navigate to="profile-edit" replace /> },
          { path: 'profile-edit', element: <ProfileEditPage /> },
          { path: 'favorites-list', element: <FavoritesListPage /> },
          { path: 'practice-centres', element: <PracticeCentresTab /> },
        ],
      },
      { path: 'verify-process', element: <VerifyProcessPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
