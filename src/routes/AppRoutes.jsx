import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
<<<<<<< HEAD
import { ThemeProvider } from '../context/ThemeContext';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UserRegistrationPage from '../features/registration/pages/UserRegistrationPage';
import EmployeeRegistrationPage from '../features/registration/pages/EmployeeRegistrationPage';
import ClientRegistrationPage from '../features/registration/pages/ClientRegistrationPage';
=======
import { NotificationProvider } from '../context/NotificationContext';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import EmployeeManagementPage from '../features/employee/pages/EmployeeManagementPage';
>>>>>>> d0ebdba3f460d4c0c55afbe2346a4b9167f24491
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

function AppRoutes() {
  return (
<<<<<<< HEAD
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
=======
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/employees" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EmployeeManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
>>>>>>> d0ebdba3f460d4c0c55afbe2346a4b9167f24491
  );
}

export default AppRoutes;
