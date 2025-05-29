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
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "./GroupSupplier.css";

const { Search } = Input;
const { Option } = Select;

const SupplierGroupTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentGroup, setCurrentGroup] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Sample supplier group data
  const [groups, setGroups] = useState([
    {
      key: "1",
      name: "Electronics Suppliers",
      description: "Suppliers specializing in electronics.",
      region: "North America",
      status: "active",
      lastUpdated: "2023-05-15",
    },
    {
      key: "2",
      name: "Fashion Suppliers",
      description: "Suppliers specializing in fashion products.",
      region: "Europe",
      status: "inactive",
      lastUpdated: "2023-05-14",
    },
  ]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddGroup = () => {
    setCurrentGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (group) => {
    setCurrentGroup(group);
    form.setFieldsValue(group);
    setIsModalVisible(true);
  };

  const handleDelete = (groupId) => {
    setGroups(groups.filter((g) => g.key !== groupId));
    message.success("Supplier group deleted successfully");
  };

  const handleSave = (values) => {
    if (currentGroup) {
      // Edit existing group
      const updatedGroups = groups.map((g) =>
        g.key === currentGroup.key ? { 
          ...g, 
          ...values, 
          lastUpdated: new Date().toISOString().split('T')[0] 
        } : g
      );
      setGroups(updatedGroups);
      message.success("Supplier group updated successfully");
    } else {
      // Add new group
      const newGroup = {
        ...values,
        key: (groups.length + 1).toString(),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setGroups([...groups, newGroup]);
      message.success("Supplier group added successfully");
    }
    setIsModalVisible(false);
  };

  const menu = (group) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(group)}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Are you sure to delete this supplier group?"
          onConfirm={() => handleDelete(group.key)}
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
      title: "Group Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div className="supplier-group-cell">
          <strong>{text}</strong>
          <span>{record.description}</span>
        </div>
      ),
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 150,
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
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
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
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Dropdown overlay={menu(record)} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="supplier-group-management">
      {/* Header */}
      <Card className="supplier-group-header-card">
        <div className="supplier-group-header-content">
          <div>
            <h1 style={{color:'#52c41a',fontSize:'23px'}}>Supplier Group Management</h1>
            <p>Organize your suppliers into groups</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddGroup}
          >
            Add Supplier Group
          </Button>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="supplier-group-filter-card">
        <div className="supplier-group-filter-content">
          <Search
            placeholder="Search supplier groups..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <div className="supplier-group-filter-controls">
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

      {/* Supplier Group Table */}
      <Card className="supplier-group-table-card">
        <Table
          columns={columns}
          dataSource={filteredGroups}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            defaultPageSize: 10,
            showTotal: (total) => `Total ${total} supplier groups`,
          }}
          scroll={{ x: 1000 }}
          bordered
          size="middle"
          rowClassName={(record) => `supplier-group-row supplier-group-row-${record.status}`}
        />
      </Card>

      {/* Supplier Group Modal */}
      <Modal
        title={currentGroup ? "Edit Supplier Group" : "Add Supplier Group"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <Form.Item 
            label="Group Name" 
            name="name" 
            rules={[{ required: true, message: 'Please input supplier group name!' }]}
          >
            <Input placeholder="Supplier Group Name" />
          </Form.Item>
          
          <Form.Item 
            label="Description" 
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Supplier Group Description (optional)" />
          </Form.Item>
          
          <Form.Item 
            label="Region" 
            name="region" 
            rules={[{ required: true, message: 'Please select region!' }]}
          >
            <Select placeholder="Select Region">
              <Option value="North America">North America</Option>
              <Option value="Europe">Europe</Option>
              <Option value="Asia">Asia</Option>
              <Option value="Africa">Africa</Option>
              <Option value="South America">South America</Option>
              <Option value="Australia">Australia</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Status" 
            name="status" 
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select Status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentGroup ? 'Update Supplier Group' : 'Add Supplier Group'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierGroupTable;