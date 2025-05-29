import React from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const RegionalTable = ({ brands, setCurrentBrand, setIsModalVisible, handleDelete }) => {
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
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      width: "30%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentBrand(row);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title= "Are you sure to delete this regional?" 
            onConfirm={() => handleDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
      data={brands}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 20, 50]}
      highlightOnHover
      persistTableHead
      pointerOnHover
      responsive
      noDataComponent={
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          🚫 No brand found.
        </div>
      }
      customStyles={customStyles} 
    />
  );
};

export default RegionalTable;