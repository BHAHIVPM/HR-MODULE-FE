import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicForm from '../../../components/DynamicForm/DynamicForm';
import { useNotification } from '../../../context/NotificationContext';
import {
  buildUserRegistrationFields,
  getAllowedCreatableUserTypes,
  getUserTypeLabel,
  normalizeUserType,
} from '../config/registrationFields';
import registrationService from '../services/registrationService';
import useCurrentUser from '../../../hooks/useCurrentUser';
import './RegistrationPage.css';

function UserRegistrationPage() {
  const { showErrorPopup } = useNotification();
  const [loading, setLoading] = useState(false);
  const [createdUserResult, setCreatedUserResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // The logged-in account decides which user types may be created
  // (DEVELOPER -> SUPERADMIN, SUPERADMIN -> ADMIN, ADMIN -> USER); see
  // CREATABLE_USER_TYPES in registrationFields.js. The type is resolved from
  // GET /auth/about-me; while it is unknown the standard list is used.
  const { currentUserType } = useCurrentUser();
  const allowedUserTypes = getAllowedCreatableUserTypes(currentUserType);
  const loginTypeLabel = getUserTypeLabel(normalizeUserType(currentUserType));
  const fields = useMemo(
    () => buildUserRegistrationFields(currentUserType),
    [currentUserType]
  );

  const handleSubmit = async (data) => {
    setCreatedUserResult(null);
    setCopied(false);

    if (!data.userType) {
      showErrorPopup({
        title: 'Validation Error',
        message: 'Please select a User Type.',
      });
      return false;
    }
    // Defence in depth: the dropdown only offers the allowed types, but never
    // trust a value that could have been tampered with in the browser.
    if (allowedUserTypes && !allowedUserTypes.includes(data.userType)) {
      showErrorPopup({
        title: 'Validation Error',
        message: `A ${loginTypeLabel} account can only create ${allowedUserTypes
          .map(getUserTypeLabel)
          .join(' / ')} users.`,
      });
      return false;
    }

    setLoading(true);
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
      return true;
    } catch (err) {
      showErrorPopup(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // A known login type that may not create any user (e.g. EMPLOYEE or USER) is
  // kept away from the creation form - this also covers direct URL access,
  // since the route itself is only guarded by authentication.
  if (allowedUserTypes !== null && allowedUserTypes.length === 0) {
    return (
      <div className="registration-page">
        <div className="registration-unknown">
          <h2>Not allowed</h2>
          <p>
            Your {loginTypeLabel} account is not allowed to create user accounts.
            Please contact a Developer, SuperAdmin or Admin.
          </p>
          <Link className="registration-back-link" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Register User"
        loading={loading}
        title="User Registration"
        subtitle="Create a new portal login account (UserLogin model)."
      />
    </div>
  );
}

export default UserRegistrationPage;

