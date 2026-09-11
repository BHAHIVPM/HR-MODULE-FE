import React, { useState, useEffect, useCallback } from 'react';
import performanceReviewService from '../services/performanceReviewService';
import { useNotification } from '../../../context/NotificationContext';
import './PerformanceReviewPage.css';

function PerformanceReviewPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewerId: '',
    reviewCycle: '2026-H1',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    achievements: '',
    strengths: '',
    areasOfImprovement: '',
    goalsForNextCycle: '',
    status: 'DRAFT',
  });

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await performanceReviewService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [showErrorPopup]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employeeId: parseInt(formData.employeeId, 10),
        reviewerId: formData.reviewerId ? parseInt(formData.reviewerId, 10) : null,
      };

      if (selectedReview) {
        const res = await performanceReviewService.update(selectedReview.reviewId, payload);
        showSuccess(res?.data?.message || 'Appraisal record updated.');
      } else {
        const res = await performanceReviewService.save(payload);
        showSuccess(res?.data?.message || 'Appraisal cycle initiated.');
      }
      setShowModal(false);
      loadReviews();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleSubmitReview = async (reviewId) => {
    try {
      const res = await performanceReviewService.submit(reviewId);
      showSuccess(res?.data?.message || 'Appraisal submitted for manager review.');
      loadReviews();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleCompleteReview = async (reviewId) => {
    const ratingStr = window.prompt('Enter overall rating (1.0 - 5.0):', '4.5');
    if (!ratingStr) return;
    const rating = parseFloat(ratingStr);
    const comments = window.prompt('Enter reviewer comments (optional):', 'Exceeds expectations.');

    try {
      const res = await performanceReviewService.completeReview(reviewId, rating, comments);
      showSuccess(res?.data?.message || 'Appraisal review completed!');
      loadReviews();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleAcknowledge = async (reviewId) => {
    try {
      const res = await performanceReviewService.acknowledge(reviewId);
      showSuccess(res?.data?.message || 'Appraisal acknowledged by employee.');
      loadReviews();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete performance review record #${id}?`)) return;
    try {
      const res = await performanceReviewService.delete(id);
      showSuccess(res?.data?.message || 'Appraisal record deleted.');
      loadReviews();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.reviewCycle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeId?.toString().includes(searchTerm)
  );

  return (
    <div className="review-page">
      <div className="review-header">
        <h1>Performance Reviews & Appraisals</h1>
        <button
          className="btn-primary-action"
          onClick={() => {
            setSelectedReview(null);
            setFormData({
              employeeId: '',
              reviewerId: '',
              reviewCycle: '2026-H1',
              reviewPeriodStart: `${new Date().getFullYear()}-01-01`,
              reviewPeriodEnd: `${new Date().getFullYear()}-06-30`,
              achievements: '',
              strengths: '',
              areasOfImprovement: '',
              goalsForNextCycle: '',
              status: 'DRAFT',
            });
            setShowModal(true);
          }}
        >
          + Initiate Performance Review
        </button>
      </div>

      <div className="review-toolbar">
        <input
          type="text"
          className="org-search-input"
          placeholder="Search review cycle or employee ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading performance reviews...</p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Reviewer ID</th>
                <th>Cycle</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textCenter: 'center', padding: '24px' }}>
                    No appraisal records found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.reviewId}>
                    <td>#{r.reviewId}</td>
                    <td><strong>Emp #{r.employeeId}</strong></td>
                    <td>{r.reviewerId ? `Emp #${r.reviewerId}` : '—'}</td>
                    <td><strong>{r.reviewCycle}</strong></td>
                    <td>{r.reviewPeriodStart} to {r.reviewPeriodEnd}</td>
                    <td>
                      {r.overallRating ? (
                        <span className="rating-pill">
                          ★ {r.overallRating.toFixed(1)} / 5.0
                        </span>
                      ) : (
                        'Pending'
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {r.status === 'DRAFT' && (
                          <button className="btn-approve" onClick={() => handleSubmitReview(r.reviewId)}>Submit</button>
                        )}
                        {r.status === 'SUBMITTED' && (
                          <button className="btn-issue" onClick={() => handleCompleteReview(r.reviewId)}>Review</button>
                        )}
                        {r.status === 'REVIEWED' && (
                          <button className="btn-mark-paid" onClick={() => handleAcknowledge(r.reviewId)}>Acknowledge</button>
                        )}
                        <button className="btn-edit" onClick={() => {
                          setSelectedReview(r);
                          setFormData({
                            employeeId: r.employeeId || '',
                            reviewerId: r.reviewerId || '',
                            reviewCycle: r.reviewCycle || '',
                            reviewPeriodStart: r.reviewPeriodStart || '',
                            reviewPeriodEnd: r.reviewPeriodEnd || '',
                            achievements: r.achievements || '',
                            strengths: r.strengths || '',
                            areasOfImprovement: r.areasOfImprovement || '',
                            goalsForNextCycle: r.goalsForNextCycle || '',
                            status: r.status || 'DRAFT',
                          });
                          setShowModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(r.reviewId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{selectedReview ? 'Edit Appraisal Record' : 'Initiate Performance Review'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Reviewer Manager ID</label>
                  <input
                    type="number"
                    value={formData.reviewerId}
                    onChange={(e) => setFormData({ ...formData, reviewerId: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Review Cycle *</label>
                <input
                  type="text"
                  required
                  value={formData.reviewCycle}
                  onChange={(e) => setFormData({ ...formData, reviewCycle: e.target.value })}
                  placeholder="e.g. 2026-H1 or Annual-2026"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Period Start *</label>
                  <input
                    type="date"
                    required
                    value={formData.reviewPeriodStart}
                    onChange={(e) => setFormData({ ...formData, reviewPeriodStart: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Period End *</label>
                  <input
                    type="date"
                    required
                    value={formData.reviewPeriodEnd}
                    onChange={(e) => setFormData({ ...formData, reviewPeriodEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Key Achievements</label>
                <textarea
                  rows="2"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Strengths</label>
                <textarea
                  rows="2"
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Areas Of Improvement</label>
                <textarea
                  rows="2"
                  value={formData.areasOfImprovement}
                  onChange={(e) => setFormData({ ...formData, areasOfImprovement: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Goals For Next Cycle</label>
                <textarea
                  rows="2"
                  value={formData.goalsForNextCycle}
                  onChange={(e) => setFormData({ ...formData, goalsForNextCycle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="REVIEWED">REVIEWED</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Appraisal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceReviewPage;
