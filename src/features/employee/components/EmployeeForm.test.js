import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorModal from '../../../components/common/ErrorModal/ErrorModal';
import Toast from '../../../components/common/Toast/Toast';
import { NotificationProvider, useNotification } from '../../../context/NotificationContext';
import EmployeeForm from './EmployeeForm';
import employeeService from '../services/employeeService';

jest.mock('../services/employeeService', () => ({
  __esModule: true,
  default: {
    checkCodeExists: jest.fn(),
    createEmployee: jest.fn(),
    updateEmployee: jest.fn(),
    searchByName: jest.fn(),
    findByReportingManagerId: jest.fn(),
    softDelete: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

describe('Notification & Error Modal System', () => {
  test('renders ErrorModal with title and message when open', () => {
    const handleClose = jest.fn();
    render(
      <ErrorModal
        isOpen={true}
        error={{
          title: 'Database Failure',
          message: 'Unable to connect to database.',
          statusCode: 500,
        }}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Database Failure')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to database.')).toBeInTheDocument();
    expect(screen.getByText(/Status 500/i)).toBeInTheDocument();

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('renders Toast notification with message and progress bar', () => {
    const handleClose = jest.fn();
    render(
      <Toast
        id="toast-1"
        type="success"
        title="Success"
        message="Employee saved successfully"
        duration={1500}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Employee saved successfully')).toBeInTheDocument();
  });
});

describe('EmployeeForm Component', () => {
  const renderWithNotification = (ui) => {
    return render(<NotificationProvider>{ui}</NotificationProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    employeeService.checkCodeExists.mockResolvedValue({ data: { responseOutput: false } });
    employeeService.createEmployee.mockResolvedValue({ data: { message: 'Employee created successfully.' } });
    employeeService.updateEmployee.mockResolvedValue({ data: { message: 'Employee updated successfully.' } });
  });

  test('renders all Employee Master form inputs', () => {
    renderWithNotification(<EmployeeForm />);

    expect(screen.getByLabelText(/Employee Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Joining/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  test('validates required fields on submission and shows error modal', async () => {
    renderWithNotification(<EmployeeForm />);

    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    fireEvent.click(submitBtn);

    // Validation error modal pops up
    await waitFor(() => {
      expect(screen.getByText(/Validation Error/i)).toBeInTheDocument();
    });
  });

  test('checks employee code uniqueness on blur and warns when code already exists', async () => {
    employeeService.checkCodeExists.mockResolvedValueOnce({
      data: { responseOutput: true },
    });

    renderWithNotification(<EmployeeForm />);

    const codeInput = screen.getByLabelText(/Employee Code/i);
    fireEvent.change(codeInput, { target: { value: 'DUPLICATE_CODE' } });
    fireEvent.blur(codeInput);

    await waitFor(() => {
      expect(employeeService.checkCodeExists).toHaveBeenCalledWith('DUPLICATE_CODE');
      expect(screen.getByText(/already in use/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data and triggers success', async () => {
    const handleSuccess = jest.fn();
    renderWithNotification(<EmployeeForm onSuccess={handleSuccess} />);

    fireEvent.change(screen.getByLabelText(/Employee Code/i), { target: { value: 'EMP1001' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Date of Joining/i), { target: { value: '2025-01-15' } });

    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(employeeService.createEmployee).toHaveBeenCalledTimes(1);
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  test('shows backend error pop-up modal when submission fails', async () => {
    employeeService.createEmployee.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          header: 'Database Exception',
          message: 'Could not persist employee record to database.',
        },
      },
    });

    renderWithNotification(<EmployeeForm />);

    fireEvent.change(screen.getByLabelText(/Employee Code/i), { target: { value: 'EMP1001' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Date of Joining/i), { target: { value: '2025-01-15' } });

    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Database Exception')).toBeInTheDocument();
      expect(screen.getByText('Could not persist employee record to database.')).toBeInTheDocument();
    });
  });
});
