import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, message, Spin, Row, Col } from "antd";
import { useCompany } from "../../hooks/UseCompnay";
import { useUser } from "../../hooks/UserUser";

const EditCompany = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleCompanyUpdate, handleCompanyEdit } = useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
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
      }
    };

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const companyData = await handleCompanyEdit(id, token);
        setCurrentCompany(companyData.data);
        form.setFieldsValue(companyData.data);
      } catch (error) {
        console.error("Error loading company:", error);
        message.error("Error loading company");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchCompany();
  }, [id, token]);

  const handleSubmit = async (values) => {    
    const result = await handleCompanyUpdate(values, token , currentCompany);
    if (result?.success) {
      message.success("Company updated successfully!");
      navigate("/company");
    } else {
      message.error(result?.message || "Failed to update company");
    }
  };

  if (!currentCompany) {
    return <Spin spinning={loading} />;
  }

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      <Spin spinning={loading}>
      <h1 style={{ textAlign: "center",color:"#52c41a" }}>Update Company</h1>

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
                <Input placeholder="Company Name" style={{ height: 48 }} />
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
                <Input placeholder="Phone Number" style={{ height: 48 }} />
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
                <Input placeholder="Email Address" style={{ height: 48 }} />
              </Form.Item>
            </Col>

            <Col span={12} style={{marginTop:"50px"}}>
              <Form.Item
                label="CEO"
                name="ceo_id"
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
                  Update Company
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default EditCompany;
