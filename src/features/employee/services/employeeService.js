import axiosClient from '../../../api/axiosClient';

/**
 * Employee API Service matching Spring Boot EmployeeMasterController
 */
const employeeService = {
  /**
   * Search employees by first or last name
   * GET /employee/search?keyword={keyword}
   */
  searchByName: (keyword) => {
    return axiosClient.get('/employee/search', {
      params: { keyword },
    });
  },

  /**
   * Fetch direct reports of a manager
   * GET /employee/manager/{managerId}
   */
  findByReportingManagerId: (managerId) => {
    return axiosClient.get(`/employee/manager/${managerId}`);
  },

  /**
   * Check if employee code already exists
   * GET /employee/exists/{employeeCode}
   * Returns ResponseMessage<Boolean> (responseOutput: true/false)
   */
  checkCodeExists: (employeeCode) => {
    return axiosClient.get(`/employee/exists/${encodeURIComponent(employeeCode)}`);
  },

  /**
   * Soft delete (deactivate) an employee
   * PATCH /employee/soft-delete/{employeeId}
   */
  softDelete: (employeeId) => {
    return axiosClient.patch(`/employee/soft-delete/${employeeId}`);
  },

  /**
   * Update employee status (ACTIVE, INACTIVE, RESIGNED, TERMINATED)
   * PATCH /employee/{employeeId}/status?status={status}
   */
  updateStatus: (employeeId, status) => {
    return axiosClient.patch(`/employee/${employeeId}/status`, null, {
      params: { status },
    });
  },

  /**
   * Create a new employee
   * POST /employee
   */
  createEmployee: (employeeData) => {
    return axiosClient.post('/employee', employeeData);
  },

  /**
   * Update an existing employee
   * PUT /employee/{employeeId}
   */
  updateEmployee: (employeeId, employeeData) => {
    return axiosClient.put(`/employee/${employeeId}`, employeeData);
  },
};

export default employeeService;
