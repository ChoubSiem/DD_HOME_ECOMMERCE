import React, { useState, useEffect } from "react";
import { Card, message, Space, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import WarehouseModal from "../../../components/warehouse/WarehouseModal";
import WarehouseTable from "../../../components/warehouse/WarehouseTable";
import WarehouseToolbar from "../../../components/warehouse/WarehouseToolbar";
import "./Warehouse.css";
import { useCompany } from "../../../hooks/UseCompnay";
import Cookies from "js-cookie";

const WarehouseManagement = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { handleWarehouse, handleWarehouseUpdate, handleWarehouseCreate } = useCompany();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreate = () => {
    navigate("/warehouse/add");
  };

  const handleWarehouseProduct = (currentWarehouse) =>{
    navigate(`/warehouse/product/${currentWarehouse.id}`);
  }

  const handleEdit = (warehouse) => {
    if (warehouse && warehouse.id) {
      navigate(`/warehouse/edit/${warehouse.id}`);
    } else {
      message.error("Invalid warehouse data for editing.");
    }
  };

  const handleDelete = (warehouseId) => {
    const updated = warehouses.filter((c) => c.id !== warehouseId);
    setWarehouses(updated);
    message.success("Warehouse deleted successfully");
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const result = await handleWarehouse(token);
      if (result && result.warehouses) {
        setWarehouses(result.warehouses);
      } else {
        message.error("Failed to load warehouses: No data received");
      }
    } catch (error) {
      message.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="warehouse-management">
        <Card className="warehouse-header-card" style={{ body: { padding: "24px" } }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="warehouse-header-content">
              <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Warehouse Management</h1>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
                Manage your warehouse information
              </p>
            </div>
            <Button onClick={handleCreate} type="primary">
              <PlusOutlined />
              Add Warehouse
            </Button>
          </div>
        </Card>

        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: "30px" }}>
          <WarehouseToolbar />
        </Space>

        <WarehouseTable
          warehouses={warehouses}
          setCurrentWarehouse={setCurrentWarehouse}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleWarehouseProduct = {handleWarehouseProduct}
        />       
      </div>
    </Spin>
  );
};

export default WarehouseManagement;
