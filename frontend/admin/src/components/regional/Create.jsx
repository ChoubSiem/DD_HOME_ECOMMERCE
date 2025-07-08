import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Spin, Row, Col, message } from "antd";
import { useUser } from "../../hooks/UserUser";
import { useCompany } from "../../hooks/UseCompnay";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const CreateCompany = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { handleRegionalCreate, handleCompany } = useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRegional, setCurrentRegional] = useState(false);
  const [companies, setCompanies] = useState([]);
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
        const result = await handleCompany(token);
        if (Array.isArray(result?.companies)) {
          setCompanies(result.companies);
        } else {
          setCompanies([]);
          message.error("Invalid companies data");
        }
      } catch (error) {
        console.error("Failed to load companies", error);
        message.error("Error loading companies");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchRegional();
  }, [token]);

  const handleSubmit = async (values) => {    
    const result = await handleRegionalCreate(values, token);
    if (result?.success) {
      message.success("Company created successfully!");
      navigate("/regional");
    } else {
      message.error(result?.message || "Failed to create company");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      <Spin spinning={loading}>
      <h1 style={{ textAlign: "center",color:"#52c41a" }}>Create New Regional</h1>
      <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={currentRegional}
        >
          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Regional Name"
                name="name"
                rules={[{ required: true, message: "Please input regional name!" }]}
              >
                <Input size="large" placeholder="Regional Name" style={{height:48}}/>
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
                <Input size="large" placeholder="Phone Number" style={{height:48}}/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col xs={24} sm={12}>
                <Form.Item
                label="Regional Manager"
                name="ceo_id"
                rules={[{ required: true, message: "Please select the Regional Manager!" }]}
                >
                <Select size="large" placeholder="Select CEO" loading={loading} style={{height:48}}>
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
                label="Company"
                name="company_id"
                rules={[{ required: true, message: "Please select the Company!" }]}
                >
                <Select size="large" placeholder="Select company" loading={loading} style={{height:48}}>
                    {companies.map((company) => (
                    <Select.Option key={company.id} value={company.id}>
                        {company.name}
                    </Select.Option>
                    ))}
                </Select>
                </Form.Item>
            </Col>
            </Row>
            <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input regional description!" }]}
            style={{marginTop:"50px"}}
          >
            <Input.TextArea size="large" rows={3} placeholder="Regional Description" />
          </Form.Item>
          <Form.Item style={{marginTop:"50px"}}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate("/regional")}
                  danger
                  type="default"
                  style={{height:48}}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button style={{height:48}} block size="large" type="primary" htmlType="submit">
                Add Regional
                </Button>
              </Col>
            </Row>
          </Form.Item>

        </Form>
      </Spin>
    </div>
  );
};

export default CreateCompany;
