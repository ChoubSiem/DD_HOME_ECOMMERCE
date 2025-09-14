import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, message, Spin } from "antd";
import { PlusOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdjustmentTable from "../../../components/adjustment/AdjustmentTable";
import { useStock } from "../../../hooks/UseStock";
import { usePolicy } from "../../../hooks/usePolicy";
const { Option } = Select;
import Cookies from "js-cookie";

const Adjustment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [currentAdjustment, setCurrentAdjustment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleAdjustments, handleDeleteAdjustment,handleApproveAdjustment,handleRejectAdjustment,handleApproveAdjustmentItem,handleRejectAdjustmentItem } = useStock();
  const { handleRolePermission } = usePolicy();
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));
  const [permissions, setPermission] = useState([]);
  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const response = await handleAdjustments(token,user.warehouse_id);
      if (response && response.success) {
        setAdjustments(response.adjustments);
      }
    } catch (error) {
      message.error("Failed to fetch adjustments");
    } finally {
      setLoading(false);
    }
  };
const handleApproveAll = async (adjustmentId) => {
  setLoading(true);
  try {
    const result = await handleApproveAdjustment(adjustmentId, token);
    if (result && result.success) {
      await fetchAdjustments(); // Refresh data
      message.success("Adjustment approved successfully");
    } else {
      message.error(result.message || "Failed to approve adjustment");
    }
  } catch (error) {
    message.error(error.message || "Error approving adjustment");
  } finally {
    setLoading(false);
  }
};
const handleApproveItem = async (adjustmentId,itemId) => {
  setLoading(true);
  try {
    const result = await handleApproveAdjustmentItem(adjustmentId,itemId, token);
    if (result && result.success) {
      await fetchAdjustments(); 
    } else {
      message.error(result.message || "Failed to approve adjustment");
    }
  } catch (error) {
    message.error(error.message || "Error approving adjustment");
  } finally {
    setLoading(false);
  }
};

const handleReject = async (adjustmentId, values) => {
  setLoading(true);
  try {
    const result = await handleRejectAdjustment(adjustmentId, values, token);
    if (result.success) {
      setAdjustments((prev) =>
        prev.map((a) =>
          a.id === adjustmentId ? { ...a, status: "rejected" } : a
        )
      );
      message.success("Adjustment rejected successfully");
    } else {
      message.error("Failed to reject adjustment");
    }
  } catch (error) {
    message.error("Error rejecting adjustment");
  } finally {
    setLoading(false);
  }
};
const handleRejectItem = async (adjustId, itemId, note) => {
  setLoading(true);
  try {
    const result = await handleRejectAdjustmentItem(adjustId, itemId, note, token);                
    if (result.success) {
      setAdjustments((prev) =>
        prev.map((a) =>
          a.id === adjustId ? { ...a, status: "rejected" } : a
        )
      );
    } else {
      message.error( "Failed to reject adjustment");
    }
  } catch (error) {
    message.error("Error rejecting adjustment");
  } finally {
    setLoading(false);
  }
};

  const fetchPermisson = async () => {
    let result = await handleRolePermission(user.role_id);
    if (result.success) {
      setPermission(result.rolePermissions);
    }
  }
  useEffect(() => {
    fetchAdjustments();
    fetchPermisson();
  }, []);
  const hasAdjustmentPermission = permissions.some(
    (p) => p.name === "Adjustment.create"
  );
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
    try {
      let result = await handleDeleteAdjustment(adjustmentId, token);
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

  return (
    <div className="product-management">
      <Spin spinning={loading}>
        <Card className="header-card" style={{ borderRadius: 0 }}>
          <div className="header-content">
            <div>
              <h2 style={{ color: '#52c41a' }}>Stock Adjustment</h2>
              <p>Manage your inventory adjustments</p>
            </div>
            {hasAdjustmentPermission && (
              <Button
                onClick={handleAddAdjustmentClick}
                type="primary"
                icon={<PlusOutlined />}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Add Adjustment
              </Button>
            )}
          </div>
        </Card>

        <Card className="filter-card" style={{ borderRadius: 0 }}>
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
          handleApproveAll={handleApproveAll}
          handleApproveItem={handleApproveItem}
          handleRejectAll={handleReject}
          handleRejectItem={handleRejectItem}
          loading={loading}
          currentUser={user}
          permissions = {permissions}
          />
      </Spin>
    </div>
  );
};

export default Adjustment;