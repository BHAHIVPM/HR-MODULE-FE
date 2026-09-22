import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useNotification } from '../../../context/NotificationContext';
import useCurrentUser from '../../../hooks/useCurrentUser';
import './UserManagementPage.css';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();
  const { showSuccess, showErrorPopup } = useNotification();
  // Self-edit protection: resolves the logged-in user's identity so that
  // identity/access fields of the CURRENT user cannot be changed by himself.
  const { isSelfId } = useCurrentUser();

  // True when the record being edited in the modal belongs to the logged-in user.
  const editingIsSelf = editingUser ? isSelfId(editingUser.userId) : false;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.findAll();
      const list = response?.data?.responseOutput || response?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [showErrorPopup]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  const handleDelete = async (userId, name) => {
    // Self-protection: a user may never delete their own login account.
    if (isSelfId(userId)) {
      showErrorPopup({
        title: 'Not Allowed',
        message: 'You cannot delete your own login account.',
      });
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete user ${name || userId}?`);
    if (!confirm) return;

    try {
      const res = await userService.delete(userId);
      showSuccess(res?.data?.message || 'User deleted successfully.', res?.data?.header || 'Deleted');
      loadUsers();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      userId: user.userId,
      name: user.name || '',
      userMail: user.userMail || '',
      mobileNo: user.mobileNo || '',
      userType: user.userType || 'USER',
      status: user.status || 'ACTIVE',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    // Self-edit protection: for the logged-in user's own account the userType
    // and status are always sent back unchanged, even if the form state was
    // manipulated. Nobody (admin/superadmin/employee) can change their own
    // user type or status - only another (higher) user can.
    const payload = editingIsSelf
      ? { ...editFormData, userType: editingUser.userType, status: editingUser.status }
      : editFormData;
    try {
      const res = await userService.update(editingUser.userId, payload);
      showSuccess(res?.data?.message || 'User updated successfully.', res?.data?.header || 'Updated');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  return (
    <div className="user-page-container">
      <div className="user-page-header">
        <div className="user-page-title-group">
          <h1>User Data Directory</h1>
          <p>View and manage all registered portal login accounts in the database</p>
        </div>
        <button
          type="button"
          className="btn-add-user"
          onClick={() => navigate('/registrations/user')}
        >
          + Add New User
        </button>
      </div>

      <div className="user-table-card">
        <div className="user-table-header">
          <span className="title">Active & Portal Users</span>
          <span className="count-badge">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            Loading user records…
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            No user records found in the database.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Login ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Mobile Number</th>
                  <th>User Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.tableId || user.userId}>
                    <td>
                      <span className="user-id-badge">{user.userId}</span>
                      {isSelfId(user.userId) && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#38bdf8',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          (You)
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#f8fafc' }}>{user.name}</strong>
                    </td>
                    <td>{user.userMail}</td>
                    <td>{user.mobileNo}</td>
                    <td>
                      <span className={`role-badge ${(user.userType || 'user').toLowerCase()}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: user.status === 'ACTIVE' ? '#34d399' : '#f87171',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        ● {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="btn-user-action"
                          onClick={() => openEditModal(user)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-user-action danger"
                          onClick={() => handleDelete(user.userId, user.name)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="edit-user-modal">
          <div className="edit-user-modal-content">
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>
              Edit User (ID: {editingUser.userId})
            </h3>
            {editingIsSelf && (
              <p
                style={{
                  margin: '-4px 0 14px 0',
                  padding: '8px 10px',
                  fontSize: 13,
                  color: '#fbbf24',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  borderRadius: 6,
                }}
              >
                🔒 Self-edit protection: you cannot change your own User Role or Status.
              </p>
            )}
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editFormData.userMail}
                  onChange={(e) => setEditFormData({ ...editFormData, userMail: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  maxLength="10"
                  value={editFormData.mobileNo}
                  onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>User Role</label>
                <select
                  value={editFormData.userType}
                  onChange={(e) => setEditFormData({ ...editFormData, userType: e.target.value })}
                  disabled={editingIsSelf}
                  style={editingIsSelf ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="USER">USER</option>
                </select>
                {editingIsSelf && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
                    Your own user role cannot be changed from this account.
                  </span>
                )}
              </div>

              <div className="modal-form-group">
                <label>Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  disabled={editingIsSelf}
                  style={editingIsSelf ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                {editingIsSelf && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#94a3b8' }}>
                    Your own account status cannot be changed from this account.
                  </span>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-user-action"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-user"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
