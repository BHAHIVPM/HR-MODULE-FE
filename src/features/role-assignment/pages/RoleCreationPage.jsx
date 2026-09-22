import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import roleService from '../services/roleService';
import { REGISTRATION_ROUTES } from '../../registration/config/moduleRegistrationConfig';
import './RoleCreationPage.css';

const ROLE_CATEGORIES = [
  { value: '', label: '— None (Superadmin) —' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'USER', label: 'USER' },
];

function RoleCreationPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: '', remarks: '', roleCategory: '', system: false, editable: true, assignment: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const { showSuccess, showErrorPopup } = useNotification();
  const navigate = useNavigate();

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleService.getAllRoles();
      const list = res?.responseOutput || [];
      setRoles(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [showErrorPopup]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const openCreateModal = () => {
    navigate(REGISTRATION_ROUTES.role);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName || '', remarks: role.remarks || '',
      roleCategory: role.roleCategory || '', system: role.system || false,
      editable: role.editable ?? true, assignment: role.assignment || false,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingRole) {
        const updateData = {
          roleName: formData.roleName, remarks: formData.remarks,
          roleCategory: formData.roleCategory, system: formData.system,
        };
        const res = await roleService.updateRole(editingRole.roleId, updateData);
        showSuccess(res?.message || 'Role updated successfully.', res?.header || 'Updated');
      } else {
        const res = await roleService.createRole(formData);
        showSuccess(res?.message || 'Role created successfully.', res?.header || 'Created');
      }
      setModalOpen(false);
      loadRoles();
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteConfirm = (role) => {
    setDeletingRole(role);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      const res = await roleService.deleteRole(deletingRole.roleId);
      showSuccess(res?.message || 'Role deleted successfully.', res?.header || 'Deleted');
      setDeleteConfirmOpen(false);
      setDeletingRole(null);
      loadRoles();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="ra-container">
      <div className="ra-header">
        <div className="ra-title-group">
          <h1>📋 Role Creation Management</h1>
          <p>Create, view, edit, and delete user roles in the system</p>
        </div>
        <button type="button" className="ra-btn ra-btn-primary" onClick={openCreateModal}>+ Create Role</button>
      </div>
      <div className="ra-card">
        <div className="ra-card-header">
          <span className="ra-card-title">All Roles</span>
          <span className="ra-badge">{roles.length} {roles.length === 1 ? 'role' : 'roles'}</span>
        </div>
        {loading ? (
          <div className="ra-loading"><div className="ra-spinner" /><span>Loading roles…</span></div>
        ) : roles.length === 0 ? (
          <div className="ra-empty"><span className="ra-empty-icon">📋</span><p>No roles found. Create your first role to get started.</p></div>
        ) : (
          <div className="ra-table-wrap">
            <table className="ra-table">
              <thead>
                <tr>
                  <th>Role ID</th><th>Role Name</th><th>Remarks</th><th>Category</th>
                  <th>System</th><th>Editable</th><th>Assigned</th><th>Created At</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.roleId}>
                    <td><span className="ra-id-badge">{role.roleId}</span></td>
                    <td><strong>{role.roleName}</strong></td>
                    <td className="ra-remarks">{role.remarks || '—'}</td>
                    <td>
                      {role.roleCategory ? (
                        <span className={`ra-tag ra-tag-${role.roleCategory.toLowerCase()}`}>{role.roleCategory}</span>
                      ) : (<span className="ra-tag ra-tag-super">Superadmin</span>)}
                    </td>
                    <td><span className={`ra-status ${role.system ? 'ra-status-yes' : 'ra-status-no'}`}>{role.system ? 'Yes' : 'No'}</span></td>
                    <td><span className={`ra-status ${role.editable ? 'ra-status-yes' : 'ra-status-no'}`}>{role.editable ? 'Yes' : 'No'}</span></td>
                    <td><span className={`ra-status ${role.assignment ? 'ra-status-yes' : 'ra-status-no'}`}>{role.assignment ? 'Yes' : 'No'}</span></td>
                    <td className="ra-date">{fmtDate(role.createdAt)}</td>
                    <td>
                      <div className="ra-actions">
                        <button type="button" className="ra-btn-icon ra-btn-edit" onClick={() => openEditModal(role)}>✏️ Edit</button>
                        <button type="button" className="ra-btn-icon ra-btn-del" onClick={() => openDeleteConfirm(role)}>🗑️ Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="ra-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ra-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ra-modal-head">
              <h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
              <button type="button" className="ra-modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="ra-modal-body">
                <div className="ra-form-group">
                  <label htmlFor="rname">Role Name <span className="ra-req">*</span></label>
                  <input id="rname" type="text" value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    placeholder="Enter role name" required maxLength={100} />
                </div>
                <div className="ra-form-group">
                  <label htmlFor="rremarks">Remarks</label>
                  <textarea id="rremarks" value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter remarks" rows={3} maxLength={500} />
                </div>
                <div className="ra-form-group">
                  <label htmlFor="rcat">Role Category</label>
                  <select id="rcat" value={formData.roleCategory}
                    onChange={(e) => setFormData({ ...formData, roleCategory: e.target.value })}>
                    {ROLE_CATEGORIES.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                  </select>
                </div>
                <div className="ra-form-group ra-checkbox-group">
                  <label className="ra-checkbox-label">
                    <input type="checkbox" checked={formData.system}
                      onChange={(e) => setFormData({ ...formData, system: e.target.checked })} />
                    <span>Is System Role</span>
                  </label>
                  <small className="ra-hint">System roles are protected and have elevated privileges</small>
                </div>
              </div>
              <div className="ra-modal-foot">
                <button type="button" className="ra-btn ra-btn-secondary" onClick={() => setModalOpen(false)} disabled={formLoading}>Cancel</button>
                <button type="submit" className="ra-btn ra-btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving…' : editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirmOpen && (
        <div className="ra-modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="ra-modal ra-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="ra-modal-head">
              <h2>Confirm Delete</h2>
              <button type="button" className="ra-modal-close" onClick={() => setDeleteConfirmOpen(false)}>✕</button>
            </div>
            <div className="ra-modal-body">
              <div className="ra-delete-confirm">
                <span className="ra-del-icon">⚠️</span>
                <p>Are you sure you want to delete the role <strong>"{deletingRole?.roleName}"</strong>?</p>
                <p className="ra-warn-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="ra-modal-foot">
              <button type="button" className="ra-btn ra-btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</button>
              <button type="button" className="ra-btn ra-btn-danger" onClick={handleDelete}>Delete Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCreationPage;