import React, { useState,useRef } from "react";
import DataTable from "react-data-table-component";
import { Avatar, Button, Dropdown, Tag, Space, Modal ,Input, Select } from "antd";
import { EditOutlined, MoreOutlined, ShoppingCartOutlined,EyeOutlined ,DeleteOutlined  } from "@ant-design/icons";
import "./ProductTable.css";
const ProductTable = ({ products = [], handleEdit , handleDelete,onRowClick}) => {
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    cost: '',
    price: '',
    stock: '',
    type: '',
    sales: '',
    status: '',
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };


  const [previewImage, setPreviewImage] = useState('');

  const menu = (row) => ({
    items: [
      {
        key: 'view',
        label: (
          <span onClick={() => viewRow(row)}>
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
    setFilters({ ...filters, [column]: value });
  };

  const filteredData = products.filter(item => {    
    return (
      (!filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.category || item.category_name?.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!filters.cost || item.cost.toString().includes(filters.cost)) &&
      (!filters.price || item.price.toString().includes(filters.price)) &&
      (!filters.stock || item.stock.toString().includes(filters.stock)) &&
      (!filters.type || item.type.toLowerCase().includes(filters.type.toLowerCase())) &&
      (!filters.sales || item.sales.toString().includes(filters.sales)) &&
      (!filters.status || item.status.toLowerCase().includes(filters.status.toLowerCase()))
    );
  });

  
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Product Info",
      selector: row => row.name,
      cell: row => {
              return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              gap: '12px',
            }}
          >
            
            <div>
              <strong>{row.name}</strong>
              <div style={{ fontSize: 12.5, color: "#999" }}>Code: {row.code}</div>
            </div>
          </div>
        );
      },
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
          <div>Branch Price: ${row.price}</div>
          {row.discount > 0 && <div style={{ color: '#f5222d' }}>Discount: {row.discount}%</div>}
        </div>
      ),
      width: "180px",
      sortable: true,
    },
    {
      name: "Stock",
      selector: row => row.stock,
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
              <div
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  padding: "4px 12px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
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
      selector: row => row.is_draft,
      cell: row => (
        <Tag color={row.is_draft ? 'red' : 'green'}>
          {row.is_draft ? 'Draft' : 'Published'}
        </Tag>
      ),
      width: "100px",
      sortable: true,
    },
    // {
    //   name: "Sales",
    //   selector: row => row.sales,
    //   cell: row => <Tag color="blue">{row.sales ?? 0}</Tag>,
    //   sortable: true,
    //   width: "50px",
    // },
    {
      name: "Status",
      selector: row => row.status,
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
            menu={typeof menu === 'function' ? menu(row) : { items: [] }}
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
  }


  const customFooter = () => {
    return (
      <tr>
        <td>
          <Input
            placeholder="Search Name"
            value={filters.name}
            onChange={(e) => handleFilterChange(e.target.value, 'name')}
          />
        </td>
        <td>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Category"
            value={filters.category}
            onChange={(value) => handleFilterChange(value, 'category')}
          >
            <Select.Option value="">All</Select.Option>
            <Select.Option value="Electronics">Electronics</Select.Option>
            <Select.Option value="Clothing">Clothing</Select.Option>
            <Select.Option value="Home">Home</Select.Option>
          </Select>
        </td>
        <td>
          <Input
            placeholder="Search Cost"
            value={filters.cost}
            onChange={(e) => handleFilterChange(e.target.value, 'cost')}
          />
        </td>
        <td>
          <Input
            placeholder="Search Price"
            value={filters.price}
            onChange={(e) => handleFilterChange(e.target.value, 'price')}
          />
        </td>
        <td>
          <Input
            placeholder="Search Stock"
            value={filters.stock}
            onChange={(e) => handleFilterChange(e.target.value, 'stock')}
          />
        </td>
        <td>
          <Input
            placeholder="Search Type"
            value={filters.type}
            onChange={(e) => handleFilterChange(e.target.value, 'type')}
          />
        </td>
        <td>
          <Input
            placeholder="Search Sales"
            value={filters.sales}
            onChange={(e) => handleFilterChange(e.target.value, 'sales')}
          />
        </td>
        <td>
          <Input
            placeholder="Search Status"
            value={filters.status}
            onChange={(e) => handleFilterChange(e.target.value, 'status')}
          />
        </td>
      </tr>
    );
  };
  

  return (
    <>
    {loading ? (
  <div className="spinner-container">
    <div className="loader">Loading...</div>
  </div>
  ) : (
    <DataTable
    columns={columns}
    data={filteredData}
    onRowClicked={onRowClick}
    pagination
    paginationPerPage={pageSize}
    paginationRowsPerPageOptions={[10, 20, 50, products.length, 5000]}
    onChangeRowsPerPage={(currentRowsPerPage) => {
      setLoading(true);
      setPageSize(currentRowsPerPage);
      setTimeout(() => setLoading(false), 500);
    }}
    highlightOnHover
    pointerOnHover
    responsive
    persistTableHead
    defaultSortFieldId={1}
    customStyles={customStyles}
    footer={<thead>{customFooter()}</thead>}
    style={{ tableLayout: 'fixed' }}
    
    fixedHeader
    fixedHeaderScrollHeight="1000px"
    />

 )}


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
