import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Button, Tag, Space, Modal, Input, Select, Spin,Dropdown } from "antd";
import { EditOutlined, MoreOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import "./ProductTable.css";
import Cookies from "js-cookie";

const ProductTable = ({ products = [], handleEdit, handleDelete, onRowClick }) => {
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    cost: '',
    price: '',
    stock: '',
    status: '',
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(Cookies.get("user"));
  // Optimized filtering using useMemo
  const filteredData = useMemo(() => {
    return products.filter(item => {
      return (
        (!filters.name || item.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.category || item.category_name?.toLowerCase().includes(filters.category.toLowerCase())) &&
        (!filters.cost || String(item.cost).includes(filters.cost)) &&
        (!filters.price || String(item.price).includes(filters.price)) &&
        (!filters.stock || String(item.stock).includes(filters.stock)) &&
        (!filters.status || item.status?.toLowerCase().includes(filters.status.toLowerCase()))
      );
    });
  }, [products, filters]);

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const menu = (row) => ({
    items: [
      {
        key: 'view',
        label: (
          <span onClick={() => onRowClick(row)}>
            <EyeOutlined style={{ marginRight: 8 }} />
            View
          </span>
        ),
      },
      {
        key: 'delete',
        label: (
          <span onClick={() => handleDelete(row.id)}>
            <DeleteOutlined style={{ marginRight: 8, color: 'red' }} />
            Delete
          </span>
        ),
      },
    ],
  });

  const handleFilterChange = (value, column) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
    name: "Product Info",
      selector: row => row.name,
      cell: row => (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '12px' }}>
          <div>
            <strong className="khmer-text">{row.name}</strong>
            <div style={{ fontSize: 12.5, color: "#999" }}>Code: {row.code}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Category",
      selector: row => row.category_name,
      sortable: true,
      width: "150px",
    },
    {
      name: "Cost/Branch Price",
      cell: row => (
        <div>
          <div>Cost: ${row.cost}</div>
          <div>{userData.warehouse_id ==null?'Branch Price':'Price'}: ${row.price}</div>
          {row.discount > 0 && <div style={{ color: '#f5222d' }}>Discount: {row.discount}%</div>}
        </div>
      ),
      width: "180px",
      sortable: true,
    },
    {
      name: "Stock",
      cell: row => {
        const color =
          row.stock > row.alert_qty 
            ? "#52c41a"
            : row.stock > 0
            ? "#faad14"
            : "#f5222d";

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                backgroundColor: `${color}20`,
                color,
                padding: "4px 12px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textAlign: "center",
              }}>
                {`${row.stock ?? 0} ${row.units ?? ''}`}
              </div>
              <span style={{ fontSize: 13, color: "#595959" }}>stock</span>
            </div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>
              Alert at: <strong style={{ color: "#262626" }}>{row.alert_qty ?? 0}</strong>
            </div>
          </div>
        );
      },
      width: "120px",
      sortable: true,
    },
    {
      name: "Draft Status",
      cell: row => (
        <Tag color={row.is_draft ? 'red' : 'green'}>
          {row.is_draft ? 'Draft' : 'Published'}
        </Tag>
      ),
      width: "100px",
      sortable: true,
    },
    {
      name: "Status",
      cell: row => (
        <Tag color={row.status === 'active' ? 'green' : 'red'}>
          {row.status}
        </Tag>
      ),
      width: "60px",
    },
    {
      name: "Actions",
      cell: row => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#52c41a' }} />}
            onClick={() => handleEdit(row.id)}
          />
          <Dropdown
            trigger={['click']}
            menu={menu(row)}
            overlayClassName="action-dropdown"
          >
            <Button type="text" icon={<MoreOutlined style={{ color: '#52c41a' }} />} />
          </Dropdown>
        </Space>
      ),
      width: "90px",
    }
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#52c41a",
        color: "white",
        fontWeight: "bold",
        position: "sticky",
        top: 0,
        zIndex: 1,
        border: "1px solid black",
        padding: 0,
        display: "flex",
        justifyContent: "center",
      },
    },
    cells: {
      style: {
        padding: '8px',
      },
    },
    progress: {
      style: {
        display: 'none', // Hide default loading indicator
      },
    },
  };

  const handlePageSizeChange = (currentRowsPerPage) => {
    setLoading(true);
    setPageSize(currentRowsPerPage);    
    setTimeout(() => setLoading(false), 0);
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    products.forEach(product => {
      if (product.category_name) {
        categories.add(product.category_name);
      }
    });
    return Array.from(categories);
  }, [products]);

  return (
    <>
      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <Spin size="large" tip="Loading..." />
          </div>
        )}
        
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClicked={onRowClick}
          pagination
          paginationPerPage={pageSize}
          paginationRowsPerPageOptions={[10, 20, 50, 100, filteredData.length]}
          onChangeRowsPerPage={handlePageSizeChange}
          highlightOnHover
          pointerOnHover
          responsive
          persistTableHead
          defaultSortFieldId={1}
          customStyles={customStyles}
          fixedHeader
          fixedHeaderScrollHeight="calc(100vh - 200px)"
          progressPending={loading}
          progressComponent={<div style={{ padding: '24px' }}><Spin size="large" /></div>}
          noDataComponent={<div style={{ padding: '24px', textAlign: 'center' }}>No products found</div>}
        />
      </div>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ProductTable;