import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Spin, Row, Col, message } from "antd";
import { useUser } from "../../hooks/UserUser";
import { useCompany } from "../../hooks/UseCompnay";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";

const EditCompany = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleRegionalUpdate, handleRegionalEdit, handleCompany } = useCompany();
  const { handleEmployee } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch regional/company info
        const regionalData = await handleRegionalEdit(id, token);
        if (regionalData?.data) {
          const mappedData = {
            ...regionalData.data,
            ceo_id: regionalData.data.regional_manager_id,
          };
          form.setFieldsValue(mappedData);
        }

        // Fetch all employees
        const result = await handleEmployee(token);
        if (result?.employees) {
          setUsers(result.employees);
        }

        // Fetch all companies
        const resultCompanies = await handleCompany(token);
        if (Array.isArray(resultCompanies?.companies)) {
          setCompanies(resultCompanies.companies);
        }
      } catch (err) {
        console.error("Error:", err);
        message.error("Failed to load data for editing.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, token, form]);

  const handleSubmit = async (values) => {
    // console.log(values);
    // return;

    const result = await handleRegionalUpdate( values, token , id);
    
    if (result?.success) {
      message.success("Regional updated successfully!");
      navigate("/regional");
    } else {
      message.error(result?.message || "Failed to update company");
    }
  };

  return (
    <div style={{ padding: "40px", minHeight: "90vh", backgroundColor: "white" }}>
      <Spin spinning={loading}>
      <h1 style={{ textAlign: "center",color:"#52c41a" }}>Update Regional</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16} style={{marginTop:"50px"}}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Regional Name"
                name="name"
                rules={[{ required: true, message: "Please input regional name!" }]}
              >
                <Input size="large" placeholder="Regional Name" style={{ height: 48 }} />
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
                name="ceo_id"
                rules={[{ required: true, message: "Please select the Regional Manager!" }]}
              >
                <Select size="large" placeholder="Select CEO" loading={loading} style={{ height: 48 }}>
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
                <Select size="large" placeholder="Select company" loading={loading} style={{ height: 48 }}>
                  {companies.map((company) => (
                    <Select.Option key={company.id} value={company.id}>
                      {company.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{marginTop:"50px"}}
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input regional description!" }]}
          >
            <Input.TextArea size="large" rows={3} placeholder="Regional Description" />
          </Form.Item>

          <Form.Item  >
            <Row gutter={16} style={{marginTop:"50px"}}>
              <Col xs={24} sm={12}>
                <Button
                  block
                  size="large"
                  onClick={() => navigate("/regional")}
                  danger
                  type="default"
                  style={{ height: 48 }}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button style={{ height: 48 }} block size="large" type="primary" htmlType="submit">
                  Update Regional
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default EditCompany;
