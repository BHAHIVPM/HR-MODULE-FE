import { useState } from 'react';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { userRegistrationFields } from '../config/registrationFields';
import registrationService from '../services/registrationService';
import './RegistrationPage.css';

function UserRegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUserResult, setCreatedUserResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setCreatedUserResult(null);
    setCopied(false);
    try {
      const response = await registrationService.registerUser(data);
      // Backend returns ResponseMessage<UserCreationResponse> -> response.data.responseOutput
      const output = response?.data?.responseOutput || response?.data;
      if (output?.tempPassword) {
        setCreatedUserResult({
          user: output.user || data,
          tempPassword: output.tempPassword,
        });
      } else {
        setCreatedUserResult({
          user: data,
          tempPassword: null,
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Ensure backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="registration-page">
      {createdUserResult && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
            🎉 User Created Successfully!
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
            Account for <strong>{createdUserResult.user?.name || createdUserResult.user?.userId}</strong> has been registered.
          </p>

          {createdUserResult.tempPassword && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '10px 14px',
              borderRadius: '6px',
              marginTop: '8px'
            }}>
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
                One-Time Temporary Password:
              </span>
              <code style={{
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#38bdf8',
                backgroundColor: '#0f172a',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {createdUserResult.tempPassword}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(createdUserResult.tempPassword)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: copied ? '#10b981' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
            Note: This temporary password will not be shown again. Share it with the user to verify and set their permanent password.
          </p>
        </div>
      )}

      <DynamicForm
        fields={userRegistrationFields}
        onSubmit={handleSubmit}
        submitLabel="Register User"
        loading={loading}
        error={error}
        title="User Registration"
        subtitle="Create a new portal login account (UserLogin model)."
      />
    </div>
  );
}

export default UserRegistrationPage;

