import React, { useState } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Select,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "./Grade.css";

const { Search } = Input;
const { Option } = Select;

const ServiceGradeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentGrade, setCurrentGrade] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sample service grade/level data
  const [grades, setGrades] = useState([
    {
      key: "1",
      name: "Basic",
      description: "Entry-level service with essential features.",
      priority: "low",
      status: "active",
      lastUpdated: "2023-05-15",
    },
    {
      key: "2",
      name: "Standard",
      description: "Mid-tier service with additional features.",
      priority: "medium",
      status: "active",
      lastUpdated: "2023-05-14",
    },
    {
      key: "3",
      name: "Premium",
      description: "High-tier service with advanced features.",
      priority: "high",
      status: "inactive",
      lastUpdated: "2023-05-13",
    },
  ]);

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || grade.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (grade) => {
    setCurrentGrade(grade);
    setIsModalVisible(true);
  };

  const handleDelete = (gradeId) => {
    setGrades(grades.filter((g) => g.key !== gradeId));
    message.success(`Service Grade ${gradeId} deleted successfully`);
  };

  const handleSave = (values) => {
    const updatedGrades = grades.map((g) =>
      g.key === currentGrade.key ? { ...g, ...values } : g
    );
    setGrades(updatedGrades);
    setIsModalVisible(false);
    message.success("Service Grade updated successfully");
  };

  const menu = (grade) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(grade)}>
        Edit
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Are you sure to delete this service grade?"
          onConfirm={() => handleDelete(grade.key)}
          okText="Yes"
          cancelText="No"
        >
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "No",
      dataIndex: "key",
      key: "key",
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div className="grade-cell">
          <strong>{text}</strong>
          <span>{record.description}</span>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 150,
      filters: [
        { text: "Low", value: "low" },
        { text: "Medium", value: "medium" },
        { text: "High", value: "high" },
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      width: 150,
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Dropdown overlay={menu(record)} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  function getStatusColor(status) {
    const colors = {
      active: "green",
      inactive: "red",
    };
    return colors[status] || "gray";
  }

  function getPriorityColor(priority) {
    const colors = {
      low: "blue",
      medium: "orange",
      high: "purple",
    };
    return colors[priority] || "gray";
  }

  return (
    <div className="service-grade-management">
      {/* Header */}
      <Card className="header-card">
        <div className="header-content">
          <div>
            <h1 style={{color:'#52c41a',fontSize:'23px'}}>Service Grade/Level Management</h1>
            <p>Manage your service tiers or levels</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Service Grade
          </Button>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search service grades..."
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
              style={{ width: 180 }}
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

          </div>
        </div>
      </Card>

      {/* Service Grade Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredGrades}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} service grades`,
          }}
          scroll={{ x: 1000 }}
          bordered
          size="middle"
          rowClassName={(record) => `grade-row ${record.status}`}
        />
      </Card>

      {/* Edit Service Grade Modal */}
      <Modal
        title="Edit Service Grade"
        visible={isModalVisible && currentGrade !== null}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentGrade(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={currentGrade}
          onFinish={handleSave}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Service Grade Name" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Service Grade Description" />
          </Form.Item>
          <Form.Item label="Priority" name="priority" rules={[{ required: true }]}>
            <Select placeholder="Select Priority">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select placeholder="Select Status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceGradeTable;