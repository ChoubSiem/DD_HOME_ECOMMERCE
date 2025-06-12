import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, message, Button, Select, Checkbox } from 'antd';
import { FiX, FiSave, FiUser } from 'react-icons/fi'; 

const { Option } = Select;

const PermissionModal = ({ visible, onCancel, onSuccess, permission }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(permission || {});
    }
  }, [visible, permission, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Example of API call to create/update permission (replace with actual logic)
      // await (permission ? updatePermission : createPermission)(values);
      
      message.success(`Permission ${permission ? 'updated' : 'created'} successfully`);
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={permission ? 'Edit Permission' : 'Create Permission'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" icon={<FiX />} onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<FiSave />}
          onClick={handleSubmit}
          loading={loading}
        >
          Save
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
          sensitive: false,
        }}
      >
        <Form.Item
          name="name"
          label="Permission Name"
          rules={[{ required: true, message: 'Please enter permission name' }]}
        >
          <Input placeholder="e.g. Manage Users" prefix={<FiUser />} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <Input.TextArea placeholder="Describe what this permission allows" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="sensitive"
          valuePropName="checked"
        >
          <Checkbox>
            This is a sensitive permission (requires additional approval)
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
