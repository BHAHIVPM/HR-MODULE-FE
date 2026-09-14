import React, { useState } from 'react';
import RoleCreationPage from './RoleCreationPage';
import RolePrivilegePage from './RolePrivilegePage';
import UserRoleAssignmentPage from './UserRoleAssignmentPage';
import UserLevelPrivilegePage from './UserLevelPrivilegePage';
import './RoleAssignmentPage.css';

const TABS = [
  { key: 'role-creation', label: 'Role Creation', icon: '📋' },
  { key: 'role-privileges', label: 'Role Privileges', icon: '🔐' },
  { key: 'user-role-assignment', label: 'User Role Assignment', icon: '👥' },
  { key: 'user-level-privileges', label: 'User Level Privileges', icon: '🛡️' },
];

function RoleAssignmentPage() {
  const [activeTab, setActiveTab] = useState('role-creation');

  const renderContent = () => {
    switch (activeTab) {
      case 'role-creation': return <RoleCreationPage />;
      case 'role-privileges': return <RolePrivilegePage />;
      case 'user-role-assignment': return <UserRoleAssignmentPage />;
      case 'user-level-privileges': return <UserLevelPrivilegePage />;
      default: return <RoleCreationPage />;
    }
  };

  return (
    <div className="ra-module">
      <div className="ra-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ra-tab ${activeTab === tab.key ? 'ra-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="ra-tab-icon">{tab.icon}</span>
            <span className="ra-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="ra-tab-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default RoleAssignmentPage;
