import React, { useState, useEffect, useCallback } from 'react';
import documentService from '../services/documentService';
import { useNotification } from '../../../context/NotificationContext';
import './DocumentManagementPage.css';

function DocumentManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterEmpId, setFilterEmpId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: 'ID_PROOF',
    documentName: '',
    documentNumber: '',
    filePath: '',
    issuedDate: '',
    expiryDate: '',
    status: 'ACTIVE',
  });

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = filterEmpId
        ? await documentService.findByEmployee(filterEmpId)
        : await documentService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setDocuments(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [filterEmpId, showErrorPopup]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employeeId: parseInt(formData.employeeId, 10),
      };

      if (selectedDoc) {
        const res = await documentService.update(selectedDoc.documentId, payload);
        showSuccess(res?.data?.message || 'Document details updated.');
      } else {
        const res = await documentService.save(payload);
        showSuccess(res?.data?.message || 'Document uploaded and logged.');
      }
      setShowModal(false);
      loadDocuments();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleVerify = async (docId) => {
    try {
      const res = await documentService.verify(docId);
      showSuccess(res?.data?.message || 'Document status set to VERIFIED.');
      loadDocuments();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete document record ${name}?`)) return;
    try {
      const res = await documentService.delete(id);
      showSuccess(res?.data?.message || 'Document record deleted.');
      loadDocuments();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.employeeId?.toString().includes(searchTerm)
  );

  return (
    <div className="document-page">
      <div className="document-header">
        <h1>Employee Document Vault</h1>
        <button
          className="btn-primary-action"
          onClick={() => {
            setSelectedDoc(null);
            setFormData({
              employeeId: '',
              documentType: 'ID_PROOF',
              documentName: '',
              documentNumber: '',
              filePath: '',
              issuedDate: '',
              expiryDate: '',
              status: 'ACTIVE',
            });
            setShowModal(true);
          }}
        >
          + Add Document Record
        </button>
      </div>

      <div className="document-toolbar">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            className="org-search-input"
            placeholder="Search document name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Employee ID:</label>
            <input
              type="number"
              placeholder="Employee ID"
              value={filterEmpId}
              onChange={(e) => setFilterEmpId(e.target.value)}
              style={{ padding: '6px 10px', width: '130px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading document records...</p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Type</th>
                <th>Document Name</th>
                <th>Number / Ref</th>
                <th>Verification</th>
                <th>Issued / Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textCenter: 'center', padding: '24px' }}>
                    No document records found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((d) => (
                  <tr key={d.documentId}>
                    <td>#{d.documentId}</td>
                    <td><strong>Emp #{d.employeeId}</strong></td>
                    <td>{d.documentType}</td>
                    <td>{d.documentName}</td>
                    <td>{d.documentNumber || '—'}</td>
                    <td>
                      <span className={`badge ${d.verified ? 'badge-verified' : 'badge-unverified'}`}>
                        {d.verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td>{d.issuedDate || '—'} / {d.expiryDate || '—'}</td>
                    <td>
                      <span className={`badge ${d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {!d.verified && (
                          <button className="btn-verify" onClick={() => handleVerify(d.documentId)}>Verify</button>
                        )}
                        <button className="btn-edit" onClick={() => {
                          setSelectedDoc(d);
                          setFormData({
                            employeeId: d.employeeId || '',
                            documentType: d.documentType || 'ID_PROOF',
                            documentName: d.documentName || '',
                            documentNumber: d.documentNumber || '',
                            filePath: d.filePath || '',
                            issuedDate: d.issuedDate || '',
                            expiryDate: d.expiryDate || '',
                            status: d.status || 'ACTIVE',
                          });
                          setShowModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(d.documentId, d.documentName)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedDoc ? 'Edit Document Record' : 'Upload Document Record'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                >
                  <option value="ID_PROOF">ID_PROOF</option>
                  <option value="ADDRESS_PROOF">ADDRESS_PROOF</option>
                  <option value="OFFER_LETTER">OFFER_LETTER</option>
                  <option value="APPOINTMENT_LETTER">APPOINTMENT_LETTER</option>
                  <option value="PAN_CARD">PAN_CARD</option>
                  <option value="AADHAR_CARD">AADHAR_CARD</option>
                  <option value="PASSPORT">PASSPORT</option>
                  <option value="RESUME">RESUME</option>
                  <option value="EDUCATIONAL_CERTIFICATE">EDUCATIONAL_CERTIFICATE</option>
                  <option value="RELIEVING_LETTER">RELIEVING_LETTER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="form-group">
                <label>Document Name *</label>
                <input
                  type="text"
                  required
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  placeholder="e.g. Passport Front & Back Scan"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Document Number / Reference</label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="e.g. Z1234567"
                  />
                </div>
                <div className="form-group">
                  <label>File Path / Storage Key</label>
                  <input
                    type="text"
                    value={formData.filePath}
                    onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                    placeholder="/uploads/docs/passport.pdf"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Issued Date</label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
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
                <button type="submit" className="btn-primary-action">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentManagementPage;
