import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Spin, Row, Col, message,Typography } from "antd";
import { useUser } from "../../hooks/UserUser";
import { useCompany } from "../../hooks/UseCompnay";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const CreateWarehouse = () => {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleWarehouseCreate, handleRegional } = useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(false);
  const [regionals, setRegionals] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await handleEmployee(token);
        if (result?.employees) {
          setUsers(result.employees);
        } else {
          message.error("Failed to load employees");
        }
      } catch (error) {
        console.error("Error loading employees:", error);
        message.error("Error loading employees");
      } finally {
        setLoading(false);
      }
    };

    const fetchRegional = async () => {
      try {
        setLoading(true);
        const result = await handleRegional(token);
        if (Array.isArray(result?.regionals)) {
          setRegionals(result.regionals);
        } else {
          setRegionals([]);
        }
      } catch (error) {
        message.error("Error loading companies");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchRegional();
  }, [token]);

  const handleSubmit = async (values) => {
    const result = await handleWarehouseCreate(values, token);
    if (result?.success) {
      message.success("Warehouse created successfully!");
      navigate("/warehouse");
    } else {
      message.error(result?.message || "Failed to create warehouse");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      <Spin spinning={loading}>
        <Title style={{ textAlign: "center", marginBottom: "30px" ,color:"#52c41a"}}>
          Create New Warehouse
        </Title>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          initialValues={currentWarehouse}
          onFinish={handleSubmit}
        >
          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col span={12}>
              <Form.Item
                label="Warehouse Name"
                name="name"
                rules={[{ required: true, message: "Please input warehouse name!" }]}
              >
                <Input placeholder="Warehouse Name" style={{ height: 48 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please input phone number!" },
                  { pattern: /^\+?[0-8]{9,15}$/, message: "Invalid phone number format!" },
                ]}
              >
                <Input placeholder="Phone Number" style={{ height: 48 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col span={12}>
              <Form.Item
                label="Regional"
                name="regional_id"
                rules={[{ required: true, message: "Please select the Regional!" }]}
              >
                <Select placeholder="Select Regional" loading={loading} style={{ height: 48 }}>
                  {(regionals || []).map((regional) => (
                    <Select.Option key={regional.id} value={regional.id}>
                      {regional.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CEO"
                name="manager_id"
                rules={[{ required: true, message: "Please select the CEO!" }]}
              >
                <Select placeholder="Select CEO" loading={loading} style={{ height: 48 }}>
                  {users.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
          style={{marginTop:"50px"}}
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

          <Form.Item >
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Button
                    block
                    size="large"
                    onClick={() => navigate("/warehouse")}
                    danger
                    type="default"
                    style={{height:48}}
                  >
                    Cancel
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button style={{height:48}} block size="large" type="primary" htmlType="submit">
                  Add Warehouse
                  </Button>
                </Col>
              </Row>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default CreateWarehouse;
