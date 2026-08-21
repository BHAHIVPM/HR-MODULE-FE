import axiosClient from '../../../api/axiosClient';

/**
 * User API Service matching Spring Boot UserLoginController (/userData)
 */
const userService = {
  /**
   * Save a new UserLogin
   * POST /userData/save
   * Returns ResponseMessage<UserCreationResponse> containing { user, tempPassword }
   */
  save: (userLogin) => {
    return axiosClient.post('/userData/save', userLogin);
  },

  /**
   * Fetch all UserLogin records
   * GET /userData/all
   */
  findAll: () => {
    return axiosClient.get('/userData/all');
  },

  /**
   * Update an existing UserLogin
   * PUT /userData/update/{loginId}
   */
  update: (loginId, updates) => {
    return axiosClient.put(`/userData/update/${encodeURIComponent(loginId)}`, updates);
  },

  /**
   * Delete UserLogin by loginId (userId)
   * DELETE /userData/{loginId}
   */
  delete: (loginId) => {
    return axiosClient.delete(`/userData/${encodeURIComponent(loginId)}`);
  },
};

export default userService;
