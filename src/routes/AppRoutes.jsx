import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import EmployeeManagementPage from '../features/employee/pages/EmployeeManagementPage';
import UserManagementPage from '../features/user/pages/UserManagementPage';
import UserRegistrationPage from '../features/registration/pages/UserRegistrationPage';
import EmployeeRegistrationPage from '../features/registration/pages/EmployeeRegistrationPage';
import ClientRegistrationPage from '../features/registration/pages/ClientRegistrationPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

function AppRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
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
                <Route path="/employees" element={<EmployeeManagementPage />} />
                <Route path="/userData" element={<UserManagementPage />} />
                <Route path="/clients" element={<ClientRegistrationPage />} />
                <Route path="/registrations/user" element={<UserRegistrationPage />} />
                <Route path="/registrations/employee" element={<EmployeeRegistrationPage />} />
                <Route path="/registrations/client" element={<ClientRegistrationPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppRoutes;


