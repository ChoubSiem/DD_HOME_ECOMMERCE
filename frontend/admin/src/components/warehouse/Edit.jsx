import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Spin,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { useUser } from "../../hooks/UserUser";
import { useCompany } from "../../hooks/UseCompnay";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";

const UpdateWarehouse = () => {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleWarehouseUpdate, handleWarehouseEdit, handleRegional } =
    useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const token = localStorage.getItem("token");
  const { id } = useParams(); // Getting warehouse ID from the URL

  useEffect(() => {
    const fetchWarehouse = async () => {
      setLoading(true);
      try {
        const warehouse = await handleWarehouseEdit(id, token);

        if (warehouse?.data) {
          setCurrentWarehouse(warehouse.data);
          form.setFieldsValue(warehouse.data);
        } else {
          message.error("Warehouse not found");
        }
      } catch (error) {
        message.error("Error loading warehouse");
      } finally {
        setLoading(false);
      }
    };

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
          setWarehouses(result.regionals);
        } else {
          setWarehouses([]);
        }
      } catch (error) {
        message.error("Error loading warehouses");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse(); 
    fetchUsers();
    fetchRegional();
  }, [token, id]);

  const handleSubmit = async (values) => {
    const result = await handleWarehouseUpdate(values, token, id);    
    if (result?.success) {
      message.success("Warehouse updated successfully!");
      navigate("/warehouse");
    } else {
      message.error(result?.message || "Failed to update warehouse");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      <Spin spinning={loading}>
        <Title style={{ textAlign: "center",color:"#52c41a" }}>
          Update Warehouse
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={currentWarehouse}
        >
          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Warehouse Name"
                name="name"
                rules={[{ required: true, message: "Please input warehouse name!" }]}
              >
                <Input size="large" placeholder="Warehouse Name" style={{ height: 48 }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please input phone number!" },
                  {
                    pattern: /^\+?[0-8]{9,15}$/,
                    message: "Invalid phone number format!",
                  },
                ]}
              >
                <Input size="large" placeholder="Phone Number" style={{ height: 48 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Regional Manager"
                name="manager_id"
                rules={[{ required: true, message: "Please select the Regional Manager!" }]}
              >
                <Select size="large" placeholder="Select Manager" loading={loading} style={{ height: 48 }}>
                  {users.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Regional"
                name="region_id"
                rules={[{ required: true, message: "Please select the Regional!" }]}
              >
                <Select size="large" placeholder="Select Regional" loading={loading} style={{ height: 48 }}>
                  {warehouses.map((regional) => (
                    <Select.Option key={regional.id} value={regional.id}>
                      {regional.name}
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
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input.TextArea size="large" rows={3} placeholder="Warehouse Address" />
          </Form.Item>

          <Form.Item>
            <Row gutter={16} style={{marginTop:"50px"}}>
              <Col xs={24} sm={12}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate("/warehouse")}
                  danger
                  type="default"
                  style={{ height: 48 }}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button style={{ height: 48 }} block size="large" type="primary" htmlType="submit">
                  Update Warehouse
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default UpdateWarehouse;
