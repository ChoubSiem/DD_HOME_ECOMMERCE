import React, { useState, useEffect } from "react";
import { Card, message, Space, Button, Spin } from "antd";
import CategoryModal from "../../../components/category/CategoryModal";
import CategoryTable from "../../../components/category/CategoryTable";
import CategoryToolbar from "../../../components/category/CategoryToolbar";
import "./Category.css";
import { useProductTerm } from "../../../hooks/UserProductTerm";
import { PlusOutlined } from "@ant-design/icons";

const CategoryMangement = () => {
  const token = localStorage.getItem("token");
  const {
    handleCategories,
    handleCategoryCreate,
    handleCategoryDelete,
    handleCategoryUpdate, 
  } = useProductTerm();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCategories, setCurrentCategories] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreate = () => {
    setCurrentCategories(null); 
    setIsModalVisible(true);
  };

  const fetchcategorys = async () => {
    setLoading(true);
    try {
      const result = await handleCategories(token);
      if (result) {
        setCategories(result.categories);
      } else {
        message.error("Failed to load category: No data received");
      }
    } catch (error) {
      message.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcategorys();
  }, []);

  const handleSave = async (values) => {
    try {
      let result;

      if (currentCategories) {
        result = await handleCategoryUpdate(currentCategories.id, values, token);
      } else {
        result = await handleCategoryCreate(values, token);
      }

      if (result.success) {
        setIsModalVisible(false);
        setCurrentCategories(null);
        message.success(result.message);
        fetchcategorys();
      } else {
        message.error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      message.error("Something went wrong while saving the category");
    }
  };

  const handleDelete = async (id) => {
    const result = await handleCategoryDelete(id, token);

    if (result.success) {
      message.success(result.message);
      fetchcategorys();
    } else {
      message.error(result.message);
    }
  };

  useEffect(() => {
    if (!isModalVisible) {
      setCurrentCategories(null);
    }
  }, [isModalVisible]);

  return (
    <Spin spinning={loading}>
      <div className="category-management">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div className="category-header-content">
            <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>
              Category Management
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
              Manage your category information
            </p>
          </div>
          <Button onClick={handleCreate} type="primary">
            <PlusOutlined /> Add Category
          </Button>
        </div>

        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: "30px" }}>
          <CategoryToolbar />
        </Space>

        <CategoryTable
          categories={categories}
          setCurrentCategories={setCurrentCategories}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
          // OnEdit = {}
        />

        <CategoryModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          currentCategories={currentCategories}
          handleSave={handleSave}
        />
      </div>
    </Spin>
  );
};

export default CategoryMangement;
