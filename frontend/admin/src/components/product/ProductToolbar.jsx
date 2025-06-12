import React from "react";
import { Input, Select, Button, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FiFilter } from "react-icons/fi";

const { Search } = Input;
const { Option } = Select;

const ProductToolbar = ({
  searchTerm,
  setSearchTerm,
  onSearch, // Trigger search from parent
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  showFilter,
  setShowFilter,
  categories = [],
}) => {
  return (
    <Card className="filter-card">
      <div className="filter-content">
        <Search
          placeholder="Search products by name, code or barcode..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={onSearch}
          style={{ width: 400 }}
          allowClear
          enterButton
        />

        <div className="filter-controls">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            placeholder="Status"
          >
            <Option value="all">All Statuses</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            style={{ width: 180 }}
            placeholder="Category"
            options={[
              { label: "All Categories", value: "all" },
              ...categories.map((cat) => ({
                label: cat.name,
                value: String(cat.id),
              })),
            ]}
          />

          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 120 }}
            placeholder="Type"
          >
            <Option value="all">All Types</Option>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>

          <Button
            type={showFilter ? "primary" : "default"}
            icon={<FiFilter />}
            onClick={() => setShowFilter(!showFilter)}
            style={{ marginLeft: 16 }}
          >
            Advanced
          </Button>

          {/* NEW SUBMIT BUTTON */}
          <Button
            type="primary"
            onClick={onSearch}
            style={{ marginLeft: 8 }}
          >
            Submit
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductToolbar;
