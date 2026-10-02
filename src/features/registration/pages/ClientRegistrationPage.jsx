import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { useNotification } from '../../../context/NotificationContext';
import { clientRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function ClientRegistrationPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registrationService.registerClient(data);
      const msg = res?.data?.message || 'Client registered successfully.';
      showSuccess(msg);
      return true;
    } catch (err) {
      showErrorPopup(err);
      return false;
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
        title="Client Registration"
        subtitle="Onboard a new client tenant (ClientDetails model)."
      />
    </div>
  );
}

export default ClientRegistrationPage;
