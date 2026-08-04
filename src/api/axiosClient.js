import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/',
  withCredentials: true, // REQUIRED so the httpOnly cookie is sent/received
});

// If ANY call gets 401, force logout globally
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosClient;