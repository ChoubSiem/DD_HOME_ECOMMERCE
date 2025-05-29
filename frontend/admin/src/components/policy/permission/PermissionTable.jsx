// components/policy/permission/PermissionTable.jsx
import React from "react";
import DataTable from "react-data-table-component";
import { Button  } from "antd";
import { EditOutlined } from "@ant-design/icons"; 


const PermissionTable = ({ permissions, onEdit, loading }) => {
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "10%",
    },
    {
      name: "Permission Name",
      selector: (row) => row.name,
      sortable: true,
      width: "40%",

    },
    {
      name: "Group",
      selector: (row) => row.group,
      sortable: true,
      width: "40%",

    },
    {
      name: "Action",
      cell: (row) => (
        <Button size="small" icon={<EditOutlined style={{border:'none',color:'green'}} />} onClick={() => onEdit(row)}>
          
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
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
    rows: {
      style: {
        borderBottom: "none", 
      },
    },
  };
  

  return (
    <DataTable
      columns={columns}
      data={permissions}
      progressPending={loading}
      pagination
      highlightOnHover
      pointerOnHover
      responsive
      striped
      customStyles = {customStyles}
    />
  );
};

export default PermissionTable;
