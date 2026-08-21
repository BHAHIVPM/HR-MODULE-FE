import axiosClient from '../../../api/axiosClient';

/**
 * Employee API Service matching Spring Boot EmployeeMasterController
 */
const employeeService = {
  /**
   * Save a new employee
   * POST /employee/save
   */
  save: (employeeData) => {
    return axiosClient.post('/employee/save', employeeData);
  },

  /**
   * Find employee by ID
   * GET /employee/{employeeId}
   */
  findById: (employeeId) => {
    return axiosClient.get(`/employee/${employeeId}`);
  },

  /**
   * Find all active employees
   * GET /employee/active
   */
  findAllActive: () => {
    return axiosClient.get('/employee/active');
  },

  /**
   * Find all employees (active and inactive)
   * GET /employee/all
   */
  findAll: () => {
    return axiosClient.get('/employee/all');
  },

  /**
   * Update existing employee
   * PUT /employee/update/{employeeId}
   */
  update: (employeeId, updates) => {
    return axiosClient.put(`/employee/update/${employeeId}`, updates);
  },

  /**
   * Delete employee by ID
   * DELETE /employee/{employeeId}
   */
  delete: (employeeId) => {
    return axiosClient.delete(`/employee/${employeeId}`);
  },
};

export default employeeService;

