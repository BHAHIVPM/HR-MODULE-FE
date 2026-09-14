import React, { useState, useEffect, useCallback } from 'react';
import mainGroupService from '../services/mainGroupService';

function MenuPreviewTab({ loading, setLoading, showErrorPopup }) {
  const [menuPreview, setMenuPreview] = useState([]);

  const fetchMenuPreview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mainGroupService.getFullMenu();
      const list = res?.data?.responseOutput || res?.data || [];
      setMenuPreview(Array.isArray(list) ? list : []);
    } catch (err) {
      showErrorPopup(err);
    } finally {
      setLoading(false);
    }
  }, [showErrorPopup, setLoading]);

  useEffect(() => { fetchMenuPreview(); }, [fetchMenuPreview]);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Menu Preview</h2>
        <div className="header-controls">
          <button className="btn-secondary" onClick={fetchMenuPreview}>Refresh</button>
        </div>
      </div>
      <div className="menu-preview-container">
        {loading ? (
          <div className="loading-container"><p>Loading menu preview...</p></div>
        ) : menuPreview.length === 0 ? (
          <div className="empty-preview"><p>No menu data available. Please configure Main Groups and Menu Items first.</p></div>
        ) : (
          <div className="menu-accordion">
            {menuPreview.map((mainGroup) => (
              <div key={mainGroup.mainGroupId} className="accordion-item">
                <div className="accordion-header">
                  <div className="accordion-header-content">
                    {mainGroup.iconPath && (
                      <i className={mainGroup.iconPath} style={{ marginRight: '8px', fontSize: '16px' }}></i>
                    )}
                    <span className="accordion-title">{mainGroup.mainGroupName}</span>
                  </div>
                </div>
                <div className="accordion-body">
                  {(!mainGroup.subGroup || mainGroup.subGroup.length === 0) ? (
                    <div className="no-subgroups">No sub groups configured.</div>
                  ) : (
                    mainGroup.subGroup.map((subGroup) => (
                      <div key={subGroup.subGroupId} className="subgroup-section">
                        <div className="subgroup-title">{subGroup.subGroupName}</div>
                        <div className="subgroup-items">
                          {(!subGroup.subItems || subGroup.subItems.length === 0) ? (
                            <div className="no-items">No menu items in this sub group.</div>
                          ) : (
                            subGroup.subItems.map((item) => (
                              <div key={item.menuNameId} className="menu-preview-item">
                                <div className="menu-item-info">
                                  <span className="menu-item-name">{item.menuName}</span>
                                  <code className="menu-item-path">{item.componentPath}</code>
                                </div>
                                <div className="menu-item-permissions">
                                  {item.canView !== undefined && (
                                    <span className={`badge ${item.canView ? 'badge-yes' : 'badge-no'}`}>View</span>
                                  )}
                                  {item.canAdd !== undefined && (
                                    <span className={`badge ${item.canAdd ? 'badge-yes' : 'badge-no'}`}>Add</span>
                                  )}
                                  {item.canEdit !== undefined && (
                                    <span className={`badge ${item.canEdit ? 'badge-yes' : 'badge-no'}`}>Edit</span>
                                  )}
                                  {item.canDelete !== undefined && (
                                    <span className={`badge ${item.canDelete ? 'badge-yes' : 'badge-no'}`}>Delete</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPreviewTab;
