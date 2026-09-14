import axiosClient from '../../../api/axiosClient';

/**
 * Role Privilege Assignment API Service
 * Endpoints: /api/role-privilege/*
 */
const rolePrivilegeService = {
  getPrivilegesByRole: async (roleId) => {
    const response = await axiosClient.get(`/role-privilege/get-privilege/${roleId}`);
    return response.data;
  },

  savePrivilegeBatch: async (privileges) => {
    const response = await axiosClient.post('/role-privilege/set-privilege-batch', privileges);
    return response.data;
  },

  deleteAllPrivileges: async (roleId) => {
    const response = await axiosClient.delete(`/role-privilege/delete/${roleId}`);
    return response.data;
  },
};

export default rolePrivilegeService;

