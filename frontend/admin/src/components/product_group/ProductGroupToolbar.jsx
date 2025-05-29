import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const CompanyToolbar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="company-toolbar" style={{display:'flex',gap:40}}>
      <Search
        placeholder="Search regional..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />

      <div className="company-filter-controls">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          placeholder="Status"
        >
          <Option value="all">All Statuses</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </div>
    </div>
  );
};

export default CompanyToolbar;