import axiosClient from '../../../api/axiosClient';

const salaryService = {
  save: (salary) => axiosClient.post('/salary/save', salary),
  findById: (salaryId) => axiosClient.get(`/salary/${salaryId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/salary/by-employee/${employeeId}`),
  findAll: () => axiosClient.get('/salary/all'),
  update: (salaryId, updates) => axiosClient.put(`/salary/update/${salaryId}`, updates),
  delete: (salaryId) => axiosClient.delete(`/salary/${salaryId}`),
};

export default salaryService;
