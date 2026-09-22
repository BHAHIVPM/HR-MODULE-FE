import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import roleAssignmentService from '../services/roleAssignmentService';
import useCurrentUser from '../../../hooks/useCurrentUser';
import './RoleCreationPage.css';

const USER_TYPES = [
  { value: 'ALL', label: 'All Users' },
  { value: 'SUPERADMIN', label: 'SuperAdmin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' },
];

function UserRoleAssignmentPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userTypeFilter, setUserTypeFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showErrorPopup } = useNotification();
  // Self-edit protection: the logged-in user cannot assign or revoke roles
  // on their own login account.
  const { isSelfId } = useCurrentUser();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleAssignmentService.getAllUsers();
      const list = res?.responseOutput || [];
      setUsers(Array.isArray(list) ? list : []);
      setFilteredUsers(Array.isArray(list) ? list : []);
    } catch (err) { showErrorPopup(err); }
    finally { setLoading(false); }
  }, [showErrorPopup]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (userTypeFilter === 'ALL') setFilteredUsers(users);
    else setFilteredUsers(users.filter((u) => u.userType === userTypeFilter));
  }, [userTypeFilter, users]);

  // True when the currently selected user is the logged-in user himself.
  const isSelfSelected = selectedUser ? isSelfId(selectedUser.loginId) : false;

  const loadUserRoles = useCallback(async (loginId) => {
    setRolesLoading(true);
    try {
      const res = await roleAssignmentService.getRolesByLoginId(loginId);
      const list = res?.responseOutput || [];
      setUserRoles(Array.isArray(list) ? list : []);
      setHasChanges(false);
    } catch (err) { showErrorPopup(err); }
    finally { setRolesLoading(false); }
  }, [showErrorPopup]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadUserRoles(user.loginId);
  };

  const toggleRoleAssignment = (roleId) => {
    if (isSelfSelected) {
      showErrorPopup({
        title: 'Not Allowed',
        message: 'You cannot modify your own role assignments.',
      });
      return;
    }
    setUserRoles((prev) => prev.map((r) => (r.roleId === roleId ? { ...r, isSelected: !r.isSelected } : r)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedUser || isSelfSelected) return;
    setSaving(true);
    try {
      const assignedRoles = userRoles.filter((r) => r.isSelected);
      const payload = {
        roleAssignmentMaster: assignedRoles.map((r) => ({
          loginId: selectedUser.loginId, roleId: r.roleId,
        })),
        userLevelPrivilege: [],
      };
      const res = await roleAssignmentService.saveRoleAssignments(payload);
      showSuccess(res?.message || 'Role assignments saved successfully.', res?.header || 'Saved');
      setHasChanges(false);
      loadUserRoles(selectedUser.loginId);
    } catch (err) { showErrorPopup(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="ra-container">
      <div className="ra-header">
        <div className="ra-title-group">
          <h1>👥 User Role Assignment</h1>
          <p>Assign one or more roles to specific users</p>
        </div>
      </div>
      <div className="ra-card">
        <div className="ra-card-header"><span className="ra-card-title">Select a User</span></div>
        <div className="ra-filter-bar">
          <select value={userTypeFilter} onChange={(e) => setUserTypeFilter(e.target.value)}>
            {USER_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
          <span className="ra-badge">{filteredUsers.length} users</span>
        </div>
        {loading ? (
          <div className="ra-loading"><div className="ra-spinner" /><span>Loading users…</span></div>
        ) : filteredUsers.length === 0 ? (
          <div className="ra-empty"><p>No users found.</p></div>
        ) : (
          <div className="ra-table-wrap">
            <table className="ra-table">
              <thead><tr><th>Login ID</th><th>User Name</th><th>Mobile No</th><th>Email</th><th>User Type</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.loginId} style={{ background: selectedUser?.loginId === user.loginId ? 'rgba(59, 130, 246, 0.05)' : undefined }}>
                    <td><span className="ra-id-badge">{user.loginId}</span></td>
                    <td><strong>{user.userName}</strong></td>
                    <td>{user.mobileNo || '—'}</td>
                    <td>{user.emailId || '—'}</td>
                    <td><span className={`ra-tag ra-tag-${user.userType.toLowerCase()}`}>{user.userType}</span></td>
                    <td><button className="ra-btn ra-btn-primary" onClick={() => handleSelectUser(user)}>Assign Roles</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="ra-user-card">
          <h3>Selected User</h3>
          <div className="ra-user-details">
            <div className="ra-user-detail-item"><span className="ra-user-detail-label">Login ID</span><span className="ra-user-detail-value">{selectedUser.loginId}</span></div>
            <div className="ra-user-detail-item"><span className="ra-user-detail-label">Name</span><span className="ra-user-detail-value">{selectedUser.userName}</span></div>
            <div className="ra-user-detail-item"><span className="ra-user-detail-label">Mobile</span><span className="ra-user-detail-value">{selectedUser.mobileNo || '—'}</span></div>
            <div className="ra-user-detail-item"><span className="ra-user-detail-label">Email</span><span className="ra-user-detail-value">{selectedUser.emailId || '—'}</span></div>
            <div className="ra-user-detail-item"><span className="ra-user-detail-label">User Type</span><span className="ra-user-detail-value">{selectedUser.userType}</span></div>
          </div>
          {isSelfSelected && (
            <p
              style={{
                margin: '12px 0 0',
                padding: '8px 10px',
                fontSize: 13,
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.08)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                borderRadius: 6,
              }}
            >
              🔒 Self-edit protection: you cannot modify your own role assignments.
            </p>
          )}
        </div>
      )}
      {selectedUser && (
        <div className="ra-card">
          <div className="ra-card-header">
            <span className="ra-card-title">Available Roles</span>
            <button
              className="ra-btn ra-btn-primary"
              onClick={handleSave}
              disabled={saving || !hasChanges || isSelfSelected}
              title={isSelfSelected ? 'You cannot modify your own role assignments' : undefined}
            >
              {saving ? 'Saving…' : '💾 Save Assignments'}
            </button>
          </div>
          {rolesLoading ? (
            <div className="ra-loading"><div className="ra-spinner" /><span>Loading roles…</span></div>
          ) : userRoles.length === 0 ? (
            <div className="ra-empty"><p>No roles available.</p></div>
          ) : (
            <div className="ra-table-wrap">
              <table className="ra-table">
                <thead><tr><th>Role ID</th><th>Role Name</th><th>Category</th><th>System</th><th>Assigned</th><th>Assigned At</th></tr></thead>
                <tbody>
                  {userRoles.map((role) => (
                    <tr key={role.roleId} style={{ background: role.isSelected ? 'rgba(16, 185, 129, 0.03)' : undefined }}>
                      <td><span className="ra-id-badge">{role.roleId}</span></td>
                      <td><strong>{role.roleName}</strong></td>
                      <td>{role.roleCategory ? (<span className={`ra-tag ra-tag-${role.roleCategory.toLowerCase()}`}>{role.roleCategory}</span>) : (<span className="ra-tag ra-tag-super">Superadmin</span>)}</td>
                      <td><span className={`ra-status ${role.isSystem ? 'ra-status-yes' : 'ra-status-no'}`}>{role.isSystem ? 'Yes' : 'No'}</span></td>
                      <td><input type="checkbox" className="ra-priv-checkbox" checked={role.isSelected} disabled={isSelfSelected} onChange={() => toggleRoleAssignment(role.roleId)} /></td>
                      <td className="ra-date">{role.assignedAt ? new Date(role.assignedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignmentPage;