import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, message, Spin } from "antd";
import { PlusOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdjustmentTable from "../../../components/adjustment/AdjustmentTable";
import AdjustmentModal from "../../../components/adjustment/AdjustmentModal";
import { useStock } from "../../../hooks/UseStock";
const { Option } = Select;
import Cookies  from "js-cookie";

const Adjustment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [currentAdjustment, setCurrentAdjustment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleAdjustments,handleDeleteAdjustment } = useStock();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchAdjustments = async () => {
      setLoading(true);
      try {
        const response = await handleAdjustments(token);
        if (response && response.success) {
          setAdjustments(response.adjustments);
        }
      } catch (error) {
        message.error("Failed to fetch adjustments");
      } finally {
        setLoading(false);
      }
    };
    fetchAdjustments();
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredAdjustments = (adjustments || []).filter((adjustment) => {
    const matchesSearch = 
      adjustment?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment?.adjuster?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || adjustment?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddAdjustmentClick = () => {
    navigate("/adjustment/add");
  };

  const handleEdit = (adjustment) => {
    navigate(`/adjustment/edit/${adjustment.id}`);
  };

  const handleDetail = (adjustment) => {
    setCurrentAdjustment(adjustment);
    setIsModalVisible(true);
  };

  const handleDelete = async (adjustmentId) => {
    setLoading(true);
    console.log(adjustmentId);
    try {
      let result = await handleDeleteAdjustment(adjustmentId,token);
      if (result.success) {
        setAdjustments(adjustments.filter(a => a.id !== adjustmentId));
        message.success("Adjustment deleted successfully");
      }
    } catch (error) {
      message.error("Failed to delete adjustment");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // const response = await updateAdjustment(currentAdjustment.id, values);
      const updatedAdjustments = adjustments.map(a => 
        a.id === currentAdjustment.id ? { ...a, ...values } : a
      );
      setAdjustments(updatedAdjustments);
      setIsModalVisible(false);
      message.success("Adjustment updated successfully");
    } catch (error) {
      message.error("Failed to update adjustment");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="product-management">
      <Spin spinning={loading}>
        <Card className="header-card" style={{borderRadius:0 }}>
          <div className="header-content">
            <div>
              <h2 style={{ color: '#52c41a'}}>Stock Adjustment</h2>
              <p>Manage your inventory adjustments</p>
            </div>
            <Button
              onClick={handleAddAdjustmentClick}
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Add Adjustment
            </Button>
          </div>
        </Card>

        <Card className="filter-card" style={{borderRadius:0 }}>
          <div className="filter-content">
            <Input
              placeholder="Search by reference or adjuster..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: 300 }}
              allowClear
            />
            <div className="filter-controls">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
                placeholder="Status"
              >
                <Option value="all">All Statuses</Option>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>

              <Button icon={<FilterOutlined />} style={{ color: '#52c41a', borderColor: '#52c41a' }}>
                Advanced Filters
              </Button>
            </div>
          </div>
        </Card>

        <AdjustmentTable
          adjustments={adjustments}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleDetail={handleDetail}
          loading={loading}
        />

        {currentAdjustment && (
          <AdjustmentModal
            isModalVisible={isModalVisible}
            currentAdjustment={currentAdjustment}
            setIsModalVisible={setIsModalVisible}
            handleSave={handleSave}
          />
        )}
      </Spin>
    </div>
  );
};

export default Adjustment;