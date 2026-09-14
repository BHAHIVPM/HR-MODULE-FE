import axiosClient from '../../../api/axiosClient';

const menuService = {
  add: (data) => axiosClient.post('/menu-operation/add', data),
  getAll: () => axiosClient.get('/menu-operation/all'),
  getById: (id) => axiosClient.get(`/menu-operation/${id}`),
  update: (id, data) => axiosClient.put(`/menu-operation/update/${id}`, data),
  delete: (id) => axiosClient.delete(`/menu-operation/delete/${id}`),
  reorder: (mainGroupId, data) => axiosClient.put(`/menu-operation/reorder-hierarchy/${mainGroupId}`, data),
};

export default menuService;
