import React, { useState, useEffect } from 'react';
import { Form, Button, Tag, Space, Checkbox, Spin, Row, Col, Divider,message  } from 'antd';
import { LockOutlined, SaveOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { usePermission } from '../../../hooks/usePermission';
import { usePolicy } from '../../../hooks/usePolicy';
import { useParams,useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const EditRolePermissions = () => {
  const { id } = useParams();x
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = useState(false);
  const { handlePermission } = usePermission();
  const { handleShowRolePermission,handleUpdateRolePermission } = usePolicy();
  const [roleWithPermission, setRoleWithPermission] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const [form] = Form.useForm();

  const fetchRoleHasPermission = async () => {
    try {
      const result = await handleShowRolePermission(token, id);
      const permissions = result.rolePermissions.rolePermission.permissions.map((perm) => ({
        id: perm.id,
        name: perm.name,
      }));
      setRoleWithPermission(permissions);
      form.setFieldsValue({ allPermissions: permissions.map((p) => p.id) });
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    }
  };

  // Fetch all permissions
  const fetchAllPermission = async () => {
    try {
      const result = await handlePermission(token);
      setAllPermissions(result.permissions || []);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPermission();
    fetchRoleHasPermission();
  }, []);

  // Group permissions by their group name
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const { group } = permission;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {});

  const saveHandler = async () => {
    try {
      const values = await form.validateFields();
      
      const result = await handleUpdateRolePermission(token, {
        permission_ids: values.allPermissions
      },id);
  
      if (result.success) {
        message.success('Permissions updated successfully');
        fetchRoleHasPermission(); 
        navigate("/role");
      }
    } catch (error) {
      message.error(result.message || 'Update failed');
      
    }
  };
  const handleCancel = () => {
    setCancelLoading(true);
    setTimeout(() => {
      navigate("/role");
      setCancelLoading(false);
    }, 300); 
  };

  return (
    <Spin spinning={loading} size="large">
      <div
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              backgroundColor: '#f6ffed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <LockOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Edit Role Permissions</h2>
              <p style={{ margin: 0, color: '#8c8c8c', fontSize: 12 }}>Manage access controls for this role</p>
            </div>
          </div>
        }
        style={{
          width: '100%',
          border: 'none',
        }}
        styles={{ body: { padding: '24px' } }}


        >
        <Form form={form} layout="vertical">
          <div style={{ 
            padding: 24, 
            marginBottom: 24,
          }}>
            <h3 style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              marginBottom: 16,
              color: '#262626'
            }}>
              Available Permissions
            </h3>
            <p style={{ 
              color: '#8c8c8c', 
              marginBottom: 24,
              fontSize: 13
            }}>
              Select the permissions you want to assign to this role
            </p>

            <Form.Item
              name="allPermissions"
              rules={[{ required: true, message: 'Please select at least one permission' }]}
            >
              <Checkbox.Group style={{ width: '100%' }}>
                {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                  <div 
                    key={groupName}
                    style={{
                      marginBottom: 24,
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: 16
                    }}>
                      <div style={{
                        width: 4,
                        height: 16,
                        backgroundColor: '#52c41a',
                        marginRight: 12,
                        borderRadius: 2
                      }} />
                      <span style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'green',
                      }}>
                        {groupName}
                      </span>
                    </div>

                    <Row gutter={[16, 16]}>
                      {perms.map((perm) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={perm.id}>
                          <Checkbox
                            value={perm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              height: '100%',
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              padding: '8px 12px',
                              borderRadius: 6,
                              backgroundColor: '#fafafa',
                              width: '100%'
                            }}>
                              <CheckOutlined style={{ 
                                color: '#52c41a', 
                                marginRight: 8,
                                fontSize: 12
                              }} />
                              <span style={{ 
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#595959'
                              }}>
                                {perm.name}
                              </span>
                            </div>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </div>

          <Divider />


          <div>
            <h4 style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              marginBottom: 16,
              color: '#262626'
            }}>
              Currently Assigned Permissions
            </h4>
            <p style={{ 
              color: '#8c8c8c', 
              marginBottom: 16,
              fontSize: 13
            }}>
              These permissions are currently assigned to this role
            </p>
            
            <div style={{ 
              backgroundColor: '#fff', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #f0f0f0'
            }}>
              {roleWithPermission.length > 0 ? (
                <Space wrap size={[8, 8]}>
                  {roleWithPermission.map((perm) => (
                    <Tag
                      key={perm.id}
                      icon={<LockOutlined style={{ fontSize: 12 }} />}
                      color="geekblue"
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '4px 12px',
                        borderRadius: 16,
                        cursor: 'default',
                        border: '1px solid #d6e4ff',
                        backgroundColor: '#f0f6ff'
                      }}
                    >
                      {perm.name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: 16,
                  backgroundColor: '#fffbe6',
                  borderRadius: 8,
                  border: '1px dashed #ffe58f'
                }}>
                  <span style={{ color: '#d48806' }}>
                    No permissions currently assigned to this role
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Submit Buttons - Added at the bottom of the form */}
          <div style={{ 
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 16
          }}>
            <Button
              onClick={handleCancel}
              size="large"
              style={{
                padding: '0 20px',
                height: 40,
                fontWeight: 500,
                borderColor: '#d9d9d9',
              }}
              disabled={cancelLoading}
              >
              {cancelLoading ? (
                <Spin size="small" style={{ marginRight: 8 }} />
              ) : null}
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={saveHandler}
              size="large"
              style={{
                padding: '0 20px',
                height: 40,
                fontWeight: 500,
              }}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </Spin>
  );
};

export default EditRolePermissions;
