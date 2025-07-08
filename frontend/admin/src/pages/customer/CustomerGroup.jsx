import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Space, Typography, Row, Col, Input,Form  } from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerGroupModal from '../../components/customer_group/EditCustomerGroupModal';
import CreateCustomerGroup from '../../components/customer_group/CreateCustomerGroup';
import CustomerGroupTable from '../../components/customer_group/CustomerGroupTable';
// import CustomerGroupForm from '../../components/customer_group/CustomerGroupForm';
import { useUser } from '../../hooks/UserUser';
// import './CustomerGroup.css';


const { Title, Text } = Typography;

const CustomerGroup = () => {
    
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { handleCreateCustomerGroup,handleGetCustomerGroup,handleUpdateCustomerGroup ,handleDeleteCustomerGroup} = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [form] = Form.useForm();    
  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const fetchGroupsData = async () => {
    setLoading(true);
    try {
      const result = await handleGetCustomerGroup(token);            
      if (result?.success) {
        setGroups(result.groups || []);
      }
    } catch (error) {
      console.error('Error fetching customer groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsCreateModalVisible(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setIsEditModalVisible(true);
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setSelectedGroup(null);
  };
  const handleSaveGroup = async (values, isEditing , id = null) => {    
    try {
      let result;
      if (isEditing) {
        result = await handleUpdateCustomerGroup(id,values,token);
        if (result.success) {
          message.success(result.message);
          location.reload();          
        }
      } else {
         result = await handleCreateCustomerGroup(values,token);

        if (!result.success) throw new Error('Create failed');
      }

      setIsCreateModalVisible(false);
      await fetchGroupsData();
    } catch (error) {
      message.error('Failed to save group');
    }
  };



  const handleDeleteGroup = async (groupId) => {
    try {
      const result = await handleDeleteCustomerGroup(groupId, token);
      if (result?.success) {
        setGroups((prevGroups) =>
          prevGroups.filter((group) => group.id !== groupId)
        );
        message.success('Customer group deleted successfully');
      } else {
        message.error(result?.message || 'Failed to delete customer group.');
      }
    } catch (error) {
      console.error('Error deleting customer group:', error);
      message.error('Failed to delete customer group.');
    }
  };

  return (
    <div className="customer-group-container">
      <Spin spinning={loading} tip="Loading customer groups..." size="large">
        <Card
          className="customer-group-header-card"
          style={{ body:{padding: '24px', }}}
        >
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Title level={3} style={{ margin: 0, color: '#1a3353' }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Customer Group Management
                </Title>
                <Text type="secondary">
                  Organize your customers into meaningful groups
                </Text>
              </motion.div>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddGroup}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Add New Group
              </Button>
            </Col>
          </Row>
        </Card>

        <Card
          className="customer-group-content-card"
          style={{ body:{padding: '24px' },marginTop:'20px'}}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col xs={24} md={12}>
                <Input
                  placeholder="Search customer groups..."
                  prefix={<SearchOutlined />}
                  size="large"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Text strong>{filteredGroups.length} groups found</Text>
              </Col>
            </Row>

            <CustomerGroupTable
              groups={filteredGroups}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
            />
          </Space>
        </Card>

        <CreateCustomerGroup
          visible={isCreateModalVisible}
          onCancel={handleCreateModalCancel}
          onSave={(values) => handleSaveGroup(values, false)}
        />

        {/* <CreateCustomerGroup
          visible={isCreateModalVisible}
          onCancel={handleCreateModalCancel}
          onSave={(values) => handleSaveGroup(values, false)}
        /> */}

     <CustomerGroupModal
        visible={isEditModalVisible}
        onCancel={handleEditModalCancel}
        onSave={(values) => handleSaveGroup(values, true, selectedGroup?.id)}
        initialData={selectedGroup}
        isEditing={true}
      />

      </Spin>
    </div>
  );
};

export default CustomerGroup;