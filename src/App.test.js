import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeManagementPage from './features/employee/pages/EmployeeManagementPage';
import { NotificationProvider } from './context/NotificationContext';
import employeeService from './features/employee/services/employeeService';

jest.mock('./features/employee/services/employeeService', () => ({
  __esModule: true,
  default: {
    searchByName: jest.fn(),
    findByReportingManagerId: jest.fn(),
    updateStatus: jest.fn(),
    softDelete: jest.fn(),
    checkCodeExists: jest.fn(),
  },
}));

describe('EmployeeManagementPage Component', () => {
  const mockEmployees = [
    {
      employeeId: 1,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      mobileNo: '9876543210',
      dateOfJoining: '2024-01-01',
      department: 'Engineering',
      designation: 'Tech Lead',
      reportingManagerId: null,
      status: 'ACTIVE',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    employeeService.searchByName.mockResolvedValue({
      data: {
        header: 'Success',
        message: 'Employee search completed.',
        statusCode: 200,
        responseOutput: mockEmployees,
      },
    });
    employeeService.updateStatus.mockResolvedValue({
      data: { message: 'Employee status updated to INACTIVE' },
    });
    employeeService.softDelete.mockResolvedValue({
      data: { message: 'Employee deactivated successfully.' },
    });
    employeeService.findByReportingManagerId.mockResolvedValue({
      data: {
        header: 'Success',
        message: 'Direct reports fetched.',
        responseOutput: mockEmployees,
      },
    });
  });

  test('renders EmployeeManagementPage with employee directory and action controls', async () => {
    render(
      <NotificationProvider>
        <EmployeeManagementPage />
      </NotificationProvider>
    );

    expect(screen.getByText(/Employee Management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by first or last name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add New Employee/i })).toBeInTheDocument();

    // Verify employee record is loaded
    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('john.doe@company.com')).toBeInTheDocument();
    });
  });

  test('updates employee status via quick dropdown', async () => {
    render(
      <NotificationProvider>
        <EmployeeManagementPage />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByTitle('Quick Status Update');
    fireEvent.change(statusSelect, { target: { value: 'INACTIVE' } });

    await waitFor(() => {
      expect(employeeService.updateStatus).toHaveBeenCalledWith(1, 'INACTIVE');
    });
  });

  test('fetches direct reports when searching by Manager ID', async () => {
    render(
      <NotificationProvider>
        <EmployeeManagementPage />
      </NotificationProvider>
    );

    const mgrInput = screen.getByPlaceholderText('Manager ID');
    fireEvent.change(mgrInput, { target: { value: '10' } });

    const fetchTeamBtn = screen.getByRole('button', { name: /fetch team/i });
    fireEvent.click(fetchTeamBtn);

    await waitFor(() => {
      expect(employeeService.findByReportingManagerId).toHaveBeenCalledWith(10);
    });
  });
});
