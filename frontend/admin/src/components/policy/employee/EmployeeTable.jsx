import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Avatar, Modal, Descriptions } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const EmployeeTable = ({ employees, onEdit, onDelete, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getRoleTag = (role) => {
    switch (role) {
      case "Admin":
        return <span style={{ color: "red", fontWeight: "bold" }}>{role}</span>;
      case "Editor":
        return <span style={{ color: "orange", fontWeight: "bold" }}>{role}</span>;
      case "Viewer":
        return <span style={{ color: "blue", fontWeight: "bold" }}>{role}</span>;
      default:
        return <span>{role}</span>;
    }
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "5%",
    },
    {
      name: "Profile",
      selector: (row) => row.profile,
      width: "10%",
      cell: (row) => (
        <Avatar
          src={row.profile ? `http://127.0.0.1:8000/storage/employee_images/${row.profile}` : "https://media.istockphoto.com/id/2173059563/vector/coming-soon-image-on-white-background-no-photo-available.jpg?s=612x612&w=0&k=20&c=v0a_B58wPFNDPULSiw_BmPyhSNCyrP_d17i2BPPyDTk="}
          size={50}
        />
      ),
    },
    {
      name: "Name",
      selector: (row) => row.username,
      sortable: true,
      width: "25%",
    },
    {
      name: "Role",
      selector: (row) => row.role_name,
      sortable: true,
      width: "10%",
      cell: (row) => getRoleTag(row.role_name),
    },
    {
      name: "Phone Number",
      selector: (row) => row.phone,
      sortable: true,
      width: "15%",
    },
    {
      name: "Last Online",
      selector: (row) =>
        row.last_online ? new Date(row.last_online).toLocaleString() : "Never",
      sortable: true,
      width: "20%",
    },
    {
      name: "Action",
      cell: (row) => (
        <div>
          <Button
            size="small"
            icon={<EditOutlined style={{ color: "green" }} />}
            onClick={() => onEdit(row)}
            style={{ marginRight: "8px", border: 'none' }}
          />
          <Button
            size="small"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onClick={() => onDelete(row)}
            style={{ border: 'none' }}
          />
        </div>
      ),
      ignoreRowClick: true,
      width: "15%",
    },
  ];

  const handleRowClick = (row) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
        cursor: "pointer",
      },
    },
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={employees}
        progressPending={loading}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
        striped
        customStyles={customStyles}
        onRowClicked={handleRowClick}
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            <span>Employee Details</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button 
            key="close" 
            onClick={handleCloseModal}
            style={{ padding: '0 24px', height: 32 }}
          >
            Close
          </Button>,
        ]}
        width="60%"
        styles={{
          body: {
            padding: '24px',
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start'
          },
          header: {
            borderBottom: '1px solid #f0f0f0',
            marginBottom: 0
          },
          footer: {
            borderTop: '1px solid #f0f0f0',
            paddingTop: '16px'
          }
        }}
      >
        {selectedEmployee && (
          <div style={{ display: 'flex', gap: 24, width: '100%' }}>
            <div style={{ flex: 1 }}>
              <Descriptions 
                bordered 
                column={1}
                labelStyle={{
                  width: '120px',
                  fontWeight: 600,
                  backgroundColor: '#fafafa'
                }}
                contentStyle={{
                  backgroundColor: '#fff'
                }}
              >
                <Descriptions.Item label="Name">
                  <span style={{ fontSize: 16 }}>{selectedEmployee.username}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  {getRoleTag(selectedEmployee.role_name)}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <span style={{ fontFamily: 'monospace' }}>{selectedEmployee.phone}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Last Online">
                  {selectedEmployee.last_online ? (
                    <span style={{ color: '#666' }}>
                      {new Date(selectedEmployee.last_online).toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Never</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <div style={{
              width: '40%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16
            }}>
              <Avatar
                src={selectedEmployee.profile ? 
                  `http://127.0.0.1:8000/storage/employee_images/${selectedEmployee.profile}` : 
                  null}
                icon={!selectedEmployee.profile ? <UserOutlined /> : null}
                size={200}
                style={{ 
                  backgroundColor: '#f0f2f5',
                  fontSize: 60,
                  border: '2px solid #d9d9d9'
                }}
              />
              <div style={{
                textAlign: 'center',
                fontWeight: 500,
                color: '#52c41a',
                fontSize: 20,
                marginTop: 8
              }}>
                {selectedEmployee.username}
              </div>
              <div style={{
                textAlign: 'center',
                color: '#666',
                fontSize: 16
              }}>
                {selectedEmployee.role_name}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default EmployeeTable;