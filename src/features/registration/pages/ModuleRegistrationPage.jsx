import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import {
  MODULE_REGISTRATIONS,
  REGISTRATION_LOOKUPS,
  getRegistrationListPath,
} from '../config/moduleRegistrationConfig';
import './RegistrationPage.css';

/**
 * Single registration (insert) screen used by every module "+" menu action.
 * The form itself is described by MODULE_REGISTRATIONS, so a module only needs
 * a config entry instead of duplicating a modal form.
 */
function ModuleRegistrationPage() {
  const { moduleKey } = useParams();
  const navigate = useNavigate();
  const config = MODULE_REGISTRATIONS[moduleKey];

  const [lookups, setLookups] = useState({});
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const lookupKey = config?.lookups ? config.lookups.join('|') : '';

  const loadLookups = useCallback(async () => {
    if (!lookupKey) return;
    setLoadingLookups(true);
    const entries = await Promise.all(
      lookupKey.split('|').map(async (key) => {
        try {
          const loader = REGISTRATION_LOOKUPS[key];
          if (!loader) return [key, []];
          const res = await loader();
          const list = res?.data?.responseOutput || res?.data || res || [];
          return [key, Array.isArray(list) ? list : []];
        } catch {
          // A failing lookup must not block the form; selects stay empty.
          return [key, []];
        }
      })
    );
    setLookups(Object.fromEntries(entries));
    setLoadingLookups(false);
  }, [lookupKey]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  const fields = useMemo(() => {
    if (!config) return [];
    return config.fields.map((field) => ({
      ...field,
      options: typeof field.options === 'function' ? field.options(lookups) : field.options,
    }));
  }, [config, lookups]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const validationError = config.validate ? config.validate(values) : null;
      if (validationError) {
        setError(validationError);
        return;
      }
      const payload = config.transform ? config.transform(values) : values;
      const res = await config.save(payload);
      setSuccess(res?.data?.message || res?.message || config.successMessage);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to save the record. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) {
    return (
      <div className="registration-page">
        <div className="registration-unknown">
          <h2>Registration screen not found</h2>
          <p>The form you requested is not configured for this module.</p>
          <Link className="registration-back-link" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const listPath = getRegistrationListPath(config);

  return (
    <div className="registration-page">
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={config.submitLabel}
        loading={submitting}
        error={error}
        success={success}
        title={config.title}
        subtitle={config.subtitle}
        cancelLabel={`Back to ${config.listTitle}`}
        onCancel={() => navigate(listPath)}
      />
      {loadingLookups && (
        <p className="registration-lookup-hint">Loading dropdown options…</p>
      )}
    </div>
  );
}

export default ModuleRegistrationPage;