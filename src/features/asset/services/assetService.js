import axiosClient from '../../../api/axiosClient';

const assetService = {
  save: (asset) => axiosClient.post('/asset/save', asset),
  findById: (assetId) => axiosClient.get(`/asset/${assetId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/asset/by-employee/${employeeId}`),
  findAvailable: () => axiosClient.get('/asset/available'),
  findAll: () => axiosClient.get('/asset/all'),
  issueTo: (assetId, employeeId) => axiosClient.put(`/asset/${assetId}/issue/${employeeId}`),
  returnAsset: (assetId, condition, remarks) =>
    axiosClient.put(`/asset/${assetId}/return`, null, {
      params: { condition, ...(remarks ? { remarks } : {}) },
    }),
  update: (assetId, updates) => axiosClient.put(`/asset/update/${assetId}`, updates),
  delete: (assetId) => axiosClient.delete(`/asset/${assetId}`),
};

export default assetService;
