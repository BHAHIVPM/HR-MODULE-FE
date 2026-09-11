import axiosClient from '../../../api/axiosClient';

const shiftService = {
  save: (shift) => axiosClient.post('/shift/save', shift),
  findById: (shiftId) => axiosClient.get(`/shift/${shiftId}`),
  findAllActive: () => axiosClient.get('/shift/active'),
  findAll: () => axiosClient.get('/shift/all'),
  update: (shiftId, updates) => axiosClient.put(`/shift/update/${shiftId}`, updates),
  delete: (shiftId) => axiosClient.delete(`/shift/${shiftId}`),
};

export default shiftService;
