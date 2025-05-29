import React, { useState } from 'react';
import { Table, Button, Space, Input, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';

const MyTable = () => {
  // State for search functionality
  const [searchText, setSearchText] = useState('');

  // Columns configuration
  const columns = [
    {
      title: 'NO',
      dataIndex: 'no',
      key: 'no',
      sorter: (a, b) => a.no - b.no, // Add sorting
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date), // Add sorting
    },
    {
      title: 'Reference No',
      dataIndex: 'referenceNo',
      key: 'referenceNo',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text) => `$${text.toFixed(2)}`, // Format as currency
      sorter: (a, b) => a.totalPrice - b.totalPrice, // Add sorting
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (text) => `$${text.toFixed(2)}`, // Format as currency
    },
    {
      title: 'Sub Total',
      dataIndex: 'subTotal',
      key: 'subTotal',
      render: (text) => `$${text.toFixed(2)}`, // Format as currency
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (text) => `$${text.toFixed(2)}`, // Format as currency
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ), // Add color-coded tags for status
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleView(record)}>View</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Delete</Button>
        </Space>
      ), // Add action buttons
    },
  ];

  // Sample data
  const data = [
    {
      no: 1,
      date: '2023-10-01',
      referenceNo: 'REF123',
      customer: 'John Doe',
      totalPrice: 100.0,
      discount: 10.0,
      subTotal: 90.0,
      balance: 90.0,
      status: 'Pending',
    },
    {
      no: 2,
      date: '2023-10-02',
      referenceNo: 'REF456',
      customer: 'Jane Smith',
      totalPrice: 200.0,
      discount: 20.0,
      subTotal: 180.0,
      balance: 180.0,
      status: 'Paid',
    },
  ];

  // Filter data based on search text
  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
  ));

  // Action handlers
  const handleView = (record) => {
    console.log('View record:', record);
  };

  const handleDelete = (record) => {
    console.log('Delete record:', record);
  };

  return (
    <div>
      {/* Header with search and buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Space>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="primary" icon={<PlusOutlined />}>Add POS</Button>
          <Button icon={<SearchOutlined />}>Icon</Button>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        bordered
        pagination={{ pageSize: 5 }} // Add pagination
        rowKey="no" // Unique key for each row
      />
    </div>
  );
};

export default MyTable;