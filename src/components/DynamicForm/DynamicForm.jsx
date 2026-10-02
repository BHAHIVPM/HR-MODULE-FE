import { useEffect, useState } from 'react';
import './DynamicForm.css';

/**
 * Reusable form driven by a field config array.
 *
 * Field shape:
 * {
 *   name: string,
 *   label: string,
 *   type: 'text' | 'email' | 'tel' | 'password' | 'date' | 'time' | 'number' | 'select' | 'textarea' | 'checkbox',
 *   required?: boolean,
 *   placeholder?: string,
 *   maxLength?: number,
 *   minLength?: number,
 *   options?: { value: string, label: string }[] | ((lookups) => { value: string, label: string }[]),
 *   defaultValue?: string | number | boolean,
 *   colSpan?: 1 | 2,  // grid column span (default 1)
 *   hint?: string,
 *   rows?: number,    // textarea rows
 * }
 */
function getInitialValues(fieldList) {
  return (fieldList || []).reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? '';
    return acc;
  }, {});
}

function DynamicForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  error = null,
  success = null,
  title,
  subtitle,
  cancelLabel,
  onCancel,
}) {
  const [values, setValues] = useState(() => getInitialValues(fields));
  const [showPasswords, setShowPasswords] = useState({});

  // Keep the values valid when the field config changes AFTER mount:
  //  - select options can be resolved asynchronously (e.g. the user-creation
  //    User Type dropdown follows the logged-in profile), so a value that is
  //    no longer offered falls back to the field default - otherwise the
  //    <select> would render its first option while submitting the stale value;
  //  - fields introduced by a new config (e.g. switching to another module's
  //    form) receive their default value so their inputs stay controlled.
  useEffect(() => {
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      fields.forEach((field) => {
        if (!(field.name in prev)) {
          next[field.name] = field.defaultValue ?? '';
          changed = true;
          return;
        }
        const optionValues = Array.isArray(field.options)
          ? field.options.map((option) => option.value)
          : [];
        const current = prev[field.name];
        const isEmpty = current === '' || current === undefined || current === null;
        if (optionValues.length === 0 || isEmpty) return;
        if (!optionValues.includes(current)) {
          next[field.name] = optionValues.includes(field.defaultValue)
            ? field.defaultValue
            : optionValues[0];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [fields]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    try {
      const result = await onSubmit(values);
      if (result !== false) {
        setValues(getInitialValues(fields));
      }
    } catch {
      // On submission failure/exception, retain existing input values in form
    }
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
                  <option value="">{field.placeholder || 'Select…'}</option>
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
              ) : field.type === 'checkbox' ? (
                <div className="dynamic-form-checkbox">
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    checked={!!values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    disabled={loading}
                  />
                </div>
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
          {cancelLabel && (
            <button
              type="button"
              className="dynamic-form-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
          )}
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
