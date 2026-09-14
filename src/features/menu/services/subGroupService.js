import axiosClient from '../../../api/axiosClient';

const subGroupService = {
  add: (data) => axiosClient.post('/sub-menu-operation/add', data),
  getAll: () => axiosClient.get('/sub-menu-operation/getAllSubMenu'),
  getById: (id) => axiosClient.get(`/sub-menu-operation/${id}`),
};

export default subGroupService;
