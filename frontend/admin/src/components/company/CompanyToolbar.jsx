import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const CompanyToolbar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="company-toolbar" style={{display:'flex',gap:40}}>
      <Search
        placeholder="Search companies..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />
    </div>
  );
};

export default CompanyToolbar;