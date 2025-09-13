import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Spin, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../hooks/UseCompnay";
import { useUser } from "../../hooks/UserUser";
const CreateCompany = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleCompanyCreate } = useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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
        message.error("Error loading employees");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleSubmit = async (values) => {
    const result = await handleCompanyCreate(values, token);
    if (result?.success) {
      message.success("Company created successfully!");
      navigate("/company");
    } else {
      message.error(result?.message || "Failed to create company");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      {/* <Spin spinning={loading}> */}
      <h1 style={{ textAlign: "center",color:"#52c41a" }}>Create New Company</h1>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Row gutter={24} style={{marginTop:"50px"}}>
              <Col span={12}>
                <Form.Item
                  label="Company Name"
                  name="name"
                  rules={[{ required: true, message: "Please input company name!" }]}
                >
                  <Input placeholder="Company Name" style={{ height: 48 }}/>
                </Form.Item>
              </Col>

              <Col span={12}>
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
                  <Input placeholder="Phone Number" style={{ height: 48 }}/>
                </Form.Item>
              </Col>

              <Col span={12} style={{marginTop:"50px"}}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input email address!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input placeholder="Email Address" style={{ height: 48 }}/>
                </Form.Item>
              </Col>

              <Col span={12} style={{marginTop:"50px"}}>
                <Form.Item
                  label="CEO"
                  name="ceo_id"
                  rules={[{ required: true, message: "Please select the CEO!" }]}
                >
                  <Select placeholder="Select CEO" loading={loading} style={{ height: 48 }}>
                    {(users || []).map((user) => (
                      <Select.Option key={user.id} value={user.id}>
                        {user.username}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24} style={{marginTop:"50px"}}>
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[{ required: true, message: "Please input company location!" }]}
                >
                  <Input.TextArea rows={4} placeholder="Company Location" />
                </Form.Item>
              </Col>

              <Form.Item style={{marginTop:"50px"}}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Button
                        block
                        size="large"
                        onClick={() => navigate("/company")}
                        danger
                        type="default"
                        style={{height:48}}
                      >
                        Cancel
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button style={{height:48}} block size="large" type="primary" htmlType="submit">
                      Add Company
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
            </Row>
          </Form>
      {/* </Spin> */}
    </div>
  );
};

export default CreateCompany;
