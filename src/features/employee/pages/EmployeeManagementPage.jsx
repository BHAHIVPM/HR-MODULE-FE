import React, { useState, useEffect, useCallback } from 'react';
import employeeService from '../services/employeeService';
import EmployeeForm from '../components/EmployeeForm';
import { useNotification } from '../../../context/NotificationContext';
import './EmployeeManagementPage.css';

function EmployeeManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'all'
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Initial load: fetches active employees via GET /employee/active (or all via /employee/all)
  const loadEmployees = useCallback(
    async (mode = viewMode) => {
      setLoading(true);
      try {
        const response = mode === 'all'
          ? await employeeService.findAll()
          : await employeeService.findAllActive();
        
        const list = response?.data?.responseOutput || response?.data || [];
        setEmployees(Array.isArray(list) ? list : []);
      } catch (err) {
        showErrorPopup(err);
      } finally {
        setLoading(false);
      }
    },
    [viewMode, showErrorPopup]
  );

  useEffect(() => {
    loadEmployees(viewMode);
  }, [viewMode, loadEmployees]);

  const handleToggleViewMode = (newMode) => {
    setViewMode(newMode);
  };

  // Quick Status Update using PUT /employee/update/{employeeId}
  const handleStatusChange = async (emp, newStatus) => {
    try {
      const updatedEmp = { ...emp, status: newStatus };
      const response = await employeeService.update(emp.employeeId, updatedEmp);
      
      setEmployees((prev) =>
        prev.map((e) => (e.employeeId === emp.employeeId ? { ...e, status: newStatus } : e))
      );

      showSuccess(
        response?.data?.message || `Employee status updated to ${newStatus}`,
        'Status Updated'
      );
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Delete Employee using DELETE /employee/{employeeId}
  const handleDelete = async (employeeId, employeeName) => {
    const confirm = window.confirm(
      `Are you sure you want to delete ${employeeName || 'this employee'}?`
    );
    if (!confirm) return;

    try {
      const response = await employeeService.delete(employeeId);
      showSuccess(
        response?.data?.message || 'Employee deleted successfully.',
        'Deleted'
      );
      loadEmployees(viewMode);
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    loadEmployees(viewMode);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  // Client-side search filter
  const filteredEmployees = employees.filter((emp) => {
    if (!searchKeyword) return true;
    const kw = searchKeyword.toLowerCase();
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    return fullName.includes(kw) || code.includes(kw) || email.includes(kw) || dept.includes(kw);
  });

  return (
    <div className="employee-page-container">
      {/* Top Header */}
      <div className="employee-page-header">
        <div className="employee-page-title-group">
          <h1>Employee Directory</h1>
          <p>List of active employee records fetched directly from the database</p>
        </div>

        <div className="employee-header-actions">
          <button
            type="button"
            className={`btn-toggle-form ${showForm ? 'secondary' : 'primary'}`}
            onClick={() => {
              if (showForm) {
                handleFormCancel();
              } else {
                setSelectedEmployee(null);
                setShowForm(true);
              }
            }}
          >
            {showForm ? '✕ Close Form' : '+ Add New Employee'}
          </button>
        </div>
      </div>

      {/* Embedded Form if active */}
      {showForm && (
        <EmployeeForm
          initialData={selectedEmployee}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Filter / Search Toolbar */}
      <div className="employee-toolbar">
        {/* Filter Toggle: Active vs All */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn-filter-action ${viewMode === 'active' ? 'active' : ''}`}
            onClick={() => handleToggleViewMode('active')}
            style={{
              backgroundColor: viewMode === 'active' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: '1px solid #3b82f6',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Active Employees Only
          </button>
          <button
            type="button"
            className={`btn-filter-action ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => handleToggleViewMode('all')}
            style={{
              backgroundColor: viewMode === 'all' ? '#3b82f6' : 'transparent',
              color: '#fff',
              border: '1px solid #3b82f6',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            All Employees (Including Resigned/Terminated)
          </button>
        </div>

        {/* Search Input */}
        <div className="search-box">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by code, name, email, department…"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Employee List Table */}
      <div className="employee-table-card">
        <div className="table-header-info">
          <span className="title">
            {viewMode === 'active' ? 'Active Employee Database' : 'All Employee Records'}
          </span>
          <span className="count-badge">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent', width: 24, height: 24 }} />
              <p style={{ marginTop: 12 }}>Loading employee records from database…</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No employee records found in database.</p>
            </div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Employee Name & Email</th>
                  <th>Department & Role</th>
                  <th>Contact</th>
                  <th>Date of Joining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const statusClass = (emp.status || 'active').toLowerCase();
                  return (
                    <tr key={emp.employeeId || emp.employeeCode}>
                      <td>
                        <span className="emp-code-badge">{emp.employeeCode}</span>
                      </td>
                      <td>
                        <div className="emp-name-cell">
                          <span className="emp-full-name">
                            {emp.firstName} {emp.lastName || ''}
                          </span>
                          <span className="emp-sub-email">{emp.email}</span>
                        </div>
                      </td>
                      <td>
                        <div>{emp.designation || '—'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {emp.department || 'General'}
                        </div>
                      </td>
                      <td>
                        <div>{emp.mobileNo}</div>
                        {emp.reportingManagerId && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Mgr ID: #{emp.reportingManagerId}
                          </div>
                        )}
                      </td>
                      <td>{emp.dateOfJoining ? String(emp.dateOfJoining).slice(0, 10) : '—'}</td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          <span className="status-pill-dot" />
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-cell-group">
                          {/* Quick Status Select */}
                          <select
                            className="status-select-inline"
                            value={emp.status}
                            onChange={(e) => handleStatusChange(emp, e.target.value)}
                            title="Quick Status Update"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="RESIGNED">RESIGNED</option>
                            <option value="TERMINATED">TERMINATED</option>
                          </select>

                          {/* Edit Button */}
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => handleEditClick(emp)}
                            title="Edit Employee"
                          >
                            ✏️ Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="btn-action-icon danger"
                            onClick={() =>
                              handleDelete(emp.employeeId, `${emp.firstName} ${emp.lastName || ''}`)
                            }
                            title="Delete Employee"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeManagementPage;

