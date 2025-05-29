
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useUser } from "../../hooks/UserUser"; 
const CompanyModal = ({ isModalVisible, setIsModalVisible, currentCompany, handleSave }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const { handleEmployee } = useUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isModalVisible) {
      const fetchUsers = async () => {
        try {
          setLoading(true); 
          const result = await handleEmployee(token);           
          setUsers(result.employees);
        } catch (error) {
          console.error("Failed to load users", error);
        } finally {
          setLoading(false); 
        }
      };

      fetchUsers();
    }
  }, [isModalVisible, token]);

  return (
    <Modal
      title={currentCompany ? "Edit Company" : "Add Company"}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        autoComplete="off"
        initialValues={currentCompany}
      >
        <Form.Item
          label="Company Name"
          name="name"
          rules={[{ required: true, message: "Please input company name!" }]}
        >
          <Input placeholder="Company Name" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Please input company location!" }]}
        >
          <Input.TextArea rows={3} placeholder="Company Location" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Please input phone number!" }, { pattern: /^\+?[0-9]{10,15}$/, message: "Invalid phone number format!" }]}
        >
          <Input placeholder="Phone Number" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input email address!" }, { type: "email", message: "Please enter a valid email!" }]}
        >
          <Input placeholder="Email Address" />
        </Form.Item>

        <Form.Item
          label="CEO"
          name="ceo_id"
          rules={[{ required: true, message: "Please select the CEO!" }]}
        >
          <Select placeholder="Select CEO" loading={loading}>
            {(users || []).map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {currentCompany ? "Update Company" : "Add Company"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;
