import userService from '../../user/services/userService';
import employeeService from '../../employee/services/employeeService';
import axiosClient from '../../../api/axiosClient';

/**
 * Registration Service connecting to backend controllers
 */
const registrationService = {
  registerUser: (data) =>
    userService.save({
      userId: data.userId,
      name: data.name || data.userName,
      userMail: data.userMail,
      mobileNo: data.mobileNo,
      userType: data.userType || 'USER',
      status: data.status || 'ACTIVE',
    }),

  registerEmployee: (data) =>
    employeeService.save({
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
      status: data.status || 'ACTIVE',
    }),

  registerClient: (data) =>
    axiosClient.post('/client/save', {
      clientId: data.clientId,
      clientName: data.clientName,
      url: data.url || null,
      username: data.username || null,
      password: data.password || null,
      status: data.status || 'ACTIVE',
    }),
};

export default registrationService;

