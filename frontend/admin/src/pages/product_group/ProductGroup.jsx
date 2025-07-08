import React, { useState, useEffect } from "react";
import { Card, message, Space, Button, Spin } from "antd";
import ProductGroupModal from "../../components/product_group/ProductGroupModal";
import ProductGroupTable from "../../components/product_group/ProductGroupTable";
import ProductGroupToolbar from "../../components/product_group/ProductGroupToolbar";
import { useProductTerm } from "../../hooks/UserProductTerm";
import { PlusOutlined } from "@ant-design/icons";

const ProductGroupManagement = () => {
  const token = localStorage.getItem("token");
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentProductGroup, setCurrentProductGroup] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    handleProductGroups,
    handleProductGroupCreate,
    handleProductGroupDelete,
    handleProductGroupUpdate,
  } = useProductTerm();

  const handleCreate = () => {
    setIsModalVisible(true);
  };

  const fetchProductGroups = async () => {
    setLoading(true);
    try {
      const result = await handleProductGroups(token);        
      if (result && result.groups) {
        setProductGroups(result.groups);
      } else {
        message.error("Failed to load product groups: No data received");
      }
    } catch (error) {
      message.error("Failed to load product groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductGroups();
  }, []);

  const handleSave = async (values) => {
    const isUpdate = currentProductGroup !== null;
    let result;

    try {
      if (isUpdate) {
        result = await handleProductGroupUpdate(
          currentProductGroup.id,
          values,
          token
        );

        if (result?.success) {
          message.success(result.message || "Product group updated successfully");
          setProductGroups((prev) =>
            prev.map((group) =>
              group.id === result.group.id ? result.group : group
            )
          );
        } else {
          message.error(result?.message || "Failed to update product group");
        }
      } else {
        result = await handleProductGroupCreate(values, token);        
        if (result?.success) {  
          message.success(result.message || "Product group created successfully");
          setProductGroups((prev) => [...prev, result.group]);
        } else {
          message.error(result?.message || "Failed to create product group");
        }
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setIsModalVisible(false);
      setCurrentProductGroup(null);
    }
  };

  const handleDelete = async (id) => {
    let result = await handleProductGroupDelete(id, token);
    if (result.success) {
      fetchProductGroups(token);
      message.success(result.message || "Product group deleted successfully");
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="product-group-management">
        <Card
          className="product-group-header-card"
          style={{ body: { padding: "24px" } }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="product-group-header-content">
              <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>
                Product Group Management
              </h1>
              <p
                style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}
              >
                Manage your product group information
              </p>
            </div>
            <Button onClick={handleCreate} type="primary">
              <PlusOutlined /> Add Product Group
            </Button>
          </div>
        </Card>

        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: "50px",marginTop:"50px" }}
        >
          <ProductGroupToolbar />
        </Space>

        <ProductGroupTable
          productGroups={productGroups}
          setCurrentProductGroup={setCurrentProductGroup}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
        />

        <ProductGroupModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          currentProductGroup={currentProductGroup}
          handleSave={handleSave}
        />
      </div>
    </Spin>
  );
};

export default ProductGroupManagement;
 