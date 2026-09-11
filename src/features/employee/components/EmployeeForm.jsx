import React, { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import { useNotification } from '../../../context/NotificationContext';
import './EmployeeForm.css';

const DEFAULT_FORM_STATE = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  mobileNo: '',
  dateOfBirth: '',
  dateOfJoining: '',
  department: '',
  designation: '',
  reportingManagerId: '',
  status: 'ACTIVE',
  loginId: '',
};

function EmployeeForm({ initialData = null, onSuccess, onCancel }) {
  const { showSuccess, showErrorPopup } = useNotification();
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [codeCheckStatus, setCodeCheckStatus] = useState({
    checking: false,
    exists: null,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData && initialData.employeeId);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...DEFAULT_FORM_STATE,
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? String(initialData.dateOfBirth).slice(0, 10) : '',
        dateOfJoining: initialData.dateOfJoining ? String(initialData.dateOfJoining).slice(0, 10) : '',
        reportingManagerId: initialData.reportingManagerId != null ? String(initialData.reportingManagerId) : '',
        loginId: initialData.loginId || '',
      });
    } else {
      setFormData(DEFAULT_FORM_STATE);
    }
  }, [initialData]);

  // Handle checking employeeCode uniqueness against /employee/exists/{employeeCode}
  const checkEmployeeCode = async (codeToTest) => {
    const code = (codeToTest || formData.employeeCode).trim();
    if (!code) return;

    // If editing and code has not changed from original, skip check
    if (isEditing && initialData?.employeeCode === code) {
      setCodeCheckStatus({ checking: false, exists: false, message: '' });
      return;
    }

    setCodeCheckStatus({ checking: true, exists: null, message: 'Checking code availability…' });

    try {
      const response = await employeeService.checkCodeExists(code);
      // ResponseMessage<Boolean> -> responseOutput contains true/false
      const exists = response?.data?.responseOutput === true;
      if (exists) {
        setCodeCheckStatus({
          checking: false,
          exists: true,
          message: `Employee Code "${code}" is already in use.`,
        });
        setErrors((prev) => ({ ...prev, employeeCode: `Employee Code "${code}" is already in use.` }));
      } else {
        setCodeCheckStatus({
          checking: false,
          exists: false,
          message: `Employee Code "${code}" is available.`,
        });
        setErrors((prev) => {
          const next = { ...prev };
          delete next.employeeCode;
          return next;
        });
      }
    } catch (err) {
      console.error('Error verifying employee code', err);
      setCodeCheckStatus({ checking: false, exists: null, message: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset inline error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'employeeCode') {
      setCodeCheckStatus({ checking: false, exists: null, message: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee Code is required';
    } else if (formData.employeeCode.length > 20) {
      newErrors.employeeCode = 'Employee Code cannot exceed 20 characters';
    } else if (codeCheckStatus.exists) {
      newErrors.employeeCode = codeCheckStatus.message || 'Employee Code already exists';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNo.trim())) {
      newErrors.mobileNo = 'Mobile number must be exactly 10 digits';
    }

    if (!formData.dateOfJoining) {
      newErrors.dateOfJoining = 'Date of Joining is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorPopup({
        title: 'Validation Error',
        message: 'Please resolve the highlighted fields in the form before submitting.',
      });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      employeeCode: formData.employeeCode.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName ? formData.lastName.trim() : null,
      email: formData.email.trim(),
      mobileNo: formData.mobileNo.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      dateOfJoining: formData.dateOfJoining,
      department: formData.department ? formData.department.trim() : null,
      designation: formData.designation ? formData.designation.trim() : null,
      reportingManagerId: formData.reportingManagerId ? parseInt(formData.reportingManagerId, 10) : null,
      loginId: formData.loginId ? formData.loginId.trim() : null,
      status: formData.status,
    };

    try {
      let response;
      if (isEditing) {
        response = await employeeService.update(initialData.employeeId, payload);
      } else {
        response = await employeeService.save(payload);
      }

      // Show success toast - slides in at top right and disappears after 1.5s
      const successMsg =
        response?.data?.message ||
        (isEditing ? 'Employee updated successfully.' : 'Employee created successfully.');
      showSuccess(successMsg, 'Success');

      if (!isEditing) {
        setFormData(DEFAULT_FORM_STATE);
        setCodeCheckStatus({ checking: false, exists: null, message: '' });
      }

      if (onSuccess) {
        onSuccess(response?.data);
      }
    } catch (err) {
      // Reusable error popup modal shows up with details from backend
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-card">
      <div className="employee-form-header">
        <div>
          <h2 className="employee-form-title">
            {isEditing ? `Edit Employee (${initialData?.employeeCode})` : 'Register New Employee'}
          </h2>
          <p className="employee-form-subtitle">
            Fill in the details below to {isEditing ? 'update employee record' : 'create an employee entry'}.
          </p>
        </div>
      </div>

      <form className="employee-form-body" onSubmit={handleSubmit} noValidate>
        {/* Section 1: Identification & Basic Info */}
        <div className="form-section-title">Identity & Basic Information</div>
        <div className="form-grid">
          {/* Employee Code */}
          <div className="form-group">
            <label htmlFor="employeeCode">
              Employee Code <span className="required-asterisk">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="employeeCode"
                name="employeeCode"
                type="text"
                maxLength={20}
                placeholder="e.g. EMP001"
                value={formData.employeeCode}
                onChange={handleChange}
                onBlur={() => checkEmployeeCode()}
                className={errors.employeeCode ? 'has-error' : ''}
                disabled={loading}
                required
              />
            </div>
            {errors.employeeCode ? (
              <span className="input-feedback error">{errors.employeeCode}</span>
            ) : codeCheckStatus.message ? (
              <span
                className={`input-feedback ${
                  codeCheckStatus.checking
                    ? 'checking'
                    : codeCheckStatus.exists
                    ? 'error'
                    : 'available'
                }`}
              >
                {codeCheckStatus.message}
              </span>
            ) : null}
          </div>

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required-asterisk">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {errors.firstName && <span className="input-feedback error">{errors.firstName}</span>}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Login ID (Linked User Account) */}
          <div className="form-group">
            <label htmlFor="loginId">Login ID (Optional)</label>
            <input
              id="loginId"
              name="loginId"
              type="text"
              maxLength={12}
              placeholder="e.g. jdoe_portal"
              value={formData.loginId}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Section 2: Contact & Personal Details */}
        <div className="form-section-title">Contact & Personal Details</div>
        <div className="form-grid">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required-asterisk">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={150}
              placeholder="e.g. john.doe@company.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {errors.email && <span className="input-feedback error">{errors.email}</span>}
          </div>

          {/* Mobile No */}
          <div className="form-group">
            <label htmlFor="mobileNo">
              Mobile Number <span className="required-asterisk">*</span>
            </label>
            <input
              id="mobileNo"
              name="mobileNo"
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={formData.mobileNo}
              onChange={handleChange}
              className={errors.mobileNo ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {errors.mobileNo && <span className="input-feedback error">{errors.mobileNo}</span>}
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Date of Joining */}
          <div className="form-group">
            <label htmlFor="dateOfJoining">
              Date of Joining <span className="required-asterisk">*</span>
            </label>
            <input
              id="dateOfJoining"
              name="dateOfJoining"
              type="date"
              value={formData.dateOfJoining}
              onChange={handleChange}
              className={errors.dateOfJoining ? 'has-error' : ''}
              disabled={loading}
              required
            />
            {errors.dateOfJoining && (
              <span className="input-feedback error">{errors.dateOfJoining}</span>
            )}
          </div>
        </div>

        {/* Section 3: Job Role & Organization */}
        <div className="form-section-title">Organization & Status</div>
        <div className="form-grid">
          {/* Department */}
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              type="text"
              placeholder="e.g. Engineering, HR, Finance"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Designation */}
          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={formData.designation}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Reporting Manager ID */}
          <div className="form-group">
            <label htmlFor="reportingManagerId">Reporting Manager ID</label>
            <input
              id="reportingManagerId"
              name="reportingManagerId"
              type="number"
              min="1"
              placeholder="e.g. 101"
              value={formData.reportingManagerId}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Employee Status */}
          <div className="form-group">
            <label htmlFor="status">
              Status <span className="required-asterisk">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={errors.status ? 'has-error' : ''}
              disabled={loading}
              required
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>
            {errors.status && <span className="input-feedback error">{errors.status}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Saving…' : isEditing ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;
