import React, { useState } from 'react';
import mainGroupService from '../services/mainGroupService';

function MainGroupsTab({ mainGroups, setMainGroups, fetchMainGroups, showSuccess, showErrorPopup }) {
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({ mainGroupName: '', iconPath: '' });
  const [draggedRow, setDraggedRow] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!/^[A-Za-z\s]+$/.test(form.mainGroupName)) {
        showErrorPopup('Main Group name must contain only letters and spaces.');
        return;
      }
      if (editingGroup) {
        const res = await mainGroupService.update(editingGroup.mainGroupId, form);
        showSuccess(res?.data?.message || 'Main Group updated successfully.');
      } else {
        const res = await mainGroupService.add(form);
        showSuccess(res?.data?.message || 'Main Group added successfully.');
      }
      setShowModal(false);
      setEditingGroup(null);
      setForm({ mainGroupName: '', iconPath: '' });
      fetchMainGroups();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setForm({ mainGroupName: group.mainGroupName || '', iconPath: group.iconPath || '' });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Main Group "${name}"? This may affect associated menu items.`)) return;
    try {
      const res = await mainGroupService.delete(id);
      showSuccess(res?.data?.message || 'Main Group deleted successfully.');
      fetchMainGroups();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedRow(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedRow === null || draggedRow === dropIndex) return;
    const updated = [...mainGroups];
    const [draggedItem] = updated.splice(draggedRow, 1);
    updated.splice(dropIndex, 0, draggedItem);
    const reordered = updated.map((group, idx) => ({
      mainGroupId: group.mainGroupId,
      hierarchyId: idx + 1,
    }));
    setMainGroups(updated.map((g, idx) => ({ ...g, hierarchyId: idx + 1 })));
    setDraggedRow(null);
    try {
      const res = await mainGroupService.reorder(reordered);
      showSuccess(res?.data?.message || 'Main Groups reordered successfully.');
    } catch (err) {
      showErrorPopup(err);
      fetchMainGroups();
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Main Groups</h2>
        <button className="btn-primary-action" onClick={() => { setEditingGroup(null); setForm({ mainGroupName: '', iconPath: '' }); setShowModal(true); }}>
          + Add Main Group
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr><th>Order</th><th>Icon</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {mainGroups.length === 0 ? (
              <tr><td colSpan="4" className="empty-row">No Main Groups found.</td></tr>
            ) : (
              mainGroups.map((group, index) => (
                <tr key={group.mainGroupId} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className="draggable-row">
                  <td className="order-cell">{group.hierarchyId || index + 1}</td>
                  <td className="icon-cell">{group.iconPath ? <i className={group.iconPath} style={{ fontSize: '16px' }}></i> : <span className="no-icon">-</span>}</td>
                  <td>{group.mainGroupName}</td>
                  <td className="actions-cell">
                    <button className="btn-icon-btn btn-edit" onClick={() => handleEdit(group)} title="Edit">&#9998;</button>
                    <button className="btn-icon-btn btn-delete" onClick={() => handleDelete(group.mainGroupId, group.mainGroupName)} title="Delete">&#128465;</button>
                  </td>
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
              <h2>{editingGroup ? 'Edit Main Group' : 'Add Main Group'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Main Group Name *</label>
                <input type="text" required value={form.mainGroupName} onChange={(e) => setForm({ ...form, mainGroupName: e.target.value })} placeholder="e.g. Dashboard" />
              </div>
              <div className="form-group">
                <label>Icon Path</label>
                <input type="text" value={form.iconPath} onChange={(e) => setForm({ ...form, iconPath: e.target.value })} placeholder="e.g. fa fa-home" />
                {form.iconPath && <div className="icon-preview"><span>Preview: </span><i className={form.iconPath}></i></div>}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">{editingGroup ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainGroupsTab;
