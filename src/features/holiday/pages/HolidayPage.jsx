import React, { useState, useEffect, useCallback } from 'react';
import holidayService from '../services/holidayService';
import { useNotification } from '../../../context/NotificationContext';
import './HolidayPage.css';

function HolidayPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeOnly, setActiveOnly] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({
    holidayName: '',
    holidayDate: '',
    holidayType: 'NATIONAL',
    location: 'ALL',
    description: '',
    status: 'ACTIVE',
  });

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeOnly) {
        res = await holidayService.findAllActive();
      } else if (selectedYear) {
        res = await holidayService.findByYear(selectedYear);
      } else {
        res = await holidayService.findAll();
      }
      const list = res?.data?.responseOutput || res?.data || [];
      setHolidays(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, activeOnly, showErrorPopup]);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHoliday) {
        const res = await holidayService.update(selectedHoliday.holidayId, formData);
        showSuccess(res?.data?.message || 'Holiday updated successfully.');
      } else {
        const res = await holidayService.save(formData);
        showSuccess(res?.data?.message || 'Holiday saved successfully.');
      }
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleEdit = (h) => {
    setSelectedHoliday(h);
    setFormData({
      holidayName: h.holidayName || '',
      holidayDate: h.holidayDate || '',
      holidayType: h.holidayType || 'NATIONAL',
      location: h.location || 'ALL',
      description: h.description || '',
      status: h.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete holiday ${name}?`)) return;
    try {
      const res = await holidayService.delete(id);
      showSuccess(res?.data?.message || 'Holiday deleted.');
      loadHolidays();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  return (
    <div className="holiday-page">
      <div className="holiday-header">
        <h1>Holiday Calendar Management</h1>
        <button
          className="btn-primary-action"
          onClick={() => {
            setSelectedHoliday(null);
            setFormData({
              holidayName: '',
              holidayDate: new Date().toISOString().split('T')[0],
              holidayType: 'NATIONAL',
              location: 'ALL',
              description: '',
              status: 'ACTIVE',
            });
            setShowModal(true);
          }}
        >
          + Add New Holiday
        </button>
      </div>

      <div className="holiday-toolbar">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ fontWeight: 600 }}>Year Filter:</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            style={{ padding: '6px 12px', width: '100px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="activeOnly"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            <label htmlFor="activeOnly" style={{ fontSize: '0.85rem' }}>Active Only</label>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading holiday calendar...</p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Location Scope</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textCenter: 'center', padding: '24px' }}>
                    No holidays listed for this selection.
                  </td>
                </tr>
              ) : (
                holidays.map((h) => (
                  <tr key={h.holidayId}>
                    <td><strong>{h.holidayName}</strong></td>
                    <td>{h.holidayDate}</td>
                    <td>
                      <span className={`badge badge-${h.holidayType}`}>
                        {h.holidayType}
                      </span>
                    </td>
                    <td>{h.location || 'ALL'}</td>
                    <td>{h.description || '—'}</td>
                    <td>
                      <span className={`badge ${h.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEdit(h)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(h.holidayId, h.holidayName)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Holiday Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedHoliday ? 'Edit Holiday' : 'Add Holiday'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Holiday Name *</label>
                <input
                  type="text"
                  required
                  value={formData.holidayName}
                  onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
                  placeholder="e.g. Independence Day"
                />
              </div>
              <div className="form-group">
                <label>Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={formData.holidayDate}
                  onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Holiday Type *</label>
                  <select
                    value={formData.holidayType}
                    onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                  >
                    <option value="NATIONAL">NATIONAL</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                    <option value="OPTIONAL">OPTIONAL</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location Scope</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. ALL or Chennai"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HolidayPage;
