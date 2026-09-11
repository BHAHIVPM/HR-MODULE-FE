import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeManagementPage from './features/employee/pages/EmployeeManagementPage';
import { NotificationProvider } from './context/NotificationContext';
import employeeService from './features/employee/services/employeeService';

jest.mock('./features/employee/services/employeeService', () => ({
  __esModule: true,
  default: {
    findAllActive: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
    employeeService.findAllActive.mockResolvedValue({
      data: {
        header: 'Success',
        message: 'Active employees loaded.',
        statusCode: 200,
        responseOutput: mockEmployees,
      },
    });
    employeeService.findAll.mockResolvedValue({
      data: {
        header: 'Success',
        message: 'All employees loaded.',
        statusCode: 200,
        responseOutput: mockEmployees,
      },
    });
    employeeService.update.mockResolvedValue({
      data: { message: 'Employee updated successfully' },
    });
    employeeService.delete.mockResolvedValue({
      data: { message: 'Employee deleted successfully.' },
    });
  });

  test('renders EmployeeManagementPage with employee directory', async () => {
    render(
      <NotificationProvider>
        <EmployeeManagementPage />
      </NotificationProvider>
    );

    expect(screen.getByText(/Employee Directory/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by code, name, email, department/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add New Employee/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('john.doe@company.com')).toBeInTheDocument();
    });
  });

  test('updates employee status via status change dropdown', async () => {
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
      expect(employeeService.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'INACTIVE' }));
    });
  });
});
