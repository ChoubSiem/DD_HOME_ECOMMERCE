import React, { useState } from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const EmployeeToolbar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAdvancedFilter }) => {
  const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);

  const toggleAdvancedFilter = () => {
    setIsAdvancedFilterVisible((prev) => !prev);
  };

  return (
    <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
      <Space>
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          placeholder="Select Status"
        >
          <Option value="all">All</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Space>
    </Space>
  );
};

export default EmployeeToolbar;
