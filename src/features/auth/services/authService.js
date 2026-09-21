import axiosClient from '../../../api/axiosClient';

/**
 * Service for handling user authentication, session management, and password operations.
 */
const authService = {
  /**
   * Authenticate user credentials.
   * @param {string} loginId - User 12-digit login ID (passed in path for DbRoutingPreAuthFilter)
   * @param {string} password - User password
   * @returns {Promise} Axios response promise
   */
  login: (loginId, password) =>
    axiosClient.post(`/auth/login/${encodeURIComponent(loginId)}`, { password }),

  /**
   * Obtain a guest token for the specified login ID.
   * @param {string} loginId
   * @returns {Promise}
   */
  guestToken: (loginId) =>
    axiosClient.post(`/auth/guest-token/${encodeURIComponent(loginId)}`),

  /**
   * Refresh session access token. Backend reads httpOnly cookie and issues a new access token.
   * @param {string} loginId
   * @returns {Promise}
   */
  refresh: (loginId) =>
    axiosClient.post(
      `/auth/refresh-token/${encodeURIComponent(loginId)}`,
      {},
      { _isRefreshRequest: true }
    ),

  /**
   * Verify temporary password assigned during account setup.
   * @param {string} loginId
   * @param {string} tempPassword
   * @returns {Promise}
   */
  verifyTempPassword: (loginId, tempPassword) =>
    axiosClient.post(`/auth/verify-temp-password/${encodeURIComponent(loginId)}`, {
      tempPassword,
    }),

  /**
   * Update password from temporary to user-defined new password.
   * @param {string} loginId
   * @param {string} tempPassword
   * @param {string} newPassword
   * @returns {Promise}
   */
  changePassword: (loginId, tempPassword, newPassword) =>
    axiosClient.post(`/auth/change-password/${encodeURIComponent(loginId)}`, {
      tempPassword,
      newPassword,
    }),

  /**
   * Invalidate the current session and logout user.
   * @returns {Promise}
   */
  logout: () => axiosClient.post('/auth/logout'),

  /**
   * Validate the CURRENT token (Access_token cookie or Bearer header).
   * GET /auth/auth-me - 200 + true when valid, 401 + false when missing/expired/tampered.
   * @returns {Promise}
   */
  authMe: () => axiosClient.get('/auth/auth-me'),

  /**
   * Fetch current authenticated user's metadata.
   * @returns {Promise}
   */
  aboutMe: () => axiosClient.get('/auth/about-me'),
};

export default authService;

