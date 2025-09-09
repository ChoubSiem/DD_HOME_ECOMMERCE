import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const RegionalTable = ({ regionals, handleEdit, handleDelete, permissions}) => {
  const hasRegionalPermissionEdit = permissions.some(
      (p) => p.name === "Regional.edit"
    );
  const hasRegionalPermissionDelete = permissions.some(
      (p) => p.name === "Regional.delete"
    );
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "10%",
    },
    {
      name: "Regional",
      selector: (row) => row.name,
      sortable: true,
      width: "15%",
    },
    {
      name: "Regional Manager",
      selector: (row) => row.regional_manager?.username || null,
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
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
      width: "15%",
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
          {hasRegionalPermissionEdit && (
          <Button icon={<EditOutlined />} onClick={() => handleEdit(row)} />
          )}
          {hasRegionalPermissionDelete && (
          <Popconfirm
            title="Are you sure you want to delete this regional?"
            onConfirm={() => handleDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          )}
        </Space>
      ),
      ignoreRowClick: true,
      width: "10%",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#52c41a",
        color: "white",
        fontWeight: "bold",
      },
    },
  };


  return (
    <DataTable
      columns={columns}
      data={regionals}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No regional found.
        </div>
      }
      customStyles={customStyles}
    />
  );
};

export default RegionalTable;
