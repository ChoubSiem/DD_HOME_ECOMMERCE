import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useUser } from "../../hooks/UserUser"; 
import { useCompany } from "../../hooks/UseCompnay"; 

const CompanyModal = ({ isModalVisible, setIsModalVisible, currentCompany, handleSave }) => {
  const [form] = Form.useForm();
  const { handleEmployee } = useUser();
  const { handleCompany } = useCompany();
  const [loading, setLoading] = useState(false); 
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const token = localStorage.getItem('token');
  
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

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const result = await handleCompany(token);                 
      setCompanies(result.companies);
    } catch (error) {
      console.error("Failed to load companies", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      fetchUsers();
      fetchCompany();
    }
  }, [isModalVisible, token]);
  
  return (
    <Modal
      title={currentCompany ? "Edit Regional" : "Add Regional"}
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
          label="Regional Name"
          name="name"
          rules={[{ required: true, message: "Please input regional name!" }]}
        >
          <Input size="large" placeholder="Regional Name" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Please input phone number!" },
            { pattern: /^\+?[0-9]{10,15}$/, message: "Invalid phone number format!" },
          ]}
        >
          <Input size="large" placeholder="Phone Number" />
        </Form.Item>

        <Form.Item
          label="Regional Manager"
          name="ceo_id"
          rules={[{ required: true, message: "Please select the Regional Manager!" }]}
        >
          <Select size="large" placeholder="Select CEO" loading={loading}>
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Company"
          name="company_id"
          rules={[{ required: true, message: "Please select the Company!" }]}
        >
          <Select size="large" placeholder="Select company" loading={loading}>
            {companies.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input regional description!" }]}
        >
          <Input.TextArea size="large" rows={3} placeholder="Regional Description" />
        </Form.Item>

        <Form.Item>
          <Button block size="large" type="primary" htmlType="submit">
            {currentCompany ? "Update Company" : "Add Company"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyModal;
