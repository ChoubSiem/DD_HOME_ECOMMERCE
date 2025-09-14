import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const RegionalTable = ({ units, setCurrentUnit, setIsModalVisible, handleDelete, permissions }) => {
  const hasUnitEditPermission = permissions.some(
    (p) => p.name === "Unit.edit"
  );
  const hasUnitDeletePermission = permissions.some(
    (p) => p.name === "Unit.delete"
  );
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
      width: "40%",
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      width: "30%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          {hasUnitEditPermission && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentUnit(row);
              setIsModalVisible(true);
            }}
          />
          )}
          {hasUnitDeletePermission && (
          <Popconfirm
            title= "Are you sure to delete this unit?" 
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
      width: "20%",
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
      data={units}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No unit found.
        </div>
      }
      customStyles={customStyles} 
    />
  );
};

export default RegionalTable;