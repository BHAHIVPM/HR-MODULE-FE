import axiosClient from '../../../api/axiosClient';

const departmentService = {
  save: (department) => axiosClient.post('/department/save', department),
  findById: (departmentId) => axiosClient.get(`/department/${departmentId}`),
  findAllActive: () => axiosClient.get('/department/active'),
  findAll: () => axiosClient.get('/department/all'),
  update: (departmentId, updates) => axiosClient.put(`/department/update/${departmentId}`, updates),
  delete: (departmentId) => axiosClient.delete(`/department/${departmentId}`),
};

export default departmentService;
