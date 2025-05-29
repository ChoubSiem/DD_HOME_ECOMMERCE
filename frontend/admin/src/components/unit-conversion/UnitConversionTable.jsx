import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const UnitConversionTable = ({ 
  conversions, 
  onDelete,
  onEdit
}) => {  
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "From Unit",
      selector: (row) => row.from_unit.name,
      cell: (row) => <Tag color="blue">{row.from_unit.name}</Tag>,
      sortable: true,
      width: "150px",
    },
    {
      name: "To Unit",
      selector: (row) => row.to_unit.name,
      cell: (row) => <Tag color="green">{row.to_unit.name}</Tag>,
      sortable: true,
      width: "150px",
    },
    {
      name: "Conversion",
      selector: (row) => row.conversion_rate,
      cell: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.conversion_rate} {row.from_unit.name} {"="} 1 {row.to_unit.name}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      cell: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.description}
        </span>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(row)}
            />

          <Popconfirm
            title="Are you sure to delete this conversion?"
            onConfirm={() => onDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      ignoreRowClick: true,
      width: "120px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#52c41a",
        color: "white",
        fontWeight: "bold",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={conversions}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No conversion rules found.
        </div>
      }
      customStyles={customStyles}
    />
  );
};

export default UnitConversionTable;