import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8060/',
  withCredentials: true, // REQUIRED so the httpOnly cookie is sent/received
});

// If ANY call gets 401, force logout globally (skip during dev-auth testing or when already on login/auth endpoints)
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAlreadyOnLogin = window.location.pathname === '/login';
    const requestUrl = err.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/');

    // Check if the backend server is down (no response received from server)
    if (!err.response) {
      window.dispatchEvent(
        new CustomEvent('server-down-error', {
          detail: {
            message: err.message || 'Unable to connect to the backend server.',
            url: err.config?.url ? `${err.config.baseURL || ''}${err.config.url}` : 'Backend API',
            timestamp: new Date().toLocaleTimeString(),
          },
        })
      );
    }

    if (
      err.response?.status === 401 &&
      !isAlreadyOnLogin &&
      !isAuthEndpoint &&
      sessionStorage.getItem('hr-dev-auth') !== 'true'
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosClient;