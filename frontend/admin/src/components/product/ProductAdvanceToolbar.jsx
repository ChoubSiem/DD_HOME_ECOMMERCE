const AdvancedProductFilter = ({
  showFilter,
  createDate,
  setCreateDate,
  productName,
  setProductName,
  code,
  setCode,
  category,
  setCategory,
  status,
  setStatus,
  onReset,
  onApply,
}) => {
  return (
    <div className={`filter-container ${showFilter ? "show" : "hide"}`}>
      <Card className="advanced-filter-container" style={{ marginBottom: 15 }}>
        <Form layout="vertical">
          <div className="form-row">
            <Form.Item label="Create Date" style={{ width: "48%" }}>
              <DatePicker
                style={{ width: "100%" }}
                value={createDate}
                onChange={setCreateDate}
              />
            </Form.Item>
            <Form.Item label="Product Name" style={{ width: "48%" }}>
              <Input
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Form.Item>
          </div>
          <div className="form-row">
            <Form.Item label="Code" style={{ width: "48%" }}>
              <Input
                placeholder="Enter product code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Item>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>

          </div>
          <div className="form-row">
            <Form.Item label="Status" style={{ width: "48%" }}>
              <Select
                placeholder="-- Select Status --"
                value={status}
                onChange={setStatus}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
          </div>
          <div className="filter-actions">
            <Button onClick={onReset}>Reset Filters</Button>
            <Button type="primary" onClick={onApply}>
              Apply Filters
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
