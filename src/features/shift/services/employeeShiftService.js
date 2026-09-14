import axiosClient from '../../../api/axiosClient';

const employeeShiftService = {
  assign: (employeeShift) => axiosClient.post('/employee-shift/assign', employeeShift),
  findById: (employeeShiftId) => axiosClient.get(`/employee-shift/${employeeShiftId}`),
  findCurrentByEmployee: (employeeId) => axiosClient.get(`/employee-shift/current/${employeeId}`),
  findHistoryByEmployee: (employeeId) => axiosClient.get(`/employee-shift/history/${employeeId}`),
  findAll: () => axiosClient.get('/employee-shift/all'),
  delete: (employeeShiftId) => axiosClient.delete(`/employee-shift/${employeeShiftId}`),
};

export default employeeShiftService;
