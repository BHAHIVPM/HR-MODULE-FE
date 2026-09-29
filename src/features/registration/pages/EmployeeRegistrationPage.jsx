import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { useNotification } from '../../../context/NotificationContext';
import { employeeRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function EmployeeRegistrationPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registrationService.registerEmployee(data);
      const msg = res?.data?.message || 'Employee registered successfully.';
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
        fields={employeeRegistrationFields}
        onSubmit={handleSubmit}
        submitLabel="Register Employee"
        loading={loading}
        title="Employee Registration"
        subtitle="Add a new employee record (EmployeeMaster model)."
      />
    </div>
  );
}

export default EmployeeRegistrationPage;
