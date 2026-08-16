import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';

function DashboardPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          background: '#ffffff',
          padding: '24px 28px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
          Welcome to HR Module Dashboard
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: 14 }}>
          Manage your organizational workforce, employees, teams, and access control.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div
          style={{
            background: '#ffffff',
            padding: 24,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#0f172a' }}>Employee Directory</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Search records, inspect direct reports, update employment status, and onboard new team members.
            </p>
          </div>
          <Link
            to="/employees"
            style={{
              marginTop: 18,
              display: 'inline-block',
              padding: '9px 18px',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            Go to Employees →
          </Link>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: 24,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#0f172a' }}>Notification & Error Testing</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Test the global notification system (1.5s top-right sliding rectangle and error pop-up modal):
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => showSuccess('Action completed successfully! Auto-closing in 1.5s.', 'Success Alert')}
              style={{
                padding: '8px 14px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Test 1.5s Success Toast
            </button>
            <button
              type="button"
              onClick={() =>
                showErrorPopup({
                  title: 'Sample Backend Failure',
                  message: 'Could not fetch team members. Database connection timed out.',
                  statusCode: 500,
                  details: 'Exception: Connection pool exhausted at com.bhahi.hrmodule.service.EmployeeMasterService',
                })
              }
              style={{
                padding: '8px 14px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Test Error Pop-up Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
