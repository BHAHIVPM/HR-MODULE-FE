import React, { useState, useEffect, useCallback } from 'react';
import attendanceService from '../services/attendanceService';
import { useNotification } from '../../../context/NotificationContext';
import './AttendancePage.css';

function AttendancePage() {
  const { showSuccess, showErrorPopup } = useNotification();
  
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quick Check-in/out form
  const [quickEmpId, setQuickEmpId] = useState('');

  // Filters
  const [filterEmpId, setFilterEmpId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Manual Modal Form
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOutTime: '',
    workedHours: '',
    status: 'PRESENT',
    remarks: '',
  });

  const loadAllAttendance = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (filterEmpId && fromDate && toDate) {
        res = await attendanceService.findByEmployeeAndRange(filterEmpId, fromDate, toDate);
      } else if (filterEmpId) {
        res = await attendanceService.findByEmployee(filterEmpId);
      } else {
        res = await attendanceService.findAll();
      }
      const list = res?.data?.responseOutput || res?.data || [];
      setAttendances(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [filterEmpId, fromDate, toDate, showErrorPopup]);

  useEffect(() => {
    loadAllAttendance();
  }, [loadAllAttendance]);

  const handleQuickCheckIn = async (e) => {
    e.preventDefault();
    if (!quickEmpId) return;
    try {
      const res = await attendanceService.checkIn(quickEmpId);
      showSuccess(res?.data?.message || `Checked IN Employee #${quickEmpId}`);
      setQuickEmpId('');
      loadAllAttendance();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleQuickCheckOut = async (e) => {
    e.preventDefault();
    if (!quickEmpId) return;
    try {
      const res = await attendanceService.checkOut(quickEmpId);
      showSuccess(res?.data?.message || `Checked OUT Employee #${quickEmpId}`);
      setQuickEmpId('');
      loadAllAttendance();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employeeId: parseInt(formData.employeeId, 10),
        workedHours: formData.workedHours ? parseFloat(formData.workedHours) : null,
      };

      if (selectedRecord) {
        const res = await attendanceService.update(selectedRecord.attendanceId, payload);
        showSuccess(res?.data?.message || 'Attendance record updated.');
      } else {
        const res = await attendanceService.save(payload);
        showSuccess(res?.data?.message || 'Attendance record logged.');
      }
      setShowModal(false);
      loadAllAttendance();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId || '',
      attendanceDate: record.attendanceDate || '',
      checkInTime: record.checkInTime || '',
      checkOutTime: record.checkOutTime || '',
      workedHours: record.workedHours || '',
      status: record.status || 'PRESENT',
      remarks: record.remarks || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete attendance record #${id}?`)) return;
    try {
      const res = await attendanceService.delete(id);
      showSuccess(res?.data?.message || 'Attendance record deleted.');
      loadAllAttendance();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1>Attendance Management</h1>
        <button
          className="btn-primary-action"
          onClick={() => {
            setSelectedRecord(null);
            setFormData({
              employeeId: '',
              attendanceDate: new Date().toISOString().split('T')[0],
              checkInTime: '09:00',
              checkOutTime: '18:00',
              workedHours: '9.0',
              status: 'PRESENT',
              remarks: '',
            });
            setShowModal(true);
          }}
        >
          + Log Attendance Record
        </button>
      </div>

      {/* Quick Check In / Out Card */}
      <div className="quick-checkin-card">
        <h3>Quick Attendance Punch</h3>
        <form className="quick-checkin-form">
          <input
            type="number"
            placeholder="Enter Employee ID..."
            value={quickEmpId}
            onChange={(e) => setQuickEmpId(e.target.value)}
          />
          <button type="button" className="btn-checkin" onClick={handleQuickCheckIn}>
            Punch Check-In
          </button>
          <button type="button" className="btn-checkout" onClick={handleQuickCheckOut}>
            Punch Check-Out
          </button>
        </form>
      </div>

      {/* Attendance Filters */}
      <div className="attendance-filters">
        <div className="filter-group">
          <label>Employee ID:</label>
          <input
            type="number"
            placeholder="Filter Employee..."
            value={filterEmpId}
            onChange={(e) => setFilterEmpId(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button className="btn-secondary" onClick={() => { setFilterEmpId(''); setFromDate(''); setToDate(''); }}>
          Reset Filters
        </button>
      </div>

      {loading ? (
        <p>Loading attendance logs...</p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Worked Hours</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textCenter: 'center', padding: '24px' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendances.map((rec) => (
                  <tr key={rec.attendanceId}>
                    <td>#{rec.attendanceId}</td>
                    <td><strong>Emp #{rec.employeeId}</strong></td>
                    <td>{rec.attendanceDate}</td>
                    <td>{rec.checkInTime || '—'}</td>
                    <td>{rec.checkOutTime || '—'}</td>
                    <td>{rec.workedHours !== null ? `${rec.workedHours} hrs` : '—'}</td>
                    <td>
                      <span className={`badge badge-${rec.status}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td>{rec.remarks || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEdit(rec)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(rec.attendanceId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedRecord ? 'Edit Attendance Record' : 'Log Attendance'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitRecord}>
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
                <label>Attendance Date *</label>
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Check In Time</label>
                  <input
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Check Out Time</label>
                  <input
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Worked Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.workedHours}
                    onChange={(e) => setFormData({ ...formData, workedHours: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF_DAY">HALF_DAY</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                    <option value="WEEK_OFF">WEEK_OFF</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
