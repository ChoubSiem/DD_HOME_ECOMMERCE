import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined,CheckOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const WarehouseTable = ({ warehouses, setCurrentWarehouse, setIsModalVisible, handleEdit,handleDelete,handleWarehouseProduct }) => {
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "10%",
    },
    {
      name: "Warehouse",
      selector: (row) => row.warehouse_name,
      sortable: true,
      width: "15%",
    },
    {
      name: "Warehouse Manager",
      selector: (row) => row.manager_name,
      sortable: true,
      width: "10%",
    },
    {
      name: "Regional",
      selector: (row) => row.regional_name,
      sortable: true,
      width: "10%",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
      width: "15%",
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      width: "10%",
    },
    {
      name: "Last Updated",
      selector: (row) => row.updated_at,
      sortable: true,
      width: "15%",
      cell: (row) => formatDateTime(row.updated_at),
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{color:"#389e0d"}}/>}
            onClick={() => handleEdit(row)}
          />
          <Button
            type="text"
            icon={<CheckOutlined style={{color:"#389e0d"}}/>}
            onClick={() => handleWarehouseProduct(row)}
          />
          <Popconfirm
            title="Are you sure to delete this regional?"
            onConfirm={() => handleDelete(row.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      ignoreRowClick: true,
      width: "15%",
    },
  ];
  
  

  const customStyles = {
    headCells: {
      style: {
        width:'100%',
        backgroundColor: "#52c41a",
        color: "white", 
        fontWeight: "bold",
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={warehouses}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No warehouse found.
        </div>
      }
      customStyles={customStyles} 
    />
  );
};

export default WarehouseTable;