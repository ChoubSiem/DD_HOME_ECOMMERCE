import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Card,
  Divider,
  Space,
  message,
  Row,
  Col,
  Typography,
  Tabs,
  Badge,
  Avatar,
  Upload
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  EyeOutlined,
  CloudUploadOutlined
} from "@ant-design/icons";
import { useTheme } from "antd-style";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const theme = useTheme();

  // Default settings values
  const defaultSettings = {
    companyName: "Tech Solutions Inc.",
    email: "support@techsolutions.com",
    phone: "+1 234 567 890",
    maxUsers: 50,
    notificationsEnabled: true,
    theme: "light",
    timezone: "UTC",
    currency: "USD",
    logo: "",
    primaryColor: "#1890ff",
    sessionTimeout: 30,
    twoFactorAuth: false
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      message.success("Settings saved successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please fill all required fields correctly");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    form.setFieldsValue(defaultSettings);
    message.info("Settings reset to default values");
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage;
  };

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "none", 
      width:"100%",
      margin: "0 auto",
      backgroundColor: theme.colorBgContainer
    }}>
      <Title level={2} style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <SettingOutlined style={{ marginRight: 12, color: theme.colorPrimary }} />
        System Settings
      </Title>

      <Card
        bordered={false}
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          style={{ minHeight: 600 }}
          tabBarStyle={{ width: 200, paddingTop: 16 }}
        >
          {/* General Settings Tab */}
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ marginRight: 8 }} />
                General
              </span>
            }
            key="general"
          >
            <div style={{ padding: 24 }}>
              <Title level={4} style={{ marginBottom: 24 }}>General Settings</Title>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Card bordered={false} style={{ marginBottom: 24 }}>
                    <Title level={5} style={{ marginBottom: 16 }}>Company Information</Title>
                    <Form.Item
                      label="Company Name"
                      name="companyName"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Your company name" />
                    </Form.Item>

                    <Form.Item
                      label="Company Logo"
                      name="logo"
                    >
                      <Upload
                        name="logo"
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        style={{ width: '100%' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Avatar 
                            size={80} 
                            icon={<EyeOutlined />} 
                            style={{ marginBottom: 8, backgroundColor: theme.colorPrimaryBg }}
                          />
                          <Text type="secondary">Click to upload</Text>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Contact Information</Title>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, type: 'email' }]}
                    >
                      <Input placeholder="contact@company.com" />
                    </Form.Item>

                    <Form.Item
                      label="Phone Number"
                      name="phone"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="+1 234 567 890" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* Security Tab */}
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Badge dot={!defaultSettings.twoFactorAuth}>
                  <BellOutlined style={{ marginRight: 8 }} />
                </Badge>
                Security
              </span>
            }
            key="security"
          >
            <div style={{ padding: 24 }}>
              <Title level={4} style={{ marginBottom: 24 }}>Security Settings</Title>
              
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Authentication</Title>
                    
                    <Form.Item
                      label="Two-Factor Authentication"
                      name="twoFactorAuth"
                      valuePropName="checked"
                    >
                      <Switch 
                        checkedChildren="Enabled" 
                        unCheckedChildren="Disabled" 
                      />
                    </Form.Item>

                    <Form.Item
                      label="Session Timeout"
                      name="sessionTimeout"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select timeout duration">
                        <Option value={15}>15 minutes</Option>
                        <Option value={30}>30 minutes</Option>
                        <Option value={60}>1 hour</Option>
                        <Option value={1440}>24 hours</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* Appearance Tab */}
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <EyeOutlined style={{ marginRight: 8 }} />
                Appearance
              </span>
            }
            key="appearance"
          >
            <div style={{ padding: 24 }}>
              <Title level={4} style={{ marginBottom: 24 }}>Appearance Settings</Title>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Theme</Title>
                    
                    <Form.Item
                      name="theme"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select theme">
                        <Option value="light">Light</Option>
                        <Option value="dark">Dark</Option>
                        <Option value="system">System Default</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Primary Color"
                      name="primaryColor"
                    >
                      <Input type="color" style={{ width: 80, height: 40 }} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Preview</Title>
                    <div style={{ 
                      height: 200, 
                      borderRadius: 8,
                      backgroundColor: theme.colorBgLayout,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text type="secondary">Theme Preview</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>

          {/* Localization Tab */}
          <TabPane
            tab={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <GlobalOutlined style={{ marginRight: 8 }} />
                Localization
              </span>
            }
            key="localization"
          >
            <div style={{ padding: 24 }}>
              <Title level={4} style={{ marginBottom: 24 }}>Localization Settings</Title>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Region Settings</Title>
                    
                    <Form.Item
                      label="Timezone"
                      name="timezone"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select timezone" showSearch>
                        <Option value="UTC">UTC</Option>
                        <Option value="EST">Eastern Standard Time (EST)</Option>
                        <Option value="PST">Pacific Standard Time (PST)</Option>
                        <Option value="GMT">Greenwich Mean Time (GMT)</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Currency"
                      name="currency"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select currency" showSearch>
                        <Option value="USD">US Dollar (USD)</Option>
                        <Option value="EUR">Euro (EUR)</Option>
                        <Option value="GBP">British Pound (GBP)</Option>
                        <Option value="JPY">Japanese Yen (JPY)</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 16 }}>Import/Export</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        icon={<CloudUploadOutlined />} 
                        block
                        style={{ height: 40 }}
                      >
                        Import Settings
                      </Button>
                      <Button 
                        type="default" 
                        block
                        style={{ height: 40 }}
                      >
                        Export Settings
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>

        {/* Fixed Action Bar */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: theme.colorBgContainer,
          padding: '16px 24px',
          borderTop: `1px solid ${theme.colorBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text type="secondary">Make sure to save your changes</Text>
          <Space>
            <Button
              onClick={handleResetSettings}
              disabled={loading}
              size="large"
            >
              Reset Defaults
            </Button>
            <Button
              type="primary"
              onClick={handleSaveSettings}
              loading={loading}
              size="large"
              style={{ minWidth: 120 }}
            >
              Save Changes
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;