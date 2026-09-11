import axiosClient from '../../../api/axiosClient';

const bankDetailsService = {
  save: (bankDetails) => axiosClient.post('/bank-details/save', bankDetails),
  findById: (bankDetailId) => axiosClient.get(`/bank-details/${bankDetailId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/bank-details/by-employee/${employeeId}`),
  findAll: () => axiosClient.get('/bank-details/all'),
  update: (bankDetailId, updates) => axiosClient.put(`/bank-details/update/${bankDetailId}`, updates),
  delete: (bankDetailId) => axiosClient.delete(`/bank-details/${bankDetailId}`),
};

export default bankDetailsService;
