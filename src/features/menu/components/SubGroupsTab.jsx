import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import subGroupService from '../services/subGroupService';
import { REGISTRATION_ROUTES } from '../../registration/config/moduleRegistrationConfig';

function SubGroupsTab({ subGroups, fetchSubGroups, showSuccess, showErrorPopup }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subGroupName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!/^[A-Za-z\s]+$/.test(form.subGroupName)) {
        showErrorPopup('Sub Group name must contain only letters and spaces.');
        return;
      }
      const res = await subGroupService.add(form);
      showSuccess(res?.data?.message || 'Sub Group added successfully.', res?.data?.header || 'Success');
      setShowModal(false);
      setForm({ subGroupName: '' });
      fetchSubGroups();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Sub Groups</h2>
        <button className="btn-primary-action" onClick={() => navigate(REGISTRATION_ROUTES['sub-group'])}>
          + Add Sub Group
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th></tr></thead>
          <tbody>
            {subGroups.length === 0 ? (
              <tr><td className="empty-row">No Sub Groups found.</td></tr>
            ) : (
              subGroups.map((group) => (
                <tr key={group.subGroupId}>
                  <td>{group.subGroupName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Sub Group</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sub Group Name *</label>
                <input type="text" required value={form.subGroupName} onChange={(e) => setForm({ ...form, subGroupName: e.target.value })} placeholder="e.g. Reports" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubGroupsTab;
