import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Space, Typography, Row, Col, Input } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerModal from '../../components/customer/EditCustomerModal';
import CreateCustomer from '../../components/customer/CreateCustomer';
import CustomerTable from '../../components/customer/CustomerTable';
import { useUser } from '../../hooks/UserUser';
import CustomerImport from "../../components/customer/ImportCustomer";

const { Title, Text } = Typography;

const Customer = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerGroups, setCustomerGroups] = useState([]);
  const [isCustomerModalImportVisible , setIsCustomerModalImportVisible] = useState(false);
  
  const { 
    handleCustomerCreate, 
    handleCustomers, 
    handleGetCustomerGroup,
    handleUpdateCustomer,
    handleDeleteCustomer ,
    handleImportCustomer
  } = useUser();
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(customer =>
    customer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCustomerGroups = async () => {
    try {
      const result = await handleGetCustomerGroup(token);      
      if (result?.success) {
        setCustomerGroups(result.groups || []);
      }
    } catch (error) {
      console.error('Error fetching customer groups:', error);
      message.error('Failed to fetch customer groups.');
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const result = await handleCustomers(token);        
      console.log(result);
          
      if (result?.success) {
        setCustomers(result.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerGroups();
  }, []);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCreateModalVisible(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async (values, isEditing, id = null) => {    
    try {
      setLoading(true);      
      const result = isEditing 
        ? await handleUpdateCustomer(id, values, token)
        : await handleCustomerCreate(values, token);      
      if (result?.success) {
        message.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully');
        await fetchCustomers();
        isEditing ? setIsEditModalVisible(false) : setIsCreateModalVisible(false);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error(error.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomerData = async (customerId) => {
    try {
      setLoading(true);
      console.log(customerId);
      const result = await handleDeleteCustomer(customerId, token);
      
      if (result?.success) {
        message.success('Customer deleted successfully');
        await fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error(error.message || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerImportModal = () =>{
    setIsCustomerModalImportVisible(true);
  }

  const handleImportedCustomers = async (values) => {
    let result;
    setLoading(true)
    try {
      result = await handleImportCustomer(values, token);
    } catch (error) {
      console.error('Import failed:', error);
    }

    if (result?.success) {
      setIsCustomerModalImportVisible(false);
      message.success(result.message);
      setLoading(false);
    } else {
      message.error('Import failed or returned no success.');
    }
  };


  return (
    <div className="customer-container">
      <Spin spinning={loading} tip="Loading customers..." size="large">
        <Card className="customer-header-card" style={{ padding: '24px' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Title level={3} style={{ margin: 0, color: '#1a3353' }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Customer Management
                </Title>
                <Text type="secondary">Manage your customers and their information</Text>
              </motion.div>
            </Col>
            <Col >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCustomerImportModal}
                size="large"
                style={{ borderRadius: '8px',marginRight:'20px' }}
              >
                Import Customer
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCustomer}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Add New Customer
              </Button>
            </Col>
          </Row>
        </Card>

        <Card className="customer-content-card" style={{ padding: '24px', marginTop: '20px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col xs={24} md={12}>
                <Input
                  placeholder="Search customers..."
                  prefix={<SearchOutlined />}
                  size="large"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Text strong>{filteredCustomers.length} customers found</Text>
              </Col>
            </Row>

            <CustomerTable
              customers={filteredCustomers}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomerData}

            />
          </Space>
        </Card>

        <CreateCustomer
          visible={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          onSave={(values) => handleSaveCustomer(values, false)}
        />

        <CustomerModal
          visible={isEditModalVisible}
          onCancel={handleEditModalCancel}
          onSave={(values) => handleSaveCustomer(values, true, selectedCustomer?.id)}
          initialData={selectedCustomer}
          isEditing={true}
          customerGroups={customerGroups}
        />

        <CustomerImport
          visible={isCustomerModalImportVisible}
          onCancel={() => setIsCustomerModalImportVisible(false)}
          onImport={handleImportedCustomers}
        />
      </Spin>
    </div>
  );
};

export default Customer;