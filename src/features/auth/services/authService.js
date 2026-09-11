<<<<<<< HEAD
import axiosClient from '../../../api/axiosClient';

const authService = {
  // loginId is in the URL path (DbRoutingPreAuthFilter requirement), password in body
  login: (loginId, password) => 
    axiosClient.post(`/auth/login/${encodeURIComponent(loginId)}`, { password }),

  guestToken: (loginId) => 
    axiosClient.post(`/auth/guest-token/${encodeURIComponent(loginId)}`),

  // Access token refresh – called on user activity to extend the session.
  // Backend reads the httpOnly cookie and issues a new access token for the tenant DB routed by loginId.
  refresh: (loginId) => 
    axiosClient.post(`/auth/refresh-token/${encodeURIComponent(loginId)}`, {}, { _isRefreshRequest: true }),

  verifyTempPassword: (loginId, tempPassword) => 
    axiosClient.post(`/auth/verify-temp-password/${encodeURIComponent(loginId)}`, { tempPassword }),

  changePassword: (loginId, tempPassword, newPassword) => 
    axiosClient.post(`/auth/change-password/${encodeURIComponent(loginId)}`, { tempPassword, newPassword }),

  logout: () => axiosClient.post('/auth/logout'),
  aboutMe: () => axiosClient.get('/auth/about-me'),
};

export default authService;
=======
import axiosClient from '../../../api/axiosClient';

const authService = {
  // loginId is in the URL path (DbRoutingPreAuthFilter requirement), password in body
  login: (loginId, password) => 
    axiosClient.post(`/auth/login/${encodeURIComponent(loginId)}`, { password }),

  guestToken: (loginId) => 
    axiosClient.post(`/auth/guest-token/${encodeURIComponent(loginId)}`),

  verifyTempPassword: (loginId, tempPassword) => 
    axiosClient.post(`/auth/verify-temp-password/${encodeURIComponent(loginId)}`, { tempPassword }),

  changePassword: (loginId, tempPassword, newPassword) => 
    axiosClient.post(`/auth/change-password/${encodeURIComponent(loginId)}`, { tempPassword, newPassword }),

  logout: () => axiosClient.post('/auth/logout'),
  aboutMe: () => axiosClient.get('/auth/about-me'),
  refresh: () => {
    if (sessionStorage.getItem('hr-dev-auth') === 'true') {
      return Promise.resolve({ data: { message: 'Dev session active' } });
    }
    return axiosClient.post('/auth/refresh').catch((err) => {
      if (err.response?.status === 404) {
        return axiosClient.get('/auth/about-me');
      }
      return Promise.reject(err);
    });
  },
};

export default authService;
>>>>>>> a5528d2 (server connection lost error message)
