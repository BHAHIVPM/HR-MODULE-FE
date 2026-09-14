import axiosClient from '../../../api/axiosClient';

const mainGroupService = {
  add: (data) => axiosClient.post('/main-group-operation/add', data),
  getAll: () => axiosClient.get('/main-group-operation/all'),
  getById: (id) => axiosClient.get(`/main-group-operation/${id}`),
  update: (id, data) => axiosClient.put(`/main-group-operation/update/${id}`, data),
  delete: (id) => axiosClient.delete(`/main-group-operation/delete/${id}`),
  reorder: (data) => axiosClient.put('/main-group-operation/order', data),
  // Full menu (English-only; scoped to the logged-in user's privileges)
  getFullMenu: () => axiosClient.get('/main-group-operation/full'),
};

export default mainGroupService;
