import React, { useState, useEffect, useCallback } from 'react';
import leaveMasterService from '../services/leaveMasterService';
import leaveApplicationService from '../services/leaveApplicationService';
import { useNotification } from '../../../context/NotificationContext';
import './LeaveManagementPage.css';

function LeaveManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'types'

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    noOfDays: 1,
    reason: '',
    status: 'PENDING',
  });

  // Leave Type Modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    leaveTypeCode: '',
    leaveTypeName: '',
    defaultDaysPerYear: 12,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    status: 'ACTIVE',
  });

  const fetchLeaveTypes = useCallback(async () => {
    try {
      const res = await leaveMasterService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setLeaveTypes(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = statusFilter === 'PENDING'
        ? await leaveApplicationService.findPending()
        : await leaveApplicationService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [statusFilter, showErrorPopup]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLeaveTypes(), fetchApplications()]);
    setLoading(false);
  }, [fetchLeaveTypes, fetchApplications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply for leave submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...applyForm,
        employeeId: parseInt(applyForm.employeeId, 10),
        leaveTypeId: parseInt(applyForm.leaveTypeId, 10),
        noOfDays: parseFloat(applyForm.noOfDays),
      };
      const res = await leaveApplicationService.apply(payload);
      showSuccess(res?.data?.message || 'Leave application submitted successfully.');
      setShowApplyModal(false);
      fetchApplications();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Create / Edit Leave Type submit
  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...typeForm,
        defaultDaysPerYear: parseInt(typeForm.defaultDaysPerYear, 10),
        maxCarryForwardDays: typeForm.maxCarryForwardDays ? parseInt(typeForm.maxCarryForwardDays, 10) : 0,
      };

      if (selectedType) {
        const res = await leaveMasterService.update(selectedType.leaveTypeId, payload);
        showSuccess(res?.data?.message || 'Leave type updated.');
      } else {
        const res = await leaveMasterService.save(payload);
        showSuccess(res?.data?.message || 'New leave type created.');
      }
      setShowTypeModal(false);
      fetchLeaveTypes();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Manager Approve Action
  const handleApprove = async (id) => {
    const approverIdStr = window.prompt('Enter Approver Employee ID:', '1');
    if (!approverIdStr) return;
    const remarks = window.prompt('Enter approval remarks (optional):', 'Approved');
    try {
      const res = await leaveApplicationService.approve(id, parseInt(approverIdStr, 10), remarks);
      showSuccess(res?.data?.message || 'Leave application approved!');
      fetchApplications();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Manager Reject Action
  const handleReject = async (id) => {
    const approverIdStr = window.prompt('Enter Approver Employee ID:', '1');
    if (!approverIdStr) return;
    const remarks = window.prompt('Enter rejection remarks (optional):', 'Rejected');
    try {
      const res = await leaveApplicationService.reject(id, parseInt(approverIdStr, 10), remarks);
      showSuccess(res?.data?.message || 'Leave application rejected.');
      fetchApplications();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Cancel Leave
  const handleCancel = async (id) => {
    if (!window.confirm(`Cancel leave application #${id}?`)) return;
    try {
      const res = await leaveApplicationService.cancel(id);
      showSuccess(res?.data?.message || 'Leave application cancelled.');
      fetchApplications();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Delete Leave Type
  const handleDeleteType = async (id, name) => {
    if (!window.confirm(`Delete leave type ${name}?`)) return;
    try {
      const res = await leaveMasterService.delete(id);
      showSuccess(res?.data?.message || 'Leave type deleted.');
      fetchLeaveTypes();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredApps = applications.filter((app) =>
    statusFilter === 'ALL' ? true : app.status === statusFilter
  );

  return (
    <div className="leave-page">
      <div className="leave-header">
        <h1>Leave & Time Off Management</h1>
      </div>

      <div className="leave-tabs">
        <button
          className={`leave-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Leave Applications ({applications.length})
        </button>
        <button
          className={`leave-tab-btn ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          Leave Types Master ({leaveTypes.length})
        </button>
      </div>

      <div className="leave-toolbar">
        {activeTab === 'applications' ? (
          <>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="ALL">ALL STATUS</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <button
              className="btn-primary-action"
              onClick={() => {
                setApplyForm({
                  employeeId: '',
                  leaveTypeId: leaveTypes[0]?.leaveTypeId || '',
                  fromDate: new Date().toISOString().split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                  noOfDays: 1,
                  reason: '',
                  status: 'PENDING',
                });
                setShowApplyModal(true);
              }}
            >
              + Apply For Leave
            </button>
          </>
        ) : (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedType(null);
              setTypeForm({
                leaveTypeCode: '',
                leaveTypeName: '',
                defaultDaysPerYear: 12,
                carryForwardAllowed: false,
                maxCarryForwardDays: 0,
                status: 'ACTIVE',
              });
              setShowTypeModal(true);
            }}
          >
            + Create Leave Type
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading leave data...</p>
      ) : activeTab === 'applications' ? (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textCenter: 'center', padding: '24px' }}>
                    No leave applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.leaveApplicationId}>
                    <td>#{app.leaveApplicationId}</td>
                    <td><strong>Emp #{app.employeeId}</strong></td>
                    <td>Type #{app.leaveTypeId}</td>
                    <td>{app.fromDate}</td>
                    <td>{app.toDate}</td>
                    <td>{app.noOfDays}</td>
                    <td>{app.reason || '—'}</td>
                    <td>
                      <span className={`badge badge-${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{app.approvedBy ? `Emp #${app.approvedBy}` : '—'}</td>
                    <td>
                      <div className="action-btns">
                        {app.status === 'PENDING' && (
                          <>
                            <button className="btn-approve" onClick={() => handleApprove(app.leaveApplicationId)}>Approve</button>
                            <button className="btn-reject" onClick={() => handleReject(app.leaveApplicationId)}>Reject</button>
                          </>
                        )}
                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                          <button className="btn-delete" onClick={() => handleCancel(app.leaveApplicationId)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type Name</th>
                <th>Default Days/Yr</th>
                <th>Carry Forward</th>
                <th>Max Carry Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textCenter: 'center', padding: '24px' }}>
                    No leave types configured.
                  </td>
                </tr>
              ) : (
                leaveTypes.map((t) => (
                  <tr key={t.leaveTypeId}>
                    <td><strong>{t.leaveTypeCode}</strong></td>
                    <td>{t.leaveTypeName}</td>
                    <td>{t.defaultDaysPerYear} days</td>
                    <td>{t.carryForwardAllowed ? 'Yes' : 'No'}</td>
                    <td>{t.maxCarryForwardDays || 0}</td>
                    <td>
                      <span className={`badge ${t.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => {
                          setSelectedType(t);
                          setTypeForm({
                            leaveTypeCode: t.leaveTypeCode || '',
                            leaveTypeName: t.leaveTypeName || '',
                            defaultDaysPerYear: t.defaultDaysPerYear || 12,
                            carryForwardAllowed: !!t.carryForwardAllowed,
                            maxCarryForwardDays: t.maxCarryForwardDays || 0,
                            status: t.status || 'ACTIVE',
                          });
                          setShowTypeModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteType(t.leaveTypeId, t.leaveTypeName)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Apply For Leave</h2>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  value={applyForm.employeeId}
                  onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  required
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((t) => (
                    <option key={t.leaveTypeId} value={t.leaveTypeId}>
                      {t.leaveTypeName} ({t.leaveTypeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>From Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.fromDate}
                    onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>To Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.toDate}
                    onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Number of Days *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={applyForm.noOfDays}
                  onChange={(e) => setApplyForm({ ...applyForm, noOfDays: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  rows="3"
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Type Modal */}
      {showTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedType ? 'Edit Leave Type' : 'Create Leave Type'}</h2>
              <button className="close-btn" onClick={() => setShowTypeModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleTypeSubmit}>
              <div className="form-group">
                <label>Leave Code *</label>
                <input
                  type="text"
                  required
                  value={typeForm.leaveTypeCode}
                  onChange={(e) => setTypeForm({ ...typeForm, leaveTypeCode: e.target.value })}
                  placeholder="e.g. CL, SL, EL"
                />
              </div>
              <div className="form-group">
                <label>Leave Name *</label>
                <input
                  type="text"
                  required
                  value={typeForm.leaveTypeName}
                  onChange={(e) => setTypeForm({ ...typeForm, leaveTypeName: e.target.value })}
                  placeholder="e.g. Casual Leave"
                />
              </div>
              <div className="form-group">
                <label>Default Days Per Year *</label>
                <input
                  type="number"
                  required
                  value={typeForm.defaultDaysPerYear}
                  onChange={(e) => setTypeForm({ ...typeForm, defaultDaysPerYear: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="carryForward"
                  checked={typeForm.carryForwardAllowed}
                  onChange={(e) => setTypeForm({ ...typeForm, carryForwardAllowed: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="carryForward" style={{ margin: 0 }}>Allow Carry Forward</label>
              </div>
              {typeForm.carryForwardAllowed && (
                <div className="form-group">
                  <label>Max Carry Forward Days</label>
                  <input
                    type="number"
                    value={typeForm.maxCarryForwardDays}
                    onChange={(e) => setTypeForm({ ...typeForm, maxCarryForwardDays: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={typeForm.status}
                  onChange={(e) => setTypeForm({ ...typeForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Leave Type</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagementPage;
