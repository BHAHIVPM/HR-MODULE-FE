import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { employeeRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function EmployeeRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await registrationService.registerEmployee(data);
      setSuccess('Employee registered successfully.');
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
        fields={employeeRegistrationFields}
        onSubmit={handleSubmit}
        submitLabel="Register Employee"
        loading={loading}
        error={error}
        success={success}
        title="Employee Registration"
        subtitle="Add a new employee record (EmployeeMaster model)."
      />
    </div>
  );
}

export default EmployeeRegistrationPage;
