import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined,CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const RegionalTable = ({ categories, setCurrentCategories, setIsModalVisible, handleDelete }) => {
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "10%",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "20%",
    },
    {
      name: "Product (Count)",
      selector: (row) => row.products_count,
      sortable: true,
      width: "15%",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      width: "20%",
    },
    {
      name: "Status",
      selector: (row) => row.is_active,
      sortable: true,
      width: "10%",
      cell: (row) => (
        <Tag
        icon={row.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        color={row.is_active ? "success" : "error"}
        style={{ fontWeight: "bold", textTransform: "capitalize" }}
      >
        {row.is_active ? "Active" : "Inactive"}
      </Tag>
      ),
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
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentCategories(row);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this category?"
            onConfirm={() => handleDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      ignoreRowClick: true,
      width: "10%",
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
      data={categories}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No category found.
        </div>
      }
      customStyles={customStyles} 
    />
  );
};

export default RegionalTable;