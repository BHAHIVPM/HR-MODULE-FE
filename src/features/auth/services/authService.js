import axiosClient from '../../../api/axiosClient';

const authService = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  logout: () => axiosClient.post('/auth/logout'),
  aboutMe: () => axiosClient.get('/auth/about-me'),
  refresh: () => axiosClient.post('/auth/refresh-token'),
};

export default authService;