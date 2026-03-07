import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  message,
  Typography,
  Row,
  Col,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import CreateCustomer from '../../components/customer/CreateCustomer';
import CustomerModal from '../../components/customer/EditCustomerModal';
import CustomerImport from '../../components/customer/ImportCustomer';
import { useUser } from '../../hooks/UserUser';
import { usePolicy } from '../../hooks/usePolicy';

const { Title, Text } = Typography;
const { Search } = Input;

const Customer = () => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(Cookies.get('user') || '{}');

  const {
    handleCustomerCreate,
    handleCustomers,
    handleGetCustomerGroup,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleImportCustomer,
  } = useUser();

  const { handleRolePermission } = usePolicy();

  // States
  const [customers, setCustomers] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Permissions (add more as needed: update, delete, export...)
  const canCreate = permissions.some(p => p.name === 'Customer.create');
  const canImport = permissions.some(p => p.name === 'Customer.import');
  const canUpdate = permissions.some(p => p.name === 'Customer.update');
  const canDelete = permissions.some(p => p.name === 'Customer.delete');

  // ── Data Fetching ────────────────────────────────────────
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await handleCustomers(token);
      console.log(res);

      if (res?.success) {
        setCustomers(res.customers || []);
      } else {
        message.error(res?.message || 'Failed to load customers');
      }
    } catch (err) {
      message.error('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await handleGetCustomerGroup(token);
      if (res?.success) setCustomerGroups(res.groups || []);
    } catch (err) {
      console.error('Groups failed', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await handleRolePermission(userData?.role_id);
      if (res.success) setPermissions(res.rolePermissions || []);
    } catch (err) {
      console.error('Permissions failed', err);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchCustomers();
    fetchGroups();
  }, []);

  // ── Filtering (client-side search) ───────────────────────
  const filteredCustomers = useMemo(() => {
    if (!searchText.trim()) return customers;
    const term = searchText.toLowerCase();
    return customers.filter(c =>
      [c.username, c.phone, c.fullName, c.jobTitle]
        .some(v => v?.toLowerCase().includes(term))
    );
  }, [customers, searchText]);

  const handleImport = async (values) => {
    setLoading(true);
    try {
      const res = await handleImportCustomer(values, token);
      if (res?.success) {
        message.success(res.message || 'Customers imported successfully');
        setImportVisible(false);
        await fetchCustomers();
      } else {
        message.error(res?.message || 'Import failed');
      }
    } catch (error) {
      message.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Export to Excel ──────────────────────────────────────
  const exportToExcel = () => {
    if (!filteredCustomers.length) {
      message.warning('No customers to export');
      return;
    }

    const data = filteredCustomers.map(c => ({
      Code: c.customer_code || '-',
      Username: c.username || '-',
      Phone: c.phone || '-',
      'Job Title': c.job || '-',
      Address: c.address || '-',
      Group: c.group_name || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    ws['!cols'] = [
      { wch: 24 }, { wch: 18 }, { wch: 32 },
      { wch: 16 }, { wch: 22 }, { wch: 20 },
    ];

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);

    message.success('Export completed');
  };

  // ── CRUD Handlers ────────────────────────────────────────
  const handleSave = async (values, isEdit = false, id = null) => {
    setLoading(true);
    try {
      const fn = isEdit ? handleUpdateCustomer : handleCustomerCreate;
      const res = await fn(isEdit ? id : values, isEdit ? values : token, token);

      if (res?.success) {
        message.success(isEdit ? 'Updated successfully' : 'Created successfully');
        fetchCustomers();
        if (isEdit) setEditVisible(false);
        else setCreateVisible(false);
      } else {
        message.error(res?.message || 'Operation failed');
      }
    } catch (err) {
      message.error('Save error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await handleDeleteCustomer(id, token);
      if (res?.success) {
        message.success('Customer deleted successfully');
        fetchCustomers();
      } else {
        message.error(res?.message || 'Delete failed');
      }
    } catch (err) {
      message.error('Delete error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Table Columns ────────────────────────────────────────
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => (a.customer_code || '').localeCompare(b.customer_code || ''),
      render: (_, r) => r.customer_code || '-',
      width: 180,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
      width: 140,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
      width: 220,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Job',
      dataIndex: 'job',
      key: 'job',
      width: 140,
    },
    {
      title: 'Group',
      key: 'group_name',
      render: (_, r) => {
        return r.group_name ? <Tag color="blue">{r.group_name}</Tag> : '-';
      },
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          {/* {canUpdate && ( */}
            <Tooltip title="Edit Customer">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedCustomer(record);
                  setEditVisible(true);
                }}
              />
            </Tooltip>
          {/* )} */}
          {canDelete && (
            <Tooltip title="Delete Customer">
              <Popconfirm
                title="Are you sure you want to delete this customer?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '16px 24px', background: '#f5f7fa', minHeight: '100vh' }}
    >
      {/* Header Card */}
      <Card
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Row justify="space-between" align="middle" gutter={16}>
          <Col>
            <Space align="center">
              <Title level={4} style={{ margin: 0, color: '#1f2a44' }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Customer Management
              </Title>
            </Space>
          </Col>

          <Col>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCustomers}
                loading={loading}
              >
                Refresh
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                disabled={loading || !filteredCustomers.length}
              >
                Export Excel
              </Button>

              {canImport && (
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportVisible(true)}
                >
                  Import
                </Button>
              )}

              {canCreate && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateVisible(true)}
                >
                  Add Customer
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filter + Table Card */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 16, maxWidth: 500 }}>
          <Search
            placeholder="Search by name, username, phone..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onSearch={setSearchText}
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredCustomers}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: total => `Total ${total} customers`,
          }}
          scroll={{ x: 1300 }}
          bordered
        />
      </Card>

      {/* Modals */}
      <CreateCustomer
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSave={values => handleSave(values, false)}
        customerGroups={customerGroups}
      />

      <CustomerModal
        visible={editVisible}
        onCancel={() => {
          setEditVisible(false);
          setSelectedCustomer(null);
        }}
        initialData={selectedCustomer}
        onSave={values => handleSave(values, true, selectedCustomer?.id)}
        customerGroups={customerGroups}
        isEditing={editVisible}

      />

      <CustomerImport
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        onImport={handleImport}
      />
    </motion.div>
  );
};

export default Customer;