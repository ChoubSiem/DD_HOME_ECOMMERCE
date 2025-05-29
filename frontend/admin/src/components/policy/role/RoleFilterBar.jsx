import React from 'react';
import { Tabs, Input, Button, Space } from 'antd';
import { FiPlus, FiSearch } from 'react-icons/fi';

const RoleToolbar = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  onCreate,
  canCreate,
  tabs = [
    { key: 'all', label: 'All Roles' },
    { key: 'withPermission', label: 'With Permissions' },
    { key: 'OC', label: 'OC' },
  ]
}) => {
  const tabItems = tabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    children: null, 
  }));

  return (
    <div className="role-toolbar">
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        tabBarExtraContent={
          <Space>
            <Input
              placeholder="Search roles..."
              prefix={<FiSearch />}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: 200 }}
            />
            {canCreate && (
              <Button type="primary" icon={<FiPlus />} onClick={onCreate}>
                New Role
              </Button>
            )}
          </Space>
        }
      />
    </div>
  );
};

export default RoleToolbar;
