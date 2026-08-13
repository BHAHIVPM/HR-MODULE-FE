import axiosClient from '../../../api/axiosClient';

/**
 * Dummy registration API — posts model data to port 8080.
 * Replace endpoint paths with real backend routes when ready.
 */
const registrationService = {
  registerUser: (data) =>
    axiosClient.post('/api/register/user', {
      userId: data.userId,
      userName: data.userName,
      userMail: data.userMail,
      mobileNo: data.mobileNo,
      password: data.password,
      userType: data.userType,
      status: data.status,
    }),

  registerEmployee: (data) =>
    axiosClient.post('/api/register/employee', {
      loginId: data.loginId || null,
      employeeCode: data.employeeCode,
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email,
      mobileNo: data.mobileNo,
      dateOfBirth: data.dateOfBirth || null,
      dateOfJoining: data.dateOfJoining,
      department: data.department || null,
      designation: data.designation || null,
      reportingManagerId: data.reportingManagerId ? Number(data.reportingManagerId) : null,
      status: data.status,
    }),

  registerClient: (data) =>
    axiosClient.post('/api/register/client', {
      clientId: data.clientId,
      clientName: data.clientName,
      url: data.url || null,
      username: data.username || null,
      password: data.password || null,
      status: data.status || null,
    }),
};

export default registrationService;
