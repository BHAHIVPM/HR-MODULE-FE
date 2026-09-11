import axiosClient from '../../../api/axiosClient';

const payrollService = {
  generate: (employeeId, month, year) =>
    axiosClient.post(`/payroll/generate/${employeeId}`, null, {
      params: { month, year },
    }),
  findById: (payrollId) => axiosClient.get(`/payroll/${payrollId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/payroll/by-employee/${employeeId}`),
  findByMonth: (month, year) =>
    axiosClient.get('/payroll/by-month', { params: { month, year } }),
  findAll: () => axiosClient.get('/payroll/all'),
  markPaid: (payrollId) => axiosClient.put(`/payroll/${payrollId}/mark-paid`),
  cancel: (payrollId) => axiosClient.put(`/payroll/${payrollId}/cancel`),
  delete: (payrollId) => axiosClient.delete(`/payroll/${payrollId}`),
};

export default payrollService;
