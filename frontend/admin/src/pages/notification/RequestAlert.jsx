import React, { useState } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Popconfirm,
  message,
  Badge,
  notification,
  Input,
  Select
} from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const {Search} = Input ;
const { Option } = Select;

const RequestAlertNotification = () => {
      const [searchTerm, setSearchTerm] = useState("");
        const [statusFilter, setStatusFilter] = useState("all");
          const [categoryFilter, setCategoryFilter] = useState("all");
          const [typeFilter, setTypeFilter] = useState("all");
          const [currentProduct, setCurrentProduct] = useState(null);
          const [isModalVisible, setIsModalVisible] = useState(false);

  const [requests, setRequests] = useState([
    {
      key: "1",
      requestor: "John Doe",
      type: "Leave Request",
      date: "2023-10-15",
      status: "pending",
      description: "Requesting leave for personal reasons.",
    },
    {
      key: "2",
      requestor: "Jane Smith",
      type: "Expense Reimbursement",
      date: "2023-10-14",
      status: "pending",
      description: "Reimbursement for travel expenses.",
    },
    {
      key: "3",
      requestor: "Alice Johnson",
      type: "Equipment Request",
      date: "2023-10-13",
      status: "approved",
      description: "Requesting a new laptop for work.",
    },
  ]);

  // Open notification for pending requests
  const openNotification = () => {
    const pendingRequests = requests.filter((r) => r.status === "pending");
    if (pendingRequests.length > 0) {
      notification.open({
        message: `Pending Requests (${pendingRequests.length})`,
        description: "You have pending requests that require your attention.",
        icon: <ExclamationCircleOutlined style={{ color: "#f5222d" }} />,
        duration: 0,
        onClick: () => console.log("Notification Clicked"),
      });
    }
  };

  // Trigger approve action
  const handleApprove = (requestId) => {
    const updatedRequests = requests.map((r) =>
      r.key === requestId ? { ...r, status: "approved" } : r
    );
    setRequests(updatedRequests);
    message.success(`Request ${requestId} approved successfully`);
  };

  // Trigger reject action
  const handleReject = (requestId) => {
    const updatedRequests = requests.map((r) =>
      r.key === requestId ? { ...r, status: "rejected" } : r
    );
    setRequests(updatedRequests);
    message.error(`Request ${requestId} rejected`);
  };

  // Table columns
  const columns = [
    {
      title: "No",
      dataIndex: "key",
      key: "key",
      width: 50,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Requestor",
      dataIndex: "requestor",
      key: "requestor",
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 250,
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
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.key)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Approve
          </Button>
          <Popconfirm
            title="Are you sure to reject this request?"
            onConfirm={() => handleReject(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<CloseCircleOutlined />} danger>
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="request-alert-notification">
      {/* Header */}
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{ color: "#f5222d" }}>Request Alerts</h1>
            <p>Manage and respond to pending requests</p>
          </div>
          <Button
            type="primary"
            icon={<ExclamationCircleOutlined />}
            onClick={openNotification}
            style={{ backgroundColor: "#f5222d", borderColor: "#f5222d" }}
          >
            View Alerts ({requests.filter((r) => r.status === "pending").length})
          </Button>
        </div>
      </Card>
      <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search products by name, code or barcode..."
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
              style={{ width: 120 }}
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              placeholder="Category"
            >
              <Option value="all">All Categories</Option>
              <Option value="Electronics">Electronics</Option>
              <Option value="Clothing">Clothing</Option>
              <Option value="Home">Home</Option>
            </Select>

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

            <Button onClick={() => message.info("Advanced filters coming soon!")} icon={<FilterOutlined />} style={{ color: '#52c41a', borderColor: '#52c41a' }}>
              Advanced Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Request Alert Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={requests}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} requests`,
          }}
          scroll={{ x: 1000 }}
          bordered
          size="middle"
          rowClassName={(record) => (record.status === "pending" ? "pending-row" : "")}
        />
      </Card>
    </div>
  );
};

export default RequestAlertNotification;