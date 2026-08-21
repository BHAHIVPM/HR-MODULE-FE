import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import './DashboardPage.css';

function DashboardPage() {
  const { showSuccess, showErrorPopup } = useNotification();

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back</h1>
          <p>Here's a quick look at your HR workspace and active modules.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Overview Card */}
        <section className="dashboard-card dashboard-card-wide">
          <h2>Overview & Quick Access</h2>
          <p className="dashboard-card-desc">
            Manage your organizational workforce, employees, registration modules, and system features seamlessly.
          </p>
          <div className="dashboard-quick-links">
            <Link to="/employees" className="dashboard-btn primary">
              👥 Go to Employee Directory
            </Link>
            <Link to="/registrations/user" className="dashboard-btn secondary">
              👤 User Registration
            </Link>
            <Link to="/registrations/employee" className="dashboard-btn secondary">
              💼 Employee Onboarding
            </Link>
            <Link to="/registrations/client" className="dashboard-btn secondary">
              🏢 Client Registration
            </Link>
          </div>
        </section>

        {/* Recent Activity / System Card */}
        <section className="dashboard-card">
          <h2>Quick Actions</h2>
          <p className="dashboard-card-desc">
            Access core system workflows and registration forms directly from your dashboard.
          </p>
          <div className="dashboard-action-list">
            <Link to="/employees" className="dashboard-action-item">
              <span className="action-icon">📋</span>
              <div>
                <strong>Manage Team Members</strong>
                <span>Search, edit status, or add new employees</span>
              </div>
            </Link>
            <Link to="/registrations/user" className="dashboard-action-item">
              <span className="action-icon">✨</span>
              <div>
                <strong>Create User Account</strong>
                <span>Register new portal users with dynamic forms</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Notifications & Alert Testing */}
        <section className="dashboard-card">
          <h2>System Notifications & Alerts</h2>
          <p className="dashboard-card-desc">
            Test real-time toast alerts (1.5s auto-dismiss) and error pop-up modal dialogs.
          </p>
          <div className="dashboard-test-buttons">
            <button
              type="button"
              className="dashboard-btn success"
              onClick={() => showSuccess('Action completed successfully! Auto-closing in 1.5s.', 'Success Alert')}
            >
              Test 1.5s Toast Alert
            </button>
            <button
              type="button"
              className="dashboard-btn danger"
              onClick={() =>
                showErrorPopup({
                  title: 'Sample System Exception',
                  message: 'Could not connect to database server. Please check network logs.',
                  statusCode: 500,
                  details: 'Connection pool exhausted at EmployeeService.java:142',
                })
              }
            >
              Test Error Pop-up Modal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
