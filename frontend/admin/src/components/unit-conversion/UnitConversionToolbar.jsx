import React from "react";
import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const UnitConversionToolbar = ({ 
  searchTerm, 
  setSearchTerm, 
  unitFilter, 
  setUnitFilter,
  availableUnits = []
}) => {
  return (
    <Space size="middle" style={{ width: '100%', marginBottom: 16 }}>
      <Search
        placeholder="Search conversions..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 300 }}
        allowClear
        enterButton
      />

      <Select
        value={unitFilter}
        onChange={setUnitFilter}
        style={{ width: 200 }}
        placeholder="Filter by unit"
        allowClear
      >
        <Option value="all">All Units</Option>
        {availableUnits.map(unit => (
          <Option key={unit} value={unit}>{unit}</Option>
        ))}
      </Select>
    </Space>
  );
};

export default UnitConversionToolbar;