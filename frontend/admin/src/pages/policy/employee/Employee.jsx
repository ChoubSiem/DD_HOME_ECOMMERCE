import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin,Space,Modal } from 'antd';
import EmployeeModal from '../../../components/policy/employee/EmployeeModal';
import { useUser } from '../../../hooks/UserUser';
import Toolbar from "../../../components/policy/employee/EmployeeToolbar";
import DataTable from '../../../components/policy/employee/EmployeeTable';
import Cookies from "js-cookie";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

const Employee = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(null); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);  
  const { handleEmployee,handleDeleteCustomer } = useUser();
  const token = localStorage.getItem("token");

  const fetchUsersData = async () => {
    try {
      const result = await handleEmployee(token);      
      setUsers(result.employees);
      setLoading(false);  
    } catch (error) {
      setLoading(false);
      message.error('Failed to fetch users.');
    }
  };


  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleAddEmployee = () => {
    setIsEditing(false); 
    navigate("/employee/create");
    setSelectedEmployee(null);
    setIsModalVisible(true);
  };
  
  const handleEditEmployee = (employee) => {
    setIsEditing(true); 
    navigate(`/employee/edit/${employee.id}`);
    setSelectedEmployee(employee); 
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSaveEmployee = (employeeData) => {
    console.log(employeeData);
    setIsModalVisible(false);
    fetchUsersData();
  };


const handleDeleteEmployee = (employeeId) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this employee?',
    content: 'This action cannot be undone.',
    okText: 'Yes, Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      const result = await handleDeleteCustomer(employeeId, token);
      if (result) {
        setUsers(users.filter(user => user.employeeId !== employeeId));
        message.success('Employee deleted successfully!');
        location.reload();
      } else {
        message.error('Failed to delete employee.');
      }
    },
  });
};

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading} tip="Loading...">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",marginBottom:'30px' }}>
          <div className="employee-header-content">
            <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Employee Management</h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
              Manage your Employee information
            </p>
          </div>
          <Button
          onClick={handleAddEmployee}
          type="primary">
           <PlusOutlined/> 
           Add Employee
          </Button>
        </div>
          <Space style={{marginBottom:'30px'}}>
            <Toolbar/>
          </Space>

          <DataTable
            employees={users}
            onEdit={handleEditEmployee}  
            onDelete={handleDeleteEmployee} 
          />
        {/* Employee Modal */}
        <EmployeeModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSave={handleSaveEmployee}
          initialData={selectedEmployee}  
        />
      </Spin>
    </div>
  );
};

export default Employee;
