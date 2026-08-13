import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { clientRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function ClientRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await registrationService.registerClient(data);
      setSuccess('Client registered successfully.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Ensure the backend dummy endpoint is running on port 8080.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <DynamicForm
        fields={clientRegistrationFields}
        onSubmit={handleSubmit}
        submitLabel="Register Client"
        loading={loading}
        error={error}
        success={success}
        title="Client Registration"
        subtitle="Onboard a new client tenant (ClientDetails model)."
      />
    </div>
  );
}

export default ClientRegistrationPage;
