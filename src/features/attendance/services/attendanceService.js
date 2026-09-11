import axiosClient from '../../../api/axiosClient';

const attendanceService = {
  save: (attendance) => axiosClient.post('/attendance/save', attendance),
  checkIn: (employeeId) => axiosClient.post(`/attendance/check-in/${employeeId}`),
  checkOut: (employeeId) => axiosClient.put(`/attendance/check-out/${employeeId}`),
  findById: (attendanceId) => axiosClient.get(`/attendance/${attendanceId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/attendance/by-employee/${employeeId}`),
  findByEmployeeAndRange: (employeeId, from, to) =>
    axiosClient.get(`/attendance/by-employee/${employeeId}/range`, { params: { from, to } }),
  findAll: () => axiosClient.get('/attendance/all'),
  update: (attendanceId, updates) => axiosClient.put(`/attendance/update/${attendanceId}`, updates),
  delete: (attendanceId) => axiosClient.delete(`/attendance/${attendanceId}`),
};

export default attendanceService;
