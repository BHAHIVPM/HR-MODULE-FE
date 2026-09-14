import React from 'react';

function MenuItemModal({ editingItem, form, setForm, mainGroups, subGroups, onSubmit, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Menu Name *</label><input type="text" required value={form.menuName} onChange={(e) => setForm({ ...form, menuName: e.target.value })} placeholder="e.g. Employee List" /></div>
            <div className="form-group"><label>Component Path *</label><input type="text" required value={form.componentPath} onChange={(e) => setForm({ ...form, componentPath: e.target.value })} placeholder="e.g. /employee/list" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Main Group *</label><select required value={form.mainGroupId} onChange={(e) => setForm({ ...form, mainGroupId: e.target.value })}><option value="">Select Main Group</option>{mainGroups.map(g => <option key={g.mainGroupId} value={g.mainGroupId}>{g.mainGroupName}</option>)}</select></div>
            <div className="form-group"><label>Sub Group</label><select value={form.subGroupId} onChange={(e) => setForm({ ...form, subGroupId: e.target.value })}><option value="">None</option>{subGroups.map(g => <option key={g.subGroupId} value={g.subGroupId}>{g.subGroupName}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Add Option</label><div className="radio-group"><label className="radio-label"><input type="radio" name="addOption" value="YES" checked={form.addOption === 'YES'} onChange={(e) => setForm({ ...form, addOption: e.target.value })} />YES</label><label className="radio-label"><input type="radio" name="addOption" value="NO" checked={form.addOption === 'NO'} onChange={(e) => setForm({ ...form, addOption: e.target.value })} />NO</label></div></div>
            <div className="form-group"><label>Edit Option</label><div className="radio-group"><label className="radio-label"><input type="radio" name="editOption" value="YES" checked={form.editOption === 'YES'} onChange={(e) => setForm({ ...form, editOption: e.target.value })} />YES</label><label className="radio-label"><input type="radio" name="editOption" value="NO" checked={form.editOption === 'NO'} onChange={(e) => setForm({ ...form, editOption: e.target.value })} />NO</label></div></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Delete Option</label><div className="radio-group"><label className="radio-label"><input type="radio" name="deleteOption" value="YES" checked={form.deleteOption === 'YES'} onChange={(e) => setForm({ ...form, deleteOption: e.target.value })} />YES</label><label className="radio-label"><input type="radio" name="deleteOption" value="NO" checked={form.deleteOption === 'NO'} onChange={(e) => setForm({ ...form, deleteOption: e.target.value })} />NO</label></div></div>
            <div className="form-group"><label>Is Privilege</label><div className="radio-group"><label className="radio-label"><input type="radio" name="isPrivilege" value="YES" checked={form.isPrivilege === 'YES'} onChange={(e) => setForm({ ...form, isPrivilege: e.target.value })} />YES</label><label className="radio-label"><input type="radio" name="isPrivilege" value="NO" checked={form.isPrivilege === 'NO'} onChange={(e) => setForm({ ...form, isPrivilege: e.target.value })} />NO</label></div></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary-action">{editingItem ? 'Update' : 'Save'}</button></div>
        </form>
      </div>
    </div>
  );
}

export default MenuItemModal;
