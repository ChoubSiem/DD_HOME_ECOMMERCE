import React, { useEffect, useState } from 'react';
import { Form, Modal, Input, Select, DatePicker, Checkbox, message } from 'antd';
import { usePermission } from "../../../hooks/UsePermission";
const { Option } = Select;
import Cookies from "js-cookie"

const EmployeeModal = ({ 
  open, // Changed from visible to open
  onCancel, 
  onOk, 
  form, 
  currentUser, 
  permissionOptions 
}) => {
  const { handlePermission } = usePermission();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    fetchPermissionData();
  }, []);

  const fetchPermissionData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      const result = await handlePermission(token);
      
      if (result) {
        setPermissions(result.permissions || []);
      }
    } catch (error) {
      message.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={currentUser ? 'Edit Employee' : 'Add Employee'}
      open={open} // Changed from visible to open
      onOk={onOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select>
            <Option value="Admin">Admin</Option>
            <Option value="Editor">Editor</Option>
            <Option value="Viewer">Viewer</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="status" label="Status" valuePropName="checked">
          <Checkbox>Active</Checkbox>
        </Form.Item>
        
        <Form.Item name="gender" label="Gender">
          <Select>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
        </Form.Item>
        
        {permissions.length > 0 && (
          <Form.Item name="permissions" label="Permissions">
            <Select mode="multiple" loading={loading}>
              {permissions.map(option => (
                <Option key={option.id} value={option.id}>
                  {option.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item name="joinedDate" label="Joined Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item name="avatar" label="Avatar URL">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;