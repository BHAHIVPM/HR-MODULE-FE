import axiosClient from '../../../api/axiosClient';

/**
 * Role Management API Service
 * Endpoints: /api/user-role/*
 */
const roleService = {
  getAllRoles: async () => {
    const response = await axiosClient.get('/user-role/get-all-role');
    return response.data;
  },

  getRoleById: async (roleId) => {
    const response = await axiosClient.get(`/user-role/getRoleById/${roleId}`);
    return response.data;
  },

  createRole: async (role) => {
    const response = await axiosClient.post('/user-role/create-role', role);
    return response.data;
  },

  updateRole: async (roleId, role) => {
    const response = await axiosClient.put(`/user-role/update/${roleId}`, role);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await axiosClient.delete(`/user-role/delete/${roleId}`);
    return response.data;
  },
};

export default roleService;

