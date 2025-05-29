import React, { useState, useEffect } from 'react';
import { Card, Modal, message, Divider, Spin, Form  } from 'antd';
import RoleToolbar from '../../../components/policy/role/RoleFilterBar';
import RoleTable from '../../../components/policy/role/RoleTable';
import RoleModal from '../../../components/policy/role/RoleFormModal';
import RoleWithPermission from '../../../components/policy/role/RoleWithPermissionTable';
import './Role.css';
import {usePolicy} from "../../../hooks/usePolicy";
import { useNavigate } from 'react-router-dom';
import { color } from 'framer-motion';
const Role = () => {
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate ();
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [roleWithPermission, setRoleWithPermission] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const {handleRoles,handleRoleCreate,handleRoleUpdate,handleRoleDelete,handleRoleHasPermission} = usePolicy();
  const token = localStorage.getItem("token");

  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        fetchRoleData();
        fetchRoleHasPermission();
        setLoading(false);
    }, 800);
  }, []);

  const fetchRoleData = async() =>{

    let result = await handleRoles(token);
    console.log(result);
    
    
    setRoles(result.roles);
  }

  
  const fetchRoleHasPermission = async() =>{
    let result = await handleRoleHasPermission();    
    setRoleWithPermission(result.rolePermissions.rolePermissions);
  }
  useEffect(() => {
    let filtered = [...roles];
    
    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    switch (activeTab) {
      case 'OC':
        filtered = filtered.filter(role => !role.is_active);
        break;
      case 'withPermission':
        filtered = filtered.filter(role => role.permissions?.length > 0);
        break;
      default: 
    }


    
    setFilteredRoles(filtered);
  }, [searchTerm, activeTab, roles]);

  const showModal = (role = null) => {
    setCurrentRole(role);
    form.resetFields();
    if (role) {
      form.setFieldsValue({
        name: role.name,
      });
    }
    setIsModalVisible(true);
  };
  const editRolePermission = (id) => {
    navigate(`/role/permission/edit/${id}`);
  };
  
  const handleSave = async (values) => {
    const isUpdate = currentRole !== null;
    let result;
  
    try {
      if (isUpdate) {        
        result = await handleRoleUpdate(currentRole.id, values, token);
  
        if (result?.success) {
          message.success(result.message || "Role updated successfully");
  
          setRoles((prev) =>
            prev.map((role) =>
              role.id === result.role.id ? result.role : role
            )
          );
        } else {
          message.error(result?.message || "Failed to update role");
        }
      } else {
        result = await handleRoleCreate(values, token);
        if (result?.success) {
          message.success(result.message || "Role created successfully");
          setRoles((prev) => [...prev, result.role]);
        } else {
          message.error(result?.message || "Failed to create role");
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      message.error("Something went wrong");
    } finally {
      setIsModalVisible(false);
      setCurrentRole(null);
    }
  };
  

  const handleDelete = async (roleId) => {
    try {
      setLoading(true);
     let result = await handleRoleDelete(roleId,token);
     if (result) {
       setTimeout(() => {
         setRoles(roles.filter(role => role.id !== roleId));
         message.success('Role deleted successfully');
         setLoading(false);
       }, 500);
      
     }
    } catch (error) {
      message.error('Failed to delete role');
      setLoading(false);
    }
  };

  const toggleStatus = async (roleId, currentStatus) => {
    try {
      setLoading(true);
      setTimeout(() => {
        setRoles(roles.map(role => 
          role.id === roleId ? {...role, is_active: !currentStatus} : role
        ));
        message.success(`Role ${currentStatus ? 'deactivated' : 'activated'}`);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('Failed to change status');
      setLoading(false);
    }
  };

  return (
    <div className="role-management">
      <Card 
        title={
          <div className="card-header" style={{display:'block'}}>
            <h2 style={{color:"#52c41a",fontSize:"30px",padding:"10px"}}>Role Management</h2>
            <span >Manage system access levels and permissions</span>
          </div>
        }
        className="role-card"
        style={{borderRadius:0}}
      >
        <RoleToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreate={() => showModal()}
            canCreate={true}
          />

        <Divider />
          <Spin spinning={loading}>
            {activeTab === 'withPermission' ? (
              <RoleWithPermission
                data={roleWithPermission}
                loading={loading}
                editRolePermission={editRolePermission}
                onDelete={handleDelete}
                onStatusChange={toggleStatus}
              />
            ) : (
              <RoleTable
                data={filteredRoles}
                loading={loading}
                onEdit={showModal}
                onDelete={handleDelete}
                onStatusChange={toggleStatus}
              />
            )}
          </Spin>
        <Divider />
        <RoleModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          currentRole={currentRole}
          handleSave={handleSave}
        />
      </Card>
    </div>
  );
};

export default Role;