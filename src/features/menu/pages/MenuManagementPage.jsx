import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import mainGroupService from '../services/mainGroupService';
import menuService from '../services/menuService';
import subGroupService from '../services/subGroupService';
import { useNotification } from '../../../context/NotificationContext';
import MainGroupsTab from '../components/MainGroupsTab';
import MenuItemsTab from '../components/MenuItemsTab';
import MenuPreviewTab from '../components/MenuPreviewTab';
import SubGroupsTab from '../components/SubGroupsTab';
import './MenuManagementPage.css';

function MenuManagementPage() {
  const { showSuccess, showErrorPopup } = useNotification();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'mainGroups');
  const [loading, setLoading] = useState(false);
  const [mainGroups, setMainGroups] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [subGroups, setSubGroups] = useState([]);

  const fetchMainGroups = useCallback(async () => {
    try {
      const res = await mainGroupService.getAll();
      const list = res?.data?.responseOutput || res?.data || [];
      const sorted = Array.isArray(list) ? [...list].sort((a, b) => (a.hierarchyId || 0) - (b.hierarchyId || 0)) : [];
      setMainGroups(sorted);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const res = await menuService.getAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setMenuItems(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  const fetchSubGroups = useCallback(async () => {
    try {
      const res = await subGroupService.getAll();
      const list = res?.data?.responseOutput || res?.data || [];
      setSubGroups(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    }
  }, [showErrorPopup]);

  useEffect(() => {
    fetchMainGroups();
    fetchMenuItems();
    fetchSubGroups();
  }, [fetchMainGroups, fetchMenuItems, fetchSubGroups]);

  const tabs = [
    { key: 'mainGroups', label: 'Main Groups' },
    { key: 'menuItems', label: 'Menu Items' },
    { key: 'subGroups', label: 'Sub Groups' },
    { key: 'menuPreview', label: 'Menu Preview' },
  ];

  return (
    <div className="menu-management-page">
      <div className="menu-management-header">
        <h1>Menu Management</h1>
      </div>
      <div className="menu-management-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="menu-management-content">
        {activeTab === 'mainGroups' && (
          <MainGroupsTab
            mainGroups={mainGroups}
            setMainGroups={setMainGroups}
            fetchMainGroups={fetchMainGroups}
            showSuccess={showSuccess}
            showErrorPopup={showErrorPopup}
          />
        )}
        {activeTab === 'menuItems' && (
          <MenuItemsTab
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            mainGroups={mainGroups}
            subGroups={subGroups}
            fetchMenuItems={fetchMenuItems}
            showSuccess={showSuccess}
            showErrorPopup={showErrorPopup}
          />
        )}
        {activeTab === 'subGroups' && (
          <SubGroupsTab
            subGroups={subGroups}
            fetchSubGroups={fetchSubGroups}
            showSuccess={showSuccess}
            showErrorPopup={showErrorPopup}
          />
        )}
        {activeTab === 'menuPreview' && (
          <MenuPreviewTab
            loading={loading}
            setLoading={setLoading}
            showErrorPopup={showErrorPopup}
          />
        )}
      </div>
    </div>
  );
}

export default MenuManagementPage;
