import React, { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, Typography, Spin, Space } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import './Login.css';
import { useAuth } from '../../hooks/UseAuth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useAuth();
  const onFinish = async (values) => {
    setLoading(true);
    await handleLogin(values);
    setLoading(false);
  };


  return (
    <Spin spinning={loading}>
      <div className="login-container">
        <video autoPlay loop muted playsInline className="video-background">
          <source
            src="../../logo/istockphoto-1752533608-640_adpp_is.mp4"
            type="video/mp4"
          />
          Your browser does not support HTML5 video.
        </video>

        <div className="video-overlay"></div>

        <div className="login-form-center">
          <Card className="login-card">
            <Typography.Title level={3} className="login-title" style={{ color: "#52c41a", fontWeight: "bold" }}>
              Welcome To DD_Home
            </Typography.Title>

            <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Phone number" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <a className="login-form-forgot" href="/forgot-password">
                    Forgot password?
                  </a>
                </Space>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  loading={loading}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default Login;