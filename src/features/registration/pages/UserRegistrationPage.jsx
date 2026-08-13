import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { userRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function UserRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await registrationService.registerUser(data);
      setSuccess('User registered successfully.');
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
        fields={userRegistrationFields}
        onSubmit={handleSubmit}
        submitLabel="Register User"
        loading={loading}
        error={error}
        success={success}
        title="User Registration"
        subtitle="Create a new portal login account (UserLogin model)."
      />
    </div>
  );
}

export default UserRegistrationPage;
