import axiosClient from '../../../api/axiosClient';

const performanceReviewService = {
  save: (review) => axiosClient.post('/performance-review/save', review),
  findById: (reviewId) => axiosClient.get(`/performance-review/${reviewId}`),
  findByEmployee: (employeeId) => axiosClient.get(`/performance-review/by-employee/${employeeId}`),
  findByReviewer: (reviewerId) => axiosClient.get(`/performance-review/by-reviewer/${reviewerId}`),
  findAll: () => axiosClient.get('/performance-review/all'),
  submit: (reviewId) => axiosClient.put(`/performance-review/${reviewId}/submit`),
  completeReview: (reviewId, overallRating, reviewerComments) =>
    axiosClient.put(`/performance-review/${reviewId}/complete`, null, {
      params: { overallRating, ...(reviewerComments ? { reviewerComments } : {}) },
    }),
  acknowledge: (reviewId) => axiosClient.put(`/performance-review/${reviewId}/acknowledge`),
  update: (reviewId, updates) => axiosClient.put(`/performance-review/update/${reviewId}`, updates),
  delete: (reviewId) => axiosClient.delete(`/performance-review/${reviewId}`),
};

export default performanceReviewService;
