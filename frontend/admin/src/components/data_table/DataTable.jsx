import React from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import './DataTable.css';

const DataTable = ({ data }) => {
  // Define columns for the table
  const columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      sorter: (a, b) => a.month.localeCompare(b.month),
    },
    {
      title: 'Sales ($)',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Expenses ($)',
      dataIndex: 'expenses',
      key: 'expenses',
      sorter: (a, b) => a.expenses - b.expenses,
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Customers',
      dataIndex: 'customers',
      key: 'customers',
      sorter: (a, b) => a.customers - b.customers,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'Profit ($)',
      key: 'profit',
      render: (_, record) => `$${(record.sales - record.expenses).toLocaleString()}`,
      sorter: (a, b) => (a.sales - a.expenses) - (b.sales - b.expenses),
    },
    {
      title: 'Profit Margin',
      key: 'margin',
      render: (_, record) => `${((record.sales - record.expenses) / record.sales * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div className="data-table-container">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="month"
        pagination={{ pageSize: 6 }}
        bordered
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
      expenses: PropTypes.number.isRequired,
      customers: PropTypes.number.isRequired,
      orders: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default DataTable;