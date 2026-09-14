import axiosClient from '../../../api/axiosClient';

/**
 * User Level Privilege Assignment API Service
 * Endpoints: /api/user-level-privilege/*
 */
const userLevelPrivilegeService = {
  fetchUserPrivileges: async (loginId) => {
    const response = await axiosClient.get(
      `/user-level-privilege/fetchById/${encodeURIComponent(loginId)}`
    );
    return response.data;
  },

  fetchMultipleRolePrivileges: async (roleIds, loginId) => {
    const response = await axiosClient.get(
      '/user-level-privilege/fetchMultiple',
      { params: { roleIds: roleIds.join(','), loginId } }
    );
    return response.data;
  },

  saveUserPrivileges: async (privileges) => {
    const response = await axiosClient.put('/user-level-privilege/edit', privileges);
    return response.data;
  },

  getAllUserPrivileges: async () => {
    const response = await axiosClient.get('/user-level-privilege/get-all');
    return response.data;
  },

  getPrivilegesByLoginId: async (loginId) => {
    const response = await axiosClient.get(
      `/user-level-privilege/getById/${encodeURIComponent(loginId)}`
    );
    return response.data;
  },
};

export default userLevelPrivilegeService;

