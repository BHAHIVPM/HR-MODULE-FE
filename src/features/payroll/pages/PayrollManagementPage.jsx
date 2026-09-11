import React, { useState, useEffect, useCallback } from 'react';
import salaryService from '../services/salaryService';
import payrollService from '../services/payrollService';
import bankDetailsService from '../services/bankDetailsService';
import { useNotification } from '../../../context/NotificationContext';
import './PayrollManagementPage.css';

function PayrollManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' | 'salary' | 'bank'

  const [payrolls, setPayrolls] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [bankDetailsList, setBankDetailsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate Payroll Form
  const [genEmpId, setGenEmpId] = useState('');
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  // Salary Structure Modal
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    otherAllowance: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    otherDeductions: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  // Bank Details Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankForm, setBankForm] = useState({
    employeeId: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountType: 'SAVINGS',
    isPrimary: true,
    status: 'ACTIVE',
  });

  const fetchPayrolls = useCallback(async () => {
    try {
      const res = await payrollService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setPayrolls(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchSalaries = useCallback(async () => {
    try {
      const res = await salaryService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setSalaries(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchBankDetails = useCallback(async () => {
    try {
      const res = await bankDetailsService.findAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setBankDetailsList(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPayrolls(), fetchSalaries(), fetchBankDetails()]);
    setLoading(false);
  }, [fetchPayrolls, fetchSalaries, fetchBankDetails]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate Payroll Action
  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    if (!genEmpId) return;
    try {
      const res = await payrollService.generate(parseInt(genEmpId, 10), parseInt(genMonth, 10), parseInt(genYear, 10));
      showSuccess(res?.data?.message || `Payroll generated for Emp #${genEmpId}`);
      setGenEmpId('');
      fetchPayrolls();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Mark Payroll as Paid
  const handleMarkPaid = async (payrollId) => {
    try {
      const res = await payrollService.markPaid(payrollId);
      showSuccess(res?.data?.message || 'Payroll marked as PAID.');
      fetchPayrolls();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Cancel Payroll
  const handleCancelPayroll = async (payrollId) => {
    if (!window.confirm(`Cancel payroll #${payrollId}?`)) return;
    try {
      const res = await payrollService.cancel(payrollId);
      showSuccess(res?.data?.message || 'Payroll cancelled.');
      fetchPayrolls();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Salary Form Submit
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...salaryForm,
        employeeId: parseInt(salaryForm.employeeId, 10),
        basicSalary: parseFloat(salaryForm.basicSalary || 0),
        hra: parseFloat(salaryForm.hra || 0),
        conveyanceAllowance: parseFloat(salaryForm.conveyanceAllowance || 0),
        medicalAllowance: parseFloat(salaryForm.medicalAllowance || 0),
        specialAllowance: parseFloat(salaryForm.specialAllowance || 0),
        otherAllowance: parseFloat(salaryForm.otherAllowance || 0),
        providentFund: parseFloat(salaryForm.providentFund || 0),
        professionalTax: parseFloat(salaryForm.professionalTax || 0),
        incomeTax: parseFloat(salaryForm.incomeTax || 0),
        otherDeductions: parseFloat(salaryForm.otherDeductions || 0),
      };

      if (selectedSalary) {
        const res = await salaryService.update(selectedSalary.salaryId, payload);
        showSuccess(res?.data?.message || 'Salary structure updated.');
      } else {
        const res = await salaryService.save(payload);
        showSuccess(res?.data?.message || 'Salary structure saved.');
      }
      setShowSalaryModal(false);
      fetchSalaries();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  // Bank Details Form Submit
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bankForm,
        employeeId: parseInt(bankForm.employeeId, 10),
      };

      if (selectedBank) {
        const res = await bankDetailsService.update(selectedBank.bankDetailId, payload);
        showSuccess(res?.data?.message || 'Bank details updated.');
      } else {
        const res = await bankDetailsService.save(payload);
        showSuccess(res?.data?.message || 'Bank details saved.');
      }
      setShowBankModal(false);
      fetchBankDetails();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (!window.confirm(`Delete salary structure #${id}?`)) return;
    try {
      const res = await salaryService.delete(id);
      showSuccess(res?.data?.message || 'Salary structure deleted.');
      fetchSalaries();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm(`Delete bank account #${id}?`)) return;
    try {
      const res = await bankDetailsService.delete(id);
      showSuccess(res?.data?.message || 'Bank details deleted.');
      fetchBankDetails();
    } catch (err) {
      showErrorPopup(err);
    }
  };

  return (
    <div className="payroll-page">
      <div className="payroll-header">
        <h1>Payroll & Compensation Management</h1>
      </div>

      <div className="payroll-tabs">
        <button
          className={`payroll-tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          Payroll Transactions ({payrolls.length})
        </button>
        <button
          className={`payroll-tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          Salary Structures ({salaries.length})
        </button>
        <button
          className={`payroll-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          Bank Details ({bankDetailsList.length})
        </button>
      </div>

      {activeTab === 'payroll' && (
        <div className="generate-payroll-card">
          <h3>Compute & Generate Monthly Payslip</h3>
          <form className="generate-form" onSubmit={handleGeneratePayroll}>
            <input
              type="number"
              required
              placeholder="Employee ID..."
              value={genEmpId}
              onChange={(e) => setGenEmpId(e.target.value)}
            />
            <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
            <input
              type="number"
              value={genYear}
              onChange={(e) => setGenYear(e.target.value)}
              style={{ width: '100px' }}
            />
            <button type="submit" className="btn-primary-action">
              Generate Payslip
            </button>
          </form>
        </div>
      )}

      <div className="payroll-toolbar">
        {activeTab === 'salary' && (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedSalary(null);
              setSalaryForm({
                employeeId: '',
                basicSalary: 30000,
                hra: 12000,
                conveyanceAllowance: 2000,
                medicalAllowance: 1500,
                specialAllowance: 5000,
                otherAllowance: 0,
                providentFund: 3600,
                professionalTax: 200,
                incomeTax: 1000,
                otherDeductions: 0,
                effectiveFrom: new Date().toISOString().split('T')[0],
                status: 'ACTIVE',
              });
              setShowSalaryModal(true);
            }}
          >
            + Create Salary Structure
          </button>
        )}
        {activeTab === 'bank' && (
          <button
            className="btn-primary-action"
            onClick={() => {
              setSelectedBank(null);
              setBankForm({
                employeeId: '',
                bankName: '',
                branchName: '',
                accountNumber: '',
                ifscCode: '',
                accountHolderName: '',
                accountType: 'SAVINGS',
                isPrimary: true,
                status: 'ACTIVE',
              });
              setShowBankModal(true);
            }}
          >
            + Add Bank Account
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading compensation data...</p>
      ) : activeTab === 'payroll' ? (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Period</th>
                <th>Work/Present/LOP</th>
                <th>Gross Earnings</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textCenter: 'center', padding: '24px' }}>
                    No payroll transactions generated yet.
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p.payrollId}>
                    <td>#{p.payrollId}</td>
                    <td><strong>Emp #{p.employeeId}</strong></td>
                    <td>{p.payrollMonth}/{p.payrollYear}</td>
                    <td>{p.workingDays || 0} / {p.presentDays || 0} / {p.lopDays || 0} LOP</td>
                    <td>₹{p.grossEarnings || '0.00'}</td>
                    <td>₹{p.totalDeductions || '0.00'}</td>
                    <td><strong>₹{p.netPay || '0.00'}</strong></td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {p.status === 'GENERATED' && (
                          <button className="btn-mark-paid" onClick={() => handleMarkPaid(p.payrollId)}>Mark Paid</button>
                        )}
                        {p.status !== 'CANCELLED' && (
                          <button className="btn-delete" onClick={() => handleCancelPayroll(p.payrollId)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'salary' ? (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Salary ID</th>
                <th>Employee ID</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textCenter: 'center', padding: '24px' }}>
                    No salary structures configured.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s.salaryId}>
                    <td>#{s.salaryId}</td>
                    <td><strong>Emp #{s.employeeId}</strong></td>
                    <td>₹{s.basicSalary}</td>
                    <td>₹{s.hra}</td>
                    <td>₹{(s.conveyanceAllowance || 0) + (s.medicalAllowance || 0) + (s.specialAllowance || 0) + (s.otherAllowance || 0)}</td>
                    <td><strong>₹{s.grossSalary || '0.00'}</strong></td>
                    <td><strong>₹{s.netSalary || '0.00'}</strong></td>
                    <td>{s.effectiveFrom}</td>
                    <td>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => {
                          setSelectedSalary(s);
                          setSalaryForm({
                            employeeId: s.employeeId || '',
                            basicSalary: s.basicSalary || 0,
                            hra: s.hra || 0,
                            conveyanceAllowance: s.conveyanceAllowance || 0,
                            medicalAllowance: s.medicalAllowance || 0,
                            specialAllowance: s.specialAllowance || 0,
                            otherAllowance: s.otherAllowance || 0,
                            providentFund: s.providentFund || 0,
                            professionalTax: s.professionalTax || 0,
                            incomeTax: s.incomeTax || 0,
                            otherDeductions: s.otherDeductions || 0,
                            effectiveFrom: s.effectiveFrom || '',
                            status: s.status || 'ACTIVE',
                          });
                          setShowSalaryModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteSalary(s.salaryId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Bank Name</th>
                <th>Account Number</th>
                <th>IFSC</th>
                <th>Account Holder</th>
                <th>Primary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankDetailsList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textCenter: 'center', padding: '24px' }}>
                    No bank details on file.
                  </td>
                </tr>
              ) : (
                bankDetailsList.map((b) => (
                  <tr key={b.bankDetailId}>
                    <td>#{b.bankDetailId}</td>
                    <td><strong>Emp #{b.employeeId}</strong></td>
                    <td>{b.bankName} ({b.branchName || 'Main'})</td>
                    <td>{b.accountNumber}</td>
                    <td>{b.ifscCode}</td>
                    <td>{b.accountHolderName}</td>
                    <td>{b.isPrimary ? <span className="badge badge-active">PRIMARY</span> : 'No'}</td>
                    <td>
                      <span className={`badge ${b.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => {
                          setSelectedBank(b);
                          setBankForm({
                            employeeId: b.employeeId || '',
                            bankName: b.bankName || '',
                            branchName: b.branchName || '',
                            accountNumber: b.accountNumber || '',
                            ifscCode: b.ifscCode || '',
                            accountHolderName: b.accountHolderName || '',
                            accountType: b.accountType || 'SAVINGS',
                            isPrimary: !!b.isPrimary,
                            status: b.status || 'ACTIVE',
                          });
                          setShowBankModal(true);
                        }}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteBank(b.bankDetailId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Salary Modal */}
      {showSalaryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{selectedSalary ? 'Edit Salary Structure' : 'Create Salary Structure'}</h2>
              <button className="close-btn" onClick={() => setShowSalaryModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSalarySubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  value={salaryForm.employeeId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Basic Salary *</label>
                  <input
                    type="number"
                    required
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>HRA</label>
                  <input
                    type="number"
                    value={salaryForm.hra}
                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Conveyance</label>
                  <input
                    type="number"
                    value={salaryForm.conveyanceAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, conveyanceAllowance: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Medical</label>
                  <input
                    type="number"
                    value={salaryForm.medicalAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, medicalAllowance: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Special Allowance</label>
                  <input
                    type="number"
                    value={salaryForm.specialAllowance}
                    onChange={(e) => setSalaryForm({ ...salaryForm, specialAllowance: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Provident Fund (PF)</label>
                  <input
                    type="number"
                    value={salaryForm.providentFund}
                    onChange={(e) => setSalaryForm({ ...salaryForm, providentFund: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prof. Tax (PT)</label>
                  <input
                    type="number"
                    value={salaryForm.professionalTax}
                    onChange={(e) => setSalaryForm({ ...salaryForm, professionalTax: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Income Tax (TDS)</label>
                  <input
                    type="number"
                    value={salaryForm.incomeTax}
                    onChange={(e) => setSalaryForm({ ...salaryForm, incomeTax: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Effective From *</label>
                  <input
                    type="date"
                    required
                    value={salaryForm.effectiveFrom}
                    onChange={(e) => setSalaryForm({ ...salaryForm, effectiveFrom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={salaryForm.status}
                    onChange={(e) => setSalaryForm({ ...salaryForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSalaryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Salary Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedBank ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
              <button className="close-btn" onClick={() => setShowBankModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleBankSubmit}>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="number"
                  required
                  value={bankForm.employeeId}
                  onChange={(e) => setBankForm({ ...bankForm, employeeId: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                  />
                </div>
                <div className="form-group">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Account Type *</label>
                  <select
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  >
                    <option value="SAVINGS">SAVINGS</option>
                    <option value="CURRENT">CURRENT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={bankForm.status}
                    onChange={(e) => setBankForm({ ...bankForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={bankForm.isPrimary}
                  onChange={(e) => setBankForm({ ...bankForm, isPrimary: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isPrimary" style={{ margin: 0 }}>Set Primary Account for Salary Disbursement</label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowBankModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-action">Save Bank Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollManagementPage;
