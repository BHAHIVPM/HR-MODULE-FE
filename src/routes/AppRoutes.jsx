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

import OrganizationPage from '../features/organization/pages/OrganizationPage';
import ShiftManagementPage from '../features/shift/pages/ShiftManagementPage';
import AttendancePage from '../features/attendance/pages/AttendancePage';
import LeaveManagementPage from '../features/leave/pages/LeaveManagementPage';
import HolidayPage from '../features/holiday/pages/HolidayPage';
import PayrollManagementPage from '../features/payroll/pages/PayrollManagementPage';
import AssetManagementPage from '../features/asset/pages/AssetManagementPage';
import DocumentManagementPage from '../features/document/pages/DocumentManagementPage';
import PerformanceReviewPage from '../features/performance/pages/PerformanceReviewPage';

import ServerDownModal from '../components/common/ServerDownModal/ServerDownModal';

function AppRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ServerDownModal />
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
                <Route path="/organization" element={<OrganizationPage />} />
                <Route path="/shifts" element={<ShiftManagementPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/leaves" element={<LeaveManagementPage />} />
                <Route path="/holidays" element={<HolidayPage />} />
                <Route path="/payroll-management" element={<PayrollManagementPage />} />
                <Route path="/assets" element={<AssetManagementPage />} />
                <Route path="/documents" element={<DocumentManagementPage />} />
                <Route path="/performance-reviews" element={<PerformanceReviewPage />} />
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


