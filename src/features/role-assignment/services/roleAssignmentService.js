import axiosClient from '../../../api/axiosClient';

/**
 * User Role Assignment API Service
 * Endpoints: /api/role-assignment/*
 */
const roleAssignmentService = {
  getAllUsers: async () => {
    const response = await axiosClient.get('/role-assignment/get-all');
    return response.data;
  },

  getRolesByLoginId: async (loginId) => {
    const response = await axiosClient.get(
      `/role-assignment/getById/${encodeURIComponent(loginId)}`
    );
    return response.data;
  },

  saveRoleAssignments: async (data) => {
    const response = await axiosClient.post('/role-assignment/save', data);
    return response.data;
  },

  getOnlyAssignedRoles: async (loginId) => {
    const response = await axiosClient.get(
      `/role-assignment/only-assigned/${encodeURIComponent(loginId)}`
    );
    return response.data;
  },
};

export default roleAssignmentService;

