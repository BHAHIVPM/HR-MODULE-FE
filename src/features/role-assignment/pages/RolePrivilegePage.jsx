import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import roleService from '../services/roleService';
import rolePrivilegeService from '../services/rolePrivilegeService';
import './RoleCreationPage.css';

function RolePrivilegePage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showSuccess, showErrorPopup } = useNotification();

  const loadRoles = useCallback(async () => {
    try {
      const res = await roleService.getAllRoles();
      const list = res?.responseOutput || [];
      setRoles(Array.isArray(list) ? list : []);
    } catch (err) { showErrorPopup(err); }
  }, [showErrorPopup]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const loadPrivileges = useCallback(async (roleId) => {
    setLoading(true);
    try {
      const res = await rolePrivilegeService.getPrivilegesByRole(roleId);
      const list = res?.responseOutput || [];
      setPrivileges(Array.isArray(list) ? list : []);
      setHasChanges(false);
    } catch (err) { showErrorPopup(err); }
    finally { setLoading(false); }
  }, [showErrorPopup]);

  const handleRoleChange = (e) => {
    const roleId = Number(e.target.value);
    setSelectedRoleId(roleId);
    if (roleId) loadPrivileges(roleId);
  };

  const updatePrivilege = (menuId, field, value) => {
    setPrivileges((prev) => prev.map((p) => (p.menuId === menuId ? { ...p, [field]: value } : p)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const payload = privileges.map((p) => ({
        privilegeId: 0, roleId: selectedRoleId, menuId: p.menuId,
        canView: p.canView, canAdd: p.canAdd, canEdit: p.canEdit, canDelete: p.canDelete,
      }));
      const res = await rolePrivilegeService.savePrivilegeBatch(payload);
      showSuccess(res?.message || 'Privileges saved successfully.', res?.header || 'Saved');
      setHasChanges(false);
    } catch (err) { showErrorPopup(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => { if (selectedRoleId) loadPrivileges(selectedRoleId); };

  const selectedRole = roles.find((r) => r.roleId === selectedRoleId);
  const isRoleEditable = selectedRole?.editable !== false;

  return (
    <div className="ra-container">
      <div className="ra-header">
        <div className="ra-title-group">
          <h1>🔐 Role Privilege Assignment</h1>
          <p>Assign menu privileges (view, add, edit, delete) to a specific role</p>
        </div>
      </div>
      <div className="ra-card">
        <div className="ra-form-group">
          <label htmlFor="roleSelect">Select Role to Configure</label>
          <select id="roleSelect" value={selectedRoleId ?? ''} onChange={handleRoleChange}>
            <option value="">— Choose a role —</option>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleId}>{role.roleName} (ID: {role.roleId})</option>
            ))}
          </select>
        </div>
      </div>
      {selectedRoleId && !isRoleEditable && (
        <div className="ra-alert ra-alert-warn">⚠️ This role cannot be edited after assignment.</div>
      )}
      {selectedRoleId && (
        <div className="ra-card">
          <div className="ra-card-header">
            <span className="ra-card-title">Privileges for "{selectedRole?.roleName}"</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ra-btn ra-btn-secondary" onClick={handleReset} disabled={loading || saving}>↺ Reset</button>
              <button className="ra-btn ra-btn-primary" onClick={handleSave} disabled={saving || !hasChanges || !isRoleEditable}>
                {saving ? 'Saving…' : '💾 Save All'}
              </button>
            </div>
          </div>
          {loading ? (
            <div className="ra-loading"><div className="ra-spinner" /><span>Loading privileges…</span></div>
          ) : privileges.length === 0 ? (
            <div className="ra-empty"><p>No menus found for this role.</p></div>
          ) : (
            <div className="ra-table-wrap">
              <table className="ra-table ra-priv-table">
                <thead>
                  <tr>
                    <th>Main Group</th><th>Sub Group</th><th>Menu Name</th>
                    <th>View</th><th>Add</th><th>Edit</th><th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {privileges.map((priv, idx) => {
                    const prevMain = idx > 0 ? privileges[idx - 1].mainGroupName : null;
                    const prevSub = idx > 0 ? privileges[idx - 1].subGroupName : null;
                    const showMain = prevMain !== priv.mainGroupName;
                    const showSub = prevSub !== priv.subGroupName || showMain;
                    return (
                      <tr key={priv.menuId}>
                        {showMain ? (
                          <td className="ra-group-name" rowSpan={privileges.filter((p) => p.mainGroupName === priv.mainGroupName).length}>
                            {priv.mainGroupName}
                          </td>
                        ) : null}
                        {showSub ? (
                          <td className="ra-sub-name" rowSpan={privileges.filter((p) => p.mainGroupName === priv.mainGroupName && p.subGroupName === priv.subGroupName).length}>
                            {priv.subGroupName}
                          </td>
                        ) : null}
                        <td className="ra-menu-name">{priv.menuName}</td>
                        <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canView} disabled={!isRoleEditable}
                          onChange={(e) => updatePrivilege(priv.menuId, 'canView', e.target.checked)} /></td>
                        <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canAdd} disabled={!priv.addOption || !isRoleEditable}
                          onChange={(e) => updatePrivilege(priv.menuId, 'canAdd', e.target.checked)} /></td>
                        <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canEdit} disabled={!priv.editOption || !isRoleEditable}
                          onChange={(e) => updatePrivilege(priv.menuId, 'canEdit', e.target.checked)} /></td>
                        <td><input type="checkbox" className="ra-priv-checkbox" checked={priv.canDelete} disabled={!priv.deleteOption || !isRoleEditable}
                          onChange={(e) => updatePrivilege(priv.menuId, 'canDelete', e.target.checked)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolePrivilegePage;