import React, { useState, useEffect, useCallback } from 'react';
import assetService from '../services/assetService';
import { useNotification } from '../../../context/NotificationContext';
import './AssetManagementPage.css';

function AssetManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'available'
  const [searchTerm, setSearchTerm] = useState('');

  // Asset Form Modal (Add / Edit)
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({
    assetCode: '',
    assetName: '',
    assetType: 'LAPTOP',
    serialNumber: '',
    assetCondition: 'NEW',
    status: 'AVAILABLE',
    remarks: '',
  });

  // Issue Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueAssetId, setIssueAssetId] = useState(null);
  const [issueEmployeeId, setIssueEmployeeId] = useState('');

  // Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnAssetId, setReturnAssetId] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnRemarks, setReturnRemarks] = useState('');

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = filterMode === 'available'
        ? await assetService.findAvailable()
        : await assetService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setAssets(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [filterMode, showErrorPopup]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAsset) {
        const res = await assetService.update(selectedAsset.assetId, assetForm);
        showSuccess(res?.data?.message || 'Asset details updated.');
      } else {
        const res = await assetService.save(assetForm);
        showSuccess(res?.data?.message || 'New asset registered.');
      }
      setShowAssetModal(false);
      loadAssets();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueAssetId || !issueEmployeeId) return;
    try {
      const res = await assetService.issueTo(issueAssetId, parseInt(issueEmployeeId, 10));
      showSuccess(res?.data?.message || `Asset #${issueAssetId} issued to Employee #${issueEmployeeId}`);
      setShowIssueModal(false);
      loadAssets();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnAssetId) return;
    try {
      const res = await assetService.returnAsset(returnAssetId, returnCondition, returnRemarks);
      showSuccess(res?.data?.message || `Asset #${returnAssetId} checked back into inventory.`);
      setShowReturnModal(false);
      loadAssets();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete asset ${name}?`)) return;
    try {
      const res = await assetService.delete(id);
      showSuccess(res?.data?.message || 'Asset record deleted.');
      loadAssets();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="asset-page">
      <div className="asset-header">
        <h1>Company Asset Management</h1>
        <button
          className="btn-primary-action"
          onClick={() => {
            setSelectedAsset(null);
            setAssetForm({
              assetCode: '',
              assetName: '',
              assetType: 'LAPTOP',
              serialNumber: '',
              assetCondition: 'NEW',
              status: 'AVAILABLE',
              remarks: '',
            });
            setShowAssetModal(true);
          }}
        >
          + Register New Asset
        </button>
      </div>

      <div className="asset-toolbar">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="org-search-input"
            placeholder="Search asset name, code, serial #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`btn-secondary ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All Inventory
          </button>
          <button
            className={`btn-secondary ${filterMode === 'available' ? 'active' : ''}`}
            onClick={() => setFilterMode('available')}
          >
            In Stock (Available)
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading asset inventory...</p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Assigned To</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textCenter: 'center', padding: '24px' }}>
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => (
                  <tr key={a.assetId}>
                    <td><strong>{a.assetCode}</strong></td>
                    <td>{a.assetName}</td>
                    <td>{a.assetType}</td>
                    <td>{a.serialNumber || '—'}</td>
                    <td>{a.issuedToEmployeeId ? <strong>Emp #{a.issuedToEmployeeId}</strong> : 'Unassigned (In Stock)'}</td>
                    <td>{a.assetCondition || 'GOOD'}</td>
                    <td>
                      <span className={`badge badge-${a.status}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {a.status === 'AVAILABLE' && (
                          <button className="btn-issue" onClick={() => {
                            setIssueAssetId(a.assetId);
                            setIssueEmployeeId('');
                            setShowIssueModal(true);
                          }}>Issue</button>
                        )}
                        {a.status === 'ISSUED' && (
                          <button className="btn-return" onClick={() => {
                            setReturnAssetId(a.assetId);
                            setReturnCondition('GOOD');
                            setReturnRemarks('');
                            setShowReturnModal(true);
                          }}>Return</button>
                        )}
                        <button className="btn-edit" onClick={() => {
                          setSelectedAsset(a);
                          setAssetForm({
                            assetCode: a.assetCode || '',
                            assetName: a.assetName || '',
                            assetType: a.assetType || 'LAPTOP',
                            serialNumber: a.serialNumber || '',
                            assetCondition: a.assetCondition || 'NEW',
                            status: a.status || 'AVAILABLE',
                            remarks: a.remarks || '',
                          });
                          setShowAssetModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(a.assetId, a.assetName)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Form Modal */}
      {showAssetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedAsset ? 'Edit Asset' : 'Register Asset'}</h2>
              <button className="close-btn" onClick={() => setShowAssetModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssetSubmit}>
              <div className="form-group">
                <label>Asset Code *</label>
                <input
                  type="text"
                  required
                  value={assetForm.assetCode}
                  onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                  placeholder="e.g. AST-LAP-001"
                />
              </div>
              <div className="form-group">
                <label>Asset Name *</label>
                <input
                  type="text"
                  required
                  value={assetForm.assetName}
                  onChange={(e) => setAssetForm({ ...assetForm, assetName: e.target.value })}
                  placeholder="e.g. MacBook Pro M3 16-inch"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Asset Type *</label>
                  <select
                    value={assetForm.assetType}
                    onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value })}
                  >
                    <option value="LAPTOP">LAPTOP</option>
                    <option value="DESKTOP">DESKTOP</option>
                    <option value="MOBILE">MOBILE</option>
                    <option value="MONITOR">MONITOR</option>
                    <option value="ID_CARD">ID_CARD</option>
                    <option value="ACCESSORY">ACCESSORY</option>
                    <option value="FURNITURE">FURNITURE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    value={assetForm.serialNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Asset Condition</label>
                  <select
                    value={assetForm.assetCondition}
                    onChange={(e) => setAssetForm({ ...assetForm, assetCondition: e.target.value })}
                  >
                    <option value="NEW">NEW</option>
                    <option value="GOOD">GOOD</option>
                    <option value="DAMAGED">DAMAGED</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={assetForm.status}
                    onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ISSUED">ISSUED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="DAMAGED">DAMAGED</option>
                    <option value="LOST">LOST</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input
                  type="text"
                  value={assetForm.remarks}
                  onChange={(e) => setAssetForm({ ...assetForm, remarks: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssetModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Asset Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Issue Asset to Employee</h2>
              <button className="close-btn" onClick={() => setShowIssueModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleIssueSubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  placeholder="Enter Employee ID..."
                  value={issueEmployeeId}
                  onChange={(e) => setIssueEmployeeId(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Confirm Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Return Asset to Stock</h2>
              <button className="close-btn" onClick={() => setShowReturnModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="form-group">
                <label>Returned Condition *</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  <option value="GOOD">GOOD</option>
                  <option value="NEW">NEW</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
              <div className="form-group">
                <label>Return Remarks</label>
                <input
                  type="text"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="e.g. Scratches on back cover"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetManagementPage;
