import React, { useState, useCallback } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import roleAssignmentService from '../services/roleAssignmentService';
import userLevelPrivilegeService from '../services/userLevelPrivilegeService';
import './RoleCreationPage.css';

function UserLevelPrivilegePage() {
  const [searchLoginId, setSearchLoginId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showErrorPopup } = useNotification();

  const handleSearch = useCallback(async () => {
    if (!searchLoginId.trim()) return;
    setLoading(true);
    try {
      const [privRes, rolesRes] = await Promise.all([
        userLevelPrivilegeService.fetchUserPrivileges(searchLoginId.trim()),
        roleAssignmentService.getOnlyAssignedRoles(searchLoginId.trim()),
      ]);
      const privList = privRes?.responseOutput || [];
      const roleList = rolesRes?.responseOutput || [];
      setPrivileges(Array.isArray(privList) ? privList : []);
      setAssignedRoles(Array.isArray(roleList) ? roleList : []);
      if (roleList.length > 0) {
        const first = roleList[0];
        setUserInfo({
          loginId: first.loginId || searchLoginId,
          userName: '', mobileNo: '', emailId: '', userType: '',
        });
      }
      setHasChanges(false);
    } catch (err) { showErrorPopup(err); }
    finally { setLoading(false); }
  }, [searchLoginId, showErrorPopup]);

  const updatePrivilege = (menuId, field, value) => {
    setPrivileges((prev) => prev.map((p) => (p.menuId === menuId ? { ...p, [field]: value } : p)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!userInfo) return;
    setSaving(true);
    try {
      const payload = privileges.map((p) => ({
        loginId: userInfo.loginId,
        menuId: p.menuId,
        canView: p.canView,
        canAdd: p.canAdd,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
      }));
      const res = await userLevelPrivilegeService.saveUserPrivileges(payload);
      showSuccess(res?.message || 'User privileges saved successfully.', 'Saved');
      setHasChanges(false);
    } catch (err) { showErrorPopup(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    if (searchLoginId.trim()) handleSearch();
  };

  return (
    <div className="ra-container">
      <div className="ra-header">
        <div className="ra-title-group">
          <h1>🛡️ User Level Privileges</h1>
          <p>View and override user-level privileges beyond role assignments</p>
        </div>
      </div>

      {/* Section A: User Selection */}
      <div className="ra-card">
        <div className="ra-card-header"><span className="ra-card-title">Search User</span></div>
        <div className="ra-filter-bar">
          <input
            type="text"
            className="ra-search-input"
            placeholder="Enter Login ID to search..."
            value={searchLoginId}
            onChange={(e) => setSearchLoginId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button className="ra-btn ra-btn-primary" onClick={handleSearch} disabled={loading || !searchLoginId.trim()}>
            {loading ? 'Searching…' : '🔍 Search'}
          </button>
        </div>
      </div>

      {userInfo && (
        <div className="ra-user-card">
          <h3>User Information</h3>
          <div className="ra-user-details">
            <div className="ra-user-detail-item">
              <span className="ra-user-detail-label">Login ID</span>
              <span className="ra-user-detail-value">{userInfo.loginId}</span>
            </div>
            <div className="ra-user-detail-item">
              <span className="ra-user-detail-label">Name</span>
              <span className="ra-user-detail-value">{userInfo.userName || '—'}</span>
            </div>
            <div className="ra-user-detail-item">
              <span className="ra-user-detail-label">Mobile</span>
              <span className="ra-user-detail-value">{userInfo.mobileNo || '—'}</span>
            </div>
            <div className="ra-user-detail-item">
              <span className="ra-user-detail-label">Email</span>
              <span className="ra-user-detail-value">{userInfo.emailId || '—'}</span>
            </div>
            <div className="ra-user-detail-item">
              <span className="ra-user-detail-label">User Type</span>
              <span className="ra-user-detail-value">{userInfo.userType || '—'}</span>
            </div>
          </div>
          {assignedRoles.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span className="ra-user-detail-label">Assigned Roles</span>
              <div className="ra-role-badges">
                {assignedRoles.map((role) => (
                  <span key={role.roleId} className="ra-role-badge-item">{role.roleName}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section B: Privilege Management */}
      {userInfo && (
        <div className="ra-card">
          <div className="ra-card-header">
            <span className="ra-card-title">Privilege Overrides</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ra-btn ra-btn-secondary" onClick={handleReset} disabled={loading || saving}>
                ↺ Reset to Role Defaults
              </button>
              <button className="ra-btn ra-btn-primary" onClick={handleSave} disabled={saving || !hasChanges}>
                {saving ? 'Saving…' : '💾 Save Privileges'}
              </button>
            </div>
          </div>
          {loading ? (
            <div className="ra-loading"><div className="ra-spinner" /><span>Loading privileges…</span></div>
          ) : privileges.length === 0 ? (
            <div className="ra-empty"><p>No privileges found for this user.</p></div>
          ) : (
            <div className="ra-table-wrap">
              <table className="ra-table ra-priv-table">
                <thead>
                  <tr>
                    <th>Menu Name</th><th>View</th><th>Add</th><th>Edit</th><th>Delete</th><th>Editable</th><th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {privileges.map((priv) => (
                    <tr key={priv.menuId}>
                      <td className="ra-menu-name">{priv.menuName}</td>
                      <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canView}
                        onChange={(e) => updatePrivilege(priv.menuId, 'canView', e.target.checked)} /></td>
                      <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canAdd}
                        onChange={(e) => updatePrivilege(priv.menuId, 'canAdd', e.target.checked)} /></td>
                      <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canEdit}
                        onChange={(e) => updatePrivilege(priv.menuId, 'canEdit', e.target.checked)} /></td>
                      <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canDelete}
                        onChange={(e) => updatePrivilege(priv.menuId, 'canDelete', e.target.checked)} /></td>
                      <td>
                        <span className={`ra-status ${priv.isEditable ? 'ra-status-yes' : 'ra-status-no'}`}>
                          {priv.isEditable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`ra-source-tag ${priv.source === 'USER' ? 'ra-source-user' : 'ra-source-role'}`}>
                          {priv.source === 'USER' ? 'Override' : 'Role'}
                        </span>
                      </td>
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

export default UserLevelPrivilegePage;