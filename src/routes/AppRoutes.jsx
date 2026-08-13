import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UserRegistrationPage from '../features/registration/pages/UserRegistrationPage';
import EmployeeRegistrationPage from '../features/registration/pages/EmployeeRegistrationPage';
import ClientRegistrationPage from '../features/registration/pages/ClientRegistrationPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

function AppRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/registrations/user" element={<UserRegistrationPage />} />
              <Route path="/registrations/employee" element={<EmployeeRegistrationPage />} />
              <Route path="/registrations/client" element={<ClientRegistrationPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppRoutes;
