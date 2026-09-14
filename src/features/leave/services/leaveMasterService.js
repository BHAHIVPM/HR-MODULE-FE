import axiosClient from '../../../api/axiosClient';

const leaveMasterService = {
  save: (leaveType) => axiosClient.post('/leave-type/save', leaveType),
  findById: (leaveTypeId) => axiosClient.get(`/leave-type/${leaveTypeId}`),
  findAllActive: () => axiosClient.get('/leave-type/active'),
  findAll: () => axiosClient.get('/leave-type/all'),
  update: (leaveTypeId, updates) => axiosClient.put(`/leave-type/update/${leaveTypeId}`, updates),
  delete: (leaveTypeId) => axiosClient.delete(`/leave-type/${leaveTypeId}`),
};

export default leaveMasterService;
