import { useState } from 'react';
import './DynamicForm.css';

/**
 * Reusable form driven by a field config array.
 *
 * Field shape:
 * {
 *   name: string,
 *   label: string,
 *   type: 'text' | 'email' | 'tel' | 'password' | 'date' | 'number' | 'select' | 'textarea',
 *   required?: boolean,
 *   placeholder?: string,
 *   maxLength?: number,
 *   minLength?: number,
 *   options?: { value: string, label: string }[],
 *   defaultValue?: string,
 *   colSpan?: 1 | 2,  // grid column span (default 1)
 * }
 */
function DynamicForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  error = null,
  success = null,
  title,
  subtitle,
}) {
  const initialValues = fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? '';
    return acc;
  }, {});

  const [values, setValues] = useState(initialValues);
  const [showPasswords, setShowPasswords] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const togglePassword = (name) => {
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="dynamic-form-card">
      {(title || subtitle) && (
        <div className="dynamic-form-header">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}

      {error && (
        <div className="dynamic-form-alert dynamic-form-alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="dynamic-form-alert dynamic-form-alert-success" role="status">
          <SuccessIcon />
          <span>{success}</span>
        </div>
      )}

      <form className="dynamic-form" onSubmit={handleSubmit} noValidate>
        <div className="dynamic-form-grid">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`dynamic-form-field ${field.colSpan === 2 ? 'dynamic-form-field-wide' : ''}`}
            >
              <label className="dynamic-form-label" htmlFor={field.name}>
                {field.label}
                {field.required && <span className="dynamic-form-required">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={loading}
                  required={field.required}
                >
                  <option value="">Select…</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                  required={field.required}
                  rows={field.rows ?? 3}
                />
              ) : field.type === 'password' ? (
                <div className="dynamic-form-input-wrap">
                  <input
                    id={field.name}
                    name={field.name}
                    type={showPasswords[field.name] ? 'text' : 'password'}
                    value={values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={loading}
                    required={field.required}
                    maxLength={field.maxLength}
                    minLength={field.minLength}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="dynamic-form-toggle-pw"
                    onClick={() => togglePassword(field.name)}
                    disabled={loading}
                    aria-label={showPasswords[field.name] ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords[field.name] ? 'Hide' : 'Show'}
                  </button>
                </div>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? 'text'}
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                  required={field.required}
                  maxLength={field.maxLength}
                  minLength={field.minLength}
                />
              )}

              {field.hint && <span className="dynamic-form-hint">{field.hint}</span>}
            </div>
          ))}
        </div>

        <div className="dynamic-form-actions">
          <button type="submit" className="dynamic-form-submit" disabled={loading}>
            {loading && <span className="dynamic-form-spinner" aria-hidden="true" />}
            {loading ? 'Submitting…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default DynamicForm;
