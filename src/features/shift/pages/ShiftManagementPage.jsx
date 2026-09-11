import React, { useState, useEffect, useCallback } from 'react';
import shiftService from '../services/shiftService';
import employeeShiftService from '../services/employeeShiftService';
import { useNotification } from '../../../context/NotificationContext';
import './ShiftManagementPage.css';

function ShiftManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [activeTab, setActiveTab] = useState('shifts'); // 'shifts' | 'assignments'

  const [shifts, setShifts] = useState([]);
  const [employeeShifts, setEmployeeShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Shift Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    shiftCode: '',
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    weeklyOffDays: 'SATURDAY,SUNDAY',
    status: 'ACTIVE',
  });

  // Assign Shift Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    shiftId: '',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'ACTIVE',
  });

  const fetchShifts = useCallback(async () => {
    try {
      const res = await shiftService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setShifts(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchEmployeeShifts = useCallback(async () => {
    try {
      const res = await employeeShiftService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setEmployeeShifts(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchShifts(), fetchEmployeeShifts()]);
    setLoading(false);
  }, [fetchShifts, fetchEmployeeShifts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...shiftForm,
        breakDurationMinutes: shiftForm.breakDurationMinutes ? parseInt(shiftForm.breakDurationMinutes, 10) : null,
      };

      if (selectedShift) {
        const res = await shiftService.update(selectedShift.shiftId, payload);
        showSuccess(res?.data?.message || 'Shift timing updated.');
      } else {
        const res = await shiftService.save(payload);
        showSuccess(res?.data?.message || 'New shift created.');
      }
      setShowShiftModal(false);
      fetchShifts();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...assignForm,
        employeeId: parseInt(assignForm.employeeId, 10),
        shiftId: parseInt(assignForm.shiftId, 10),
        effectiveTo: assignForm.effectiveTo || null,
      };

      const res = await employeeShiftService.assign(payload);
      showSuccess(res?.data?.message || 'Shift assigned to employee successfully.');
      setShowAssignModal(false);
      fetchEmployeeShifts();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEditShift = (s) => {
    setSelectedShift(s);
    setShiftForm({
      shiftCode: s.shiftCode || '',
      shiftName: s.shiftName || '',
      startTime: s.startTime || '09:00',
      endTime: s.endTime || '18:00',
      breakDurationMinutes: s.breakDurationMinutes || 60,
      weeklyOffDays: s.weeklyOffDays || 'SATURDAY,SUNDAY',
      status: s.status || 'ACTIVE',
    });
    setShowShiftModal(true);
  };

  const handleDeleteShift = async (id, name) => {
    if (!window.confirm(`Delete shift ${name}?`)) return;
    try {
      const res = await shiftService.delete(id);
      showSuccess(res?.data?.message || 'Shift deleted.');
      fetchShifts();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDeleteAssign = async (id) => {
    if (!window.confirm(`Remove shift assignment #${id}?`)) return;
    try {
      const res = await employeeShiftService.delete(id);
      showSuccess(res?.data?.message || 'Shift assignment removed.');
      fetchEmployeeShifts();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredShifts = shifts.filter(
    (s) =>
      s.shiftName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shiftCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = employeeShifts.filter(
    (es) =>
      es.employeeId?.toString().includes(searchTerm) ||
      es.shiftId?.toString().includes(searchTerm)
  );

  return (
    <div className="shift-page">
      <div className="shift-header">
        <h1>Shift & Rostering Management</h1>
      </div>

      <div className="shift-tabs">
        <button
          className={`shift-tab-btn ${activeTab === 'shifts' ? 'active' : ''}`}
          onClick={() => setActiveTab('shifts')}
        >
          Shift Master Definitions ({shifts.length})
        </button>
        <button
          className={`shift-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Employee Shift Roster ({employeeShifts.length})
        </button>
      </div>

      <div className="shift-toolbar">
        <input
          type="text"
          className="shift-search-input"
          placeholder={activeTab === 'shifts' ? 'Search shift name/code...' : 'Filter by Employee ID...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === 'shifts' ? (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedShift(null);
              setShiftForm({
                shiftCode: '',
                shiftName: '',
                startTime: '09:00',
                endTime: '18:00',
                breakDurationMinutes: 60,
                weeklyOffDays: 'SATURDAY,SUNDAY',
                status: 'ACTIVE',
              });
              setShowShiftModal(true);
            }}
          >
            + Create New Shift
          </button>
        ) : (
          <button
            className="btn-primary-action"
            onClick={() => {
              setAssignForm({
                employeeId: '',
                shiftId: shifts[0]?.shiftId || '',
                effectiveFrom: new Date().toISOString().split('T')[0],
                effectiveTo: '',
                status: 'ACTIVE',
              });
              setShowAssignModal(true);
            }}
          >
            + Assign Shift to Employee
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading shifts data...</p>
      ) : activeTab === 'shifts' ? (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Shift Name</th>
                <th>Timing</th>
                <th>Break (Mins)</th>
                <th>Weekly Offs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textCenter: 'center', padding: '24px' }}>
                    No shifts defined yet.
                  </td>
                </tr>
              ) : (
                filteredShifts.map((s) => (
                  <tr key={s.shiftId}>
                    <td><strong>{s.shiftCode}</strong></td>
                    <td>{s.shiftName}</td>
                    <td>{s.startTime} - {s.endTime}</td>
                    <td>{s.breakDurationMinutes || 0}</td>
                    <td>{s.weeklyOffDays || 'None'}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEditShift(s)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteShift(s.shiftId, s.shiftName)}>Delete</button>
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
                <th>ID</th>
                <th>Employee ID</th>
                <th>Shift ID</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textCenter: 'center', padding: '24px' }}>
                    No employee shift assignments found.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((es) => (
                  <tr key={es.employeeShiftId}>
                    <td>#{es.employeeShiftId}</td>
                    <td><strong>Emp #{es.employeeId}</strong></td>
                    <td>Shift #{es.shiftId}</td>
                    <td>{es.effectiveFrom}</td>
                    <td>{es.effectiveTo || 'Present (Ongoing)'}</td>
                    <td>
                      <span className={`badge ${es.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {es.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-delete" onClick={() => handleDeleteAssign(es.employeeShiftId)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedShift ? 'Edit Shift Timing' : 'Create Shift Master'}</h2>
              <button className="close-btn" onClick={() => setShowShiftModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleShiftSubmit}>
              <div className="form-group">
                <label>Shift Code *</label>
                <input
                  type="text"
                  required
                  value={shiftForm.shiftCode}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftCode: e.target.value })}
                  placeholder="e.g. SHIFT_DAY_GEN"
                />
              </div>
              <div className="form-group">
                <label>Shift Name *</label>
                <input
                  type="text"
                  required
                  value={shiftForm.shiftName}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftName: e.target.value })}
                  placeholder="e.g. General Day Shift (9 AM - 6 PM)"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Break Duration (Minutes)</label>
                <input
                  type="number"
                  value={shiftForm.breakDurationMinutes}
                  onChange={(e) => setShiftForm({ ...shiftForm, breakDurationMinutes: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Weekly Off Days (comma-separated)</label>
                <input
                  type="text"
                  value={shiftForm.weeklyOffDays}
                  onChange={(e) => setShiftForm({ ...shiftForm, weeklyOffDays: e.target.value })}
                  placeholder="e.g. SATURDAY,SUNDAY"
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={shiftForm.status}
                  onChange={(e) => setShiftForm({ ...shiftForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowShiftModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Shift to Employee</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  placeholder="Enter Employee ID"
                />
              </div>
              <div className="form-group">
                <label>Shift *</label>
                <select
                  required
                  value={assignForm.shiftId}
                  onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                >
                  <option value="">Select Shift</option>
                  {shifts.map((s) => (
                    <option key={s.shiftId} value={s.shiftId}>
                      {s.shiftName} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Effective From *</label>
                  <input
                    type="date"
                    required
                    value={assignForm.effectiveFrom}
                    onChange={(e) => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Effective To (Optional)</label>
                  <input
                    type="date"
                    value={assignForm.effectiveTo}
                    onChange={(e) => setAssignForm({ ...assignForm, effectiveTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={assignForm.status}
                  onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Assign Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShiftManagementPage;
