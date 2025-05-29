import React, { useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Dropdown,
  Menu,
  Select,
  Modal ,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Spinner from '../../components/spinner/Spinner';

// const { Search } = Input;
const { Option } = Select;
const SalesReturnTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentReturn, setCurrentReturn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample sales return data
  const [salesReturns, setSalesReturns] = useState([
    {
      key: "1",
      returnId: "R001",
      customerName: "John Doe",
      productName: "Wireless Headphones",
      quantity: 2,
      reason: "Defective Product",
      status: "pending",
    },
    {
      key: "2",
      returnId: "R002",
      customerName: "Jane Smith",
      productName: "Smartphone X",
      quantity: 1,
      reason: "Wrong Item Delivered",
      status: "approved",
    },
  ]);

  // Filter sales returns based on search term and status filter
  const filteredReturns = salesReturns.filter((sale) => {
    const matchesSearch =
      sale.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle edit action
  const handleDetail = (sale) => {
    setCurrentReturn(sale);
    setIsModalVisible(true);
  };

  const handleAddSaleReturn = (sale) => {
    setLoading(true);
    setTimeout(() => {
      navigate("/sale-return/add");
      setLoading(false);
    }, 500); 
  };

  // Handle delete action
  const handleDelete = (returnId) => {
    setSalesReturns(salesReturns.filter((r) => r.key !== returnId));
    message.success(`Return ${returnId} deleted successfully`);
  };

  // Action menu for each row
  const menu = (sale) => (
    <Menu>
      <Menu.Item key="detail" icon={<EyeOutlined />} onClick={() => handleDetail(sale)}>
        View Detail
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(sale)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Are you sure to delete this return?"
          onConfirm={() => handleDelete(sale.key)}
          okText="Yes"
          cancelText="No"
        >
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: "Return ID",
      dataIndex: "returnId",
      key: "returnId",
      width: 150,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === "pending" ? "orange" : status === "approved" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#52c41a" }} />}
            onClick={() => handleEdit(record)}
          />
          <Dropdown overlay={menu(record)} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined style={{ color: "#52c41a" }} />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="sales-return-management">
      {/* Header */}
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: "#52c41a" }}>Sales Return Management</h1>
            <p>Manage sales returns and resolve issues</p>
          </div>
          <Button
          onClick={handleAddSaleReturn}
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Add Sale Return
          </Button>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="filter-card">
        <div className="filter-content">
          <Input
            placeholder="Search returns by ID, customer, or product..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <div className="filter-controls">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
            <Button onClick={() => message.info("Advanced filters coming soon!")} icon={<FilterOutlined />} style={{ color: "#52c41a", borderColor: "#52c41a" }}>
              Advanced Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Sales Return Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredReturns}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} returns`,
          }}
          scroll={{ x: 1200 }}
          bordered
          size="middle"
        />
      </Card>

      {/* Edit Sales Return Modal */}
      <Modal
        title="Edit Sales Return"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <p>Edit sales return details here...</p>
      </Modal>
    </div>
  );
};

export default SalesReturnTable;