import axiosClient from '../../../api/axiosClient';

const documentService = {
  save: (document) => axiosClient.post('/document/save', document),
  findById: (documentId) => axiosClient.get(`/document/${documentId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/document/by-employee/${employeeId}`),
  findAll: () => axiosClient.get('/document/all'),
  verify: (documentId) => axiosClient.put(`/document/${documentId}/verify`),
  update: (documentId, updates) => axiosClient.put(`/document/update/${documentId}`, updates),
  delete: (documentId) => axiosClient.delete(`/document/${documentId}`),
};

export default documentService;
