import React, { useState, useEffect, useCallback } from 'react';
import employeeService from '../services/employeeService';
import EmployeeForm from '../components/EmployeeForm';
import { useNotification } from '../../../context/NotificationContext';
import './EmployeeManagementPage.css';

function EmployeeManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [managerFilterId, setManagerFilterId] = useState('');
  const [activeFilterType, setActiveFilterType] = useState('all'); // 'all', 'search', 'manager'
  
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Initial load / search
  const loadEmployees = useCallback(
    async (keyword = '') => {
      setLoading(true);
      try {
        const response = await employeeService.searchByName(keyword);
        // ResponseMessage shape: response.data.responseOutput
        const list = response?.data?.responseOutput || [];
        setEmployees(Array.isArray(list) ? list : []);
        setActiveFilterType(keyword ? 'search' : 'all');
      } catch (err) {
        showErrorPopup(err);
      } finally {
        setLoading(false);
      }
    },
    [showErrorPopup]
  );

  useEffect(() => {
    loadEmployees('');
  }, [loadEmployees]);

  // Handle Search Input submit / keypress
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setManagerFilterId('');
    loadEmployees(searchKeyword.trim());
  };

  // Handle Manager Direct Reports lookup: GET /employee/manager/{managerId}
  const handleManagerLookup = async (e) => {
    if (e) e.preventDefault();
    if (!managerFilterId || isNaN(managerFilterId)) {
      showErrorPopup({
        title: 'Invalid Manager ID',
        message: 'Please provide a valid numeric Manager ID.',
      });
      return;
    }

    setLoading(true);
    setSearchKeyword('');
    try {
      const response = await employeeService.findByReportingManagerId(parseInt(managerFilterId, 10));
      const team = response?.data?.responseOutput || [];
      setEmployees(Array.isArray(team) ? team : []);
      setActiveFilterType('manager');
      showSuccess(response?.data?.message || 'Direct reports fetched successfully.', 'Team Filter');
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setManagerFilterId('');
    loadEmployees('');
  };

  // Handle Quick Status Update: PATCH /employee/{employeeId}/status?status=...
  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const response = await employeeService.updateStatus(employeeId, newStatus);
      
      // Update local state immediately
      setEmployees((prev) =>
        prev.map((emp) => (emp.employeeId === employeeId ? { ...emp, status: newStatus } : emp))
      );

      // Top right slide-in success notification (1.5s)
      showSuccess(
        response?.data?.message || `Employee status updated to ${newStatus}`,
        'Status Updated'
      );
    } catch (err) {
      // General error popup modal
      showErrorPopup(err);
    }
  };

  // Handle Soft Delete: PATCH /employee/soft-delete/{employeeId}
  const handleSoftDelete = async (employeeId, employeeName) => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate ${employeeName || 'this employee'}?`
    );
    if (!confirm) return;

    try {
      const response = await employeeService.softDelete(employeeId);
      
      // Update local status to INACTIVE
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === employeeId ? { ...emp, status: 'INACTIVE' } : emp
        )
      );

      // Top right slide-in success notification (1.5s)
      showSuccess(
        response?.data?.message || 'Employee deactivated successfully.',
        'Deactivation'
      );
    } catch (err) {
      // General error popup modal
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
    // Reload list to refresh table
    loadEmployees(searchKeyword);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="employee-page-container">
      {/* Top Header */}
      <div className="employee-page-header">
        <div className="employee-page-title-group">
          <h1>Employee Management</h1>
          <p>Search, manage team structures, register new hires, and update status</p>
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
        {/* Search by Name */}
        <form className="search-box" onSubmit={handleSearch}>
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
            placeholder="Search by first or last name…"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </form>
        <button type="button" className="btn-filter-action" onClick={handleSearch}>
          Search
        </button>

        {/* Filter by Manager ID */}
        <form className="manager-filter-box" onSubmit={handleManagerLookup}>
          <label htmlFor="mgrFilterInput">Direct Reports:</label>
          <input
            id="mgrFilterInput"
            type="number"
            min="1"
            className="manager-input"
            placeholder="Manager ID"
            value={managerFilterId}
            onChange={(e) => setManagerFilterId(e.target.value)}
          />
          <button type="submit" className="btn-filter-action">
            Fetch Team
          </button>
        </form>

        {(searchKeyword || managerFilterId || activeFilterType !== 'all') && (
          <button type="button" className="btn-filter-clear" onClick={handleResetFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Employee List Table */}
      <div className="employee-table-card">
        <div className="table-header-info">
          <span className="title">
            {activeFilterType === 'manager'
              ? `Direct Reports of Manager #${managerFilterId}`
              : activeFilterType === 'search' && searchKeyword
              ? `Search Results for "${searchKeyword}"`
              : 'All Employees'}
          </span>
          <span className="count-badge">
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent', width: 24, height: 24 }} />
              <p style={{ marginTop: 12 }}>Loading employee records…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No employees found matching the criteria.</p>
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
                {employees.map((emp) => {
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
                            onChange={(e) => handleStatusChange(emp.employeeId, e.target.value)}
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

                          {/* Soft Delete Deactivate Button */}
                          {emp.status !== 'INACTIVE' && (
                            <button
                              type="button"
                              className="btn-action-icon danger"
                              onClick={() =>
                                handleSoftDelete(emp.employeeId, `${emp.firstName} ${emp.lastName || ''}`)
                              }
                              title="Deactivate (Soft Delete)"
                            >
                              🚫 Deactivate
                            </button>
                          )}
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
