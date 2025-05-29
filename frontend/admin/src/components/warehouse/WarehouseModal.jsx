import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useUser } from "../../hooks/UserUser";
import { useCompany } from "../../hooks/UseCompnay";

const WarehouseModal = ({ isModalVisible, setIsModalVisible, currentWarehouse, handleSave }) => {
  const [form] = Form.useForm();
  const { handleEmployee } = useUser();
  const { handleRegional } = useCompany();
  const [users, setUsers] = useState([]);
  const [regionals, setRegionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

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

  const fetchRegional = async () => {
    try {
      setLoading(true);
      const result = await handleRegional(token);
      setRegionals(result.regionals);
    } catch (error) {
      console.error("Failed to load regional", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      fetchUsers();
      fetchRegional();
    }
  }, [isModalVisible, token]);

  const inputStyle = {
    height: "45px",
    fontSize: "16px",
  };

  return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        autoComplete="off"
        initialValues={currentWarehouse}
      >
        <Form.Item
          label="Warehouse Name"
          name="name"
          rules={[{ required: true, message: "Please input warehouse name!" }]}
        >
          <Input placeholder="Warehouse Name" style={inputStyle} />
        </Form.Item>

        

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Please input phone number!" },
            { pattern: /^\+?[0-9]{10,15}$/, message: "Invalid phone number format!" },
          ]}
        >
          <Input placeholder="Phone Number" style={inputStyle} />
        </Form.Item>

        <Form.Item
          label="Regional"
          name="regional_id"
          rules={[{ required: true, message: "Please select the Regional Manager!" }]}
        >
          <Select placeholder="Select Regional" loading={loading} style={inputStyle}>
            {(regionals || []).map((regional) => (
              <Select.Option key={regional.id} value={regional.id}>
                {regional.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="CEO"
          name="manager_id"
          rules={[{ required: true, message: "Please select the CEO!" }]}
        >
          <Select placeholder="Select CEO" loading={loading} style={inputStyle}>
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please input warehouse address!" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Warehouse Address"
            style={{ fontSize: "16px", padding: "10px" }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ height: "45px", fontSize: "16px" }}
          >
            {currentWarehouse ? "Update Warehouse" : "Add Warehouse"}
          </Button>
        </Form.Item>
      </Form>
  );
};

export default WarehouseModal;
