import React, { useState } from 'react';
import menuService from '../services/menuService';
import MenuItemModal from './MenuItemModal';

function MenuItemsTab({ menuItems, mainGroups, subGroups, fetchMenuItems, showSuccess, showErrorPopup }) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ menuName: '', componentPath: '', mainGroupId: '', subGroupId: '', addOption: 'YES', editOption: 'YES', deleteOption: 'YES', isPrivilege: 'NO' });
  const [filterMainGroup, setFilterMainGroup] = useState('');
  const [draggedRow, setDraggedRow] = useState(null);

  const getFiltered = () => {
    if (!filterMainGroup) return menuItems;
    return menuItems.filter(item => String(item.mainGroupId) === String(filterMainGroup));
  };

  const getMainGroupName = (id) => { const g = mainGroups.find(gr => gr.mainGroupId === id); return g ? g.mainGroupName : '-'; };
  const getSubGroupName = (id) => { if (!id) return '-'; const g = subGroups.find(gr => gr.subGroupId === id); return g ? g.subGroupName : '-'; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!/^[A-Za-z\s]+$/.test(form.menuName)) { showErrorPopup('Menu name must contain only letters and spaces.'); return; }
      const payload = { ...form, mainGroupId: parseInt(form.mainGroupId, 10), subGroupId: form.subGroupId ? parseInt(form.subGroupId, 10) : null };
      if (editingItem) {
        const res = await menuService.update(editingItem.menuNameId, payload);
        showSuccess(res?.data?.message || 'Menu Item updated successfully.');
      } else {
        const res = await menuService.add(payload);
        showSuccess(res?.data?.message || 'Menu Item added successfully.');
      }
      setShowModal(false);
      setEditingItem(null);
      setForm({ menuName: '', componentPath: '', mainGroupId: '', subGroupId: '', addOption: 'YES', editOption: 'YES', deleteOption: 'YES', isPrivilege: 'NO' });
      fetchMenuItems();
    } catch (err) { showErrorPopup(err); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ menuName: item.menuName || '', componentPath: item.componentPath || '', mainGroupId: String(item.mainGroupId || ''), subGroupId: item.subGroupId ? String(item.subGroupId) : '', addOption: item.addOption || 'YES', editOption: item.editOption || 'YES', deleteOption: item.deleteOption || 'YES', isPrivilege: item.isPrivilege || 'NO' });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Menu Item "${name}"?`)) return;
    try { const res = await menuService.delete(id); showSuccess(res?.data?.message || 'Menu Item deleted.'); fetchMenuItems(); }
    catch (err) { showErrorPopup(err); }
  };

  const handleDragStart = (e, index) => { setDraggedRow(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedRow === null || draggedRow === dropIndex) return;
    const filtered = getFiltered();
    if (filtered.length === 0) return;
    const draggedItem = filtered[draggedRow];
    const dropItem = filtered[dropIndex];
    if (draggedItem.mainGroupId !== dropItem.mainGroupId) { showErrorPopup('Cannot reorder across different Main Groups.'); setDraggedRow(null); return; }
    const sameGroup = filtered.filter(i => i.mainGroupId === draggedItem.mainGroupId);
    const [moved] = sameGroup.splice(draggedRow, 1);
    sameGroup.splice(dropIndex, 0, moved);
    const reordered = sameGroup.map((item, idx) => ({ menuNameId: item.menuNameId, hierarchyId: idx + 1 }));
    setDraggedRow(null);
    try { const res = await menuService.reorder(draggedItem.mainGroupId, reordered); showSuccess(res?.data?.message || 'Menu Items reordered.'); fetchMenuItems(); }
    catch (err) { showErrorPopup(err); fetchMenuItems(); }
  };

  const filteredItems = getFiltered();

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Menu Items</h2>
        <div className="header-controls">
          <select value={filterMainGroup} onChange={(e) => setFilterMainGroup(e.target.value)} className="filter-select">
            <option value="">All Main Groups</option>
            {mainGroups.map(g => <option key={g.mainGroupId} value={g.mainGroupId}>{g.mainGroupName}</option>)}
          </select>
          <button className="btn-primary-action" onClick={() => { setEditingItem(null); setForm({ menuName: '', componentPath: '', mainGroupId: '', subGroupId: '', addOption: 'YES', editOption: 'YES', deleteOption: 'YES', isPrivilege: 'NO' }); setShowModal(true); }}>+ Add Menu Item</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Path</th><th>Main Group</th><th>Sub Group</th><th>Permissions</th><th>Priv</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No Menu Items found.</td></tr>
            ) : filteredItems.map((item, index) => (
              <tr key={item.menuNameId} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className="draggable-row">
                <td>{item.menuName}</td>
                <td><code>{item.componentPath}</code></td>
                <td>{getMainGroupName(item.mainGroupId)}</td>
                <td>{getSubGroupName(item.subGroupId)}</td>
                <td>
                  <div className="permission-badges">
                    <span className={`badge ${item.addOption === 'YES' ? 'badge-yes' : 'badge-no'}`}>A:{item.addOption}</span>
                    <span className={`badge ${item.editOption === 'YES' ? 'badge-yes' : 'badge-no'}`}>E:{item.editOption}</span>
                    <span className={`badge ${item.deleteOption === 'YES' ? 'badge-yes' : 'badge-no'}`}>D:{item.deleteOption}</span>
                  </div>
                </td>
                <td><span className={`badge ${item.isPrivilege === 'YES' ? 'badge-yes' : 'badge-no'}`}>{item.isPrivilege}</span></td>
                <td className="actions-cell">
                  <button className="btn-icon-btn btn-edit" onClick={() => handleEdit(item)} title="Edit">&#9998;</button>
                  <button className="btn-icon-btn btn-delete" onClick={() => handleDelete(item.menuNameId, item.menuName)} title="Delete">&#128465;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <MenuItemModal editingItem={editingItem} form={form} setForm={setForm} mainGroups={mainGroups} subGroups={subGroups} onSubmit={handleSubmit} onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default MenuItemsTab;
