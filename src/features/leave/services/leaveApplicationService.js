import axiosClient from '../../../api/axiosClient';

const leaveApplicationService = {
  apply: (application) => axiosClient.post('/leave-application/apply', application),
  findById: (leaveApplicationId) => axiosClient.get(`/leave-application/${leaveApplicationId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/leave-application/by-employee/${employeeId}`),
  findPending: () => axiosClient.get('/leave-application/pending'),
  findAll: () => axiosClient.get('/leave-application/all'),
  approve: (leaveApplicationId, approverEmployeeId, remarks) =>
    axiosClient.put(`/leave-application/${leaveApplicationId}/approve/${approverEmployeeId}`, null, {
      params: remarks ? { remarks } : {},
    }),
  reject: (leaveApplicationId, approverEmployeeId, remarks) =>
    axiosClient.put(`/leave-application/${leaveApplicationId}/reject/${approverEmployeeId}`, null, {
      params: remarks ? { remarks } : {},
    }),
  cancel: (leaveApplicationId) => axiosClient.put(`/leave-application/${leaveApplicationId}/cancel`),
  delete: (leaveApplicationId) => axiosClient.delete(`/leave-application/${leaveApplicationId}`),
};

export default leaveApplicationService;
