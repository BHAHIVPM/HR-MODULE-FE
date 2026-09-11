import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8060/',
  baseURL: 'http://localhost:8060/',
  withCredentials: true, // REQUIRED so the httpOnly cookie is sent/received
});

export const LOGIN_ID_KEY = 'hr-login-id';
export const DEV_AUTH_KEY = 'hr-dev-auth';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// On ANY 401, first try to refresh the access token (the refresh token lives in an
// httpOnly cookie so it's sent automatically). If refresh succeeds, replay the failed
// request with the new access token. If refresh fails, the session is truly expired → logout.
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (sessionStorage.getItem(DEV_AUTH_KEY) === 'true') {
      return Promise.reject(err);
    }

    if (originalRequest._isRefreshRequest) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const loginId = sessionStorage.getItem(LOGIN_ID_KEY);
      if (!loginId) {
        redirectToLogin();
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await axios.post(
          `http://localhost:8080/auth/refresh-token/${encodeURIComponent(loginId)}`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        sessionStorage.removeItem(LOGIN_ID_KEY);
        redirectToLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
