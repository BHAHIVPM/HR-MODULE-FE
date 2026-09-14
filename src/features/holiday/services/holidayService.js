import axiosClient from '../../../api/axiosClient';

const holidayService = {
  save: (holiday) => axiosClient.post('/holiday/save', holiday),
  findById: (holidayId) => axiosClient.get(`/holiday/${holidayId}`),
  findAllActive: () => axiosClient.get('/holiday/active'),
  findByYear: (year) => axiosClient.get(`/holiday/year/${year}`),
  findAll: () => axiosClient.get('/holiday/all'),
  update: (holidayId, updates) => axiosClient.put(`/holiday/update/${holidayId}`, updates),
  delete: (holidayId) => axiosClient.delete(`/holiday/${holidayId}`),
};

export default holidayService;
