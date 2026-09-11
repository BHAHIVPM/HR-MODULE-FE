import axiosClient from '../../../api/axiosClient';

const designationService = {
  save: (designation) => axiosClient.post('/designation/save', designation),
  findById: (designationId) => axiosClient.get(`/designation/${designationId}`),
  findByDepartment: (departmentId) => axiosClient.get(`/designation/by-department/${departmentId}`),
  findAllActive: () => axiosClient.get('/designation/active'),
  findAll: () => axiosClient.get('/designation/all'),
  update: (designationId, updates) => axiosClient.put(`/designation/update/${designationId}`, updates),
  delete: (designationId) => axiosClient.delete(`/designation/${designationId}`),
};

export default designationService;
