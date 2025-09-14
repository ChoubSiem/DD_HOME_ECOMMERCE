
import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Space, Typography, Row, Col, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import SupplierModal from '../../../components/supplier/EditSupplierModal';
import CreateSupplier from '../../../components/supplier/create/SupplierCreate';
import SupplierTable from '../../../components/supplier/SupplierTable';
import { useUser } from '../../../hooks/UserUser';
import './Supplier.css';
import { usePolicy } from '../../../hooks/usePolicy';

const { Title, Text } = Typography;

const Supplier = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { handleSuppliers,handleDeleteSupplier } = useUser();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user"));
  const [permissions, setPermission] = useState([]);
  const { handleRolePermission } = usePolicy();


  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSuppliersData = async () => {
    setLoading(true);
    try {
      const result = await handleSuppliers(token);      
      if (result?.success) {
        setSuppliers(result.suppliers || []);
      } else {
        message.error('Failed to fetch suppliers.');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermisson = async () => {
    let result = await handleRolePermission(userData.role_id);
      
    if (result.success) {
      setPermission(result.rolePermissions);
    }
  }  

  useEffect(() => {
    fetchSuppliersData();
    fetchPermisson();
  }, []);

  const hasSupplierPermission = permissions.some(
    (p) => p.name === "Supplier.create"
  );

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsCreateModalVisible(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalVisible(true);
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setSelectedSupplier(null);
  };

  const handleSaveSupplier = async (isEditing) => {
    await fetchSuppliersData();
    if (isEditing) {
      setIsEditModalVisible(false);
      setSelectedSupplier(null);
      message.success('Supplier updated successfully');
    } else {
      setIsCreateModalVisible(false);
      message.success('Supplier added successfully');
    }
  };

 const handleDeleteSupplierData = async (supplierId) => {
  try {
    const result = await handleDeleteSupplier(supplierId,token);
    if (result?.success) {
      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((supplier) => supplier.id !== supplierId)
      );
      message.success('Supplier deleted successfully');
    } else {
      message.error('Failed to delete supplier.');
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    message.error('Failed to delete supplier.');
  }
};

  return (
    <div className="supplier-container">
      <Spin spinning={loading} tip="Loading suppliers..." size="large">
        <Card
          bordered={false}
          className="supplier-header-card"
          bodyStyle={{ padding: '24px' }}
        >
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Title level={3} style={{ margin: 0, color: '#1a3353' }}>
                  Supplier Management
                </Title>
                <Text type="secondary">
                  Manage your supplier information and relationships
                </Text>
              </motion.div>
            </Col>
            <Col>
              { hasSupplierPermission && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSupplier}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Add New Supplier
              </Button>
              )}
            </Col>
          </Row>
        </Card>

        <Card
          bordered={false}
          className="supplier-content-card"
          bodyStyle={{ padding: '24px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col xs={24} md={12}>
                <Input
                  placeholder="Search suppliers..."
                  prefix={<SearchOutlined />}
                  size="large"
                  allowClear
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                <Text strong>{filteredSuppliers.length} suppliers found</Text>
              </Col>
            </Row>

            <SupplierTable
              suppliers={filteredSuppliers}
              onEdit={handleEditSupplier}
              onDelete={handleDeleteSupplierData}
              permissions={permissions}
            />
          </Space>
        </Card>

        <CreateSupplier
          visible={isCreateModalVisible}
          onCancel={handleCreateModalCancel}
          onSave={() => handleSaveSupplier(false)}
        />
        <SupplierModal
          visible={isEditModalVisible}
          onCancel={handleEditModalCancel}
          onSave={() => handleSaveSupplier(true)}
          initialData={selectedSupplier}
          isEditing={true}
        />
      </Spin>
    </div>
  );
};

export default Supplier;
