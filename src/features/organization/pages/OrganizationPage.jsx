import React, { useState, useEffect, useCallback } from 'react';
import departmentService from '../services/departmentService';
import designationService from '../services/designationService';
import { useNotification } from '../../../context/NotificationContext';
import './OrganizationPage.css';

function OrganizationPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'designations'
  
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    departmentCode: '',
    departmentName: '',
    departmentHeadId: '',
    description: '',
    status: 'ACTIVE',
  });

  // Designation Modal State
  const [showDesigModal, setShowDesigModal] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState(null);
  const [desigForm, setDesigForm] = useState({
    designationCode: '',
    designationName: '',
    departmentId: '',
    gradeLevel: '',
    status: 'ACTIVE',
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchDesignations = useCallback(async () => {
    try {
      const res = await designationService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setDesignations(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDepartments(), fetchDesignations()]);
    setLoading(false);
  }, [fetchDepartments, fetchDesignations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Department Submit
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...deptForm,
        departmentHeadId: deptForm.departmentHeadId ? parseInt(deptForm.departmentHeadId, 10) : null,
      };

      if (selectedDept) {
        const res = await departmentService.update(selectedDept.departmentId, payload);
        showSuccess(res?.data?.message || 'Department updated successfully.');
      } else {
        const res = await departmentService.save(payload);
        showSuccess(res?.data?.message || 'Department created successfully.');
      }
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Handle Designation Submit
  const handleDesigSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...desigForm,
        departmentId: desigForm.departmentId ? parseInt(desigForm.departmentId, 10) : null,
      };

      if (selectedDesig) {
        const res = await designationService.update(selectedDesig.designationId, payload);
        showSuccess(res?.data?.message || 'Designation updated successfully.');
      } else {
        const res = await designationService.save(payload);
        showSuccess(res?.data?.message || 'Designation created successfully.');
      }
      setShowDesigModal(false);
      fetchDesignations();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEditDept = (dept) => {
    setSelectedDept(dept);
    setDeptForm({
      departmentCode: dept.departmentCode || '',
      departmentName: dept.departmentName || '',
      departmentHeadId: dept.departmentHeadId || '',
      description: dept.description || '',
      status: dept.status || 'ACTIVE',
    });
    setShowDeptModal(true);
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Delete department ${name}?`)) return;
    try {
      const res = await departmentService.delete(id);
      showSuccess(res?.data?.message || 'Department deleted.');
      fetchDepartments();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEditDesig = (desig) => {
    setSelectedDesig(desig);
    setDesigForm({
      designationCode: desig.designationCode || '',
      designationName: desig.designationName || '',
      departmentId: desig.departmentId || '',
      gradeLevel: desig.gradeLevel || '',
      status: desig.status || 'ACTIVE',
    });
    setShowDesigModal(true);
  };

  const handleDeleteDesig = async (id, name) => {
    if (!window.confirm(`Delete designation ${name}?`)) return;
    try {
      const res = await designationService.delete(id);
      showSuccess(res?.data?.message || 'Designation deleted.');
      fetchDesignations();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDesigs = designations.filter(
    (d) =>
      d.designationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.designationCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="org-page">
      <div className="org-header">
        <h1>Organization Management</h1>
      </div>

      <div className="org-tabs">
        <button
          className={`org-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments ({departments.length})
        </button>
        <button
          className={`org-tab-btn ${activeTab === 'designations' ? 'active' : ''}`}
          onClick={() => setActiveTab('designations')}
        >
          Designations ({designations.length})
        </button>
      </div>

      <div className="org-toolbar">
        <input
          type="text"
          className="org-search-input"
          placeholder={activeTab === 'departments' ? 'Search department name or code...' : 'Search designation name or code...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === 'departments' ? (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedDept(null);
              setDeptForm({
                departmentCode: '',
                departmentName: '',
                departmentHeadId: '',
                description: '',
                status: 'ACTIVE',
              });
              setShowDeptModal(true);
            }}
          >
            + Add Department
          </button>
        ) : (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedDesig(null);
              setDesigForm({
                designationCode: '',
                designationName: '',
                departmentId: '',
                gradeLevel: '',
                status: 'ACTIVE',
              });
              setShowDesigModal(true);
            }}
          >
            + Add Designation
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading organization data...</p>
      ) : activeTab === 'departments' ? (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Head Employee ID</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textCenter: 'center', padding: '24px' }}>
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredDepts.map((d) => (
                  <tr key={d.departmentId}>
                    <td><strong>{d.departmentCode}</strong></td>
                    <td>{d.departmentName}</td>
                    <td>{d.departmentHeadId || '—'}</td>
                    <td>{d.description || '—'}</td>
                    <td>
                      <span className={`badge ${d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEditDept(d)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteDept(d.departmentId, d.departmentName)}>Delete</button>
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
                <th>Name</th>
                <th>Dept ID</th>
                <th>Grade Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDesigs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textCenter: 'center', padding: '24px' }}>
                    No designations found.
                  </td>
                </tr>
              ) : (
                filteredDesigs.map((d) => (
                  <tr key={d.designationId}>
                    <td><strong>{d.designationCode}</strong></td>
                    <td>{d.designationName}</td>
                    <td>{d.departmentId || '—'}</td>
                    <td>{d.gradeLevel || '—'}</td>
                    <td>
                      <span className={`badge ${d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEditDesig(d)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteDesig(d.designationId, d.designationName)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDept ? 'Edit Department' : 'Add Department'}</h2>
              <button className="close-btn" onClick={() => setShowDeptModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleDeptSubmit}>
              <div className="form-group">
                <label>Department Code *</label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentCode}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentCode: e.target.value })}
                  placeholder="e.g. DEPT_HR"
                />
              </div>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentName}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })}
                  placeholder="e.g. Human Resources"
                />
              </div>
              <div className="form-group">
                <label>Department Head Employee ID</label>
                <input
                  type="number"
                  value={deptForm.departmentHeadId}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentHeadId: e.target.value })}
                  placeholder="Employee ID"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={deptForm.status}
                  onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesigModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDesig ? 'Edit Designation' : 'Add Designation'}</h2>
              <button className="close-btn" onClick={() => setShowDesigModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleDesigSubmit}>
              <div className="form-group">
                <label>Designation Code *</label>
                <input
                  type="text"
                  required
                  value={desigForm.designationCode}
                  onChange={(e) => setDesigForm({ ...desigForm, designationCode: e.target.value })}
                  placeholder="e.g. DESIG_ENG_SR"
                />
              </div>
              <div className="form-group">
                <label>Designation Name *</label>
                <input
                  type="text"
                  required
                  value={desigForm.designationName}
                  onChange={(e) => setDesigForm({ ...desigForm, designationName: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={desigForm.departmentId}
                  onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName} ({dept.departmentCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Grade Level</label>
                <input
                  type="text"
                  value={desigForm.gradeLevel}
                  onChange={(e) => setDesigForm({ ...desigForm, gradeLevel: e.target.value })}
                  placeholder="e.g. L4"
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={desigForm.status}
                  onChange={(e) => setDesigForm({ ...desigForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDesigModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Designation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizationPage;
