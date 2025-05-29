// src/components/filters/AdvancedFilter.js
import React from 'react';
import { Select, Space } from 'antd';

const { Option } = Select;

const AdvancedFilter = ({ roleFilter, setRoleFilter }) => {
  return (
    <Space>
      <Select
        value={roleFilter}
        onChange={(value) => setRoleFilter(value)}
        placeholder="Select Role"
      >
        <Option value="all">All Roles</Option>
        <Option value="admin">Admin</Option>
        <Option value="employee">Employee</Option>
      </Select>
    </Space>
  );
};

export default AdvancedFilter;
