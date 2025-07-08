import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Select,
  Space,
  Popconfirm,
  message,
  Modal,
  Divider,
  Spin,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useStock } from "../../hooks/UseStock";
const { Search } = Input;
const { Option } = Select;
import Cookies from "js-cookie";
import PurchaseTable from "../../components/purchase/PurchaseTable";

function Purchases() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();
  const { handleGetPurchases,handleDeletePurchase } = useStock();
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user"));
  const [purchases, setPurchases] = useState([]);

  const handlePurchases = async () => {
    try {
      setTableLoading(true);
      setLoading(true);
      let values = {
        warehouse_id: userData.warehouse_id ?? null,
        approval: "approved"
      };      
      const result = await handleGetPurchases(values, token);    
      if (result.success) {
        setPurchases(result.purchases.map(purchase => ({
          ...purchase,
          id: purchase.id.toString(),
          date: new Date(purchase.date).toLocaleDateString(),
          supplier: purchase.supplier?.username,
          paymentMethod: purchase.paymentMethod?.name || purchase.paymentMethod
        })));
        setLoading(false);
      }
      
    } catch (error) {
      message.error("Failed to fetch purchases");
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };
  
  useEffect(() => {
    handlePurchases();
  }, []);
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (purchase.supplier?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setLoading(true);
    navigate("/purchase/add");
    setLoading(false);
  };

  const handleEdit = (row) => {
    setLoading(true);
    navigate(`/purchases/edit/${row.id}`);
    setLoading(false);
  };

  const handleDelete = async(id) => {
    let result = await handleDeletePurchase(id , token);
    if (result.success) {
      setPurchases(purchases.filter(p => p.id !== id));
      message.success("Purchase deleted successfully");
    }
  };

  const handleViewDetails = (row) => {
    setCurrentPurchase(row);
    setIsModalVisible(true);
  };

  const customStyles = {
    rows: {
      style: {
        minHeight: '72px', 
      },
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        backgroundColor: '#fafafa',
        fontWeight: 'bold',
      },
    },
    cells: {
      style: {
        paddingLeft: '8px', 
        paddingRight: '8px',
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <div className="purchase-management">
        <Card className="header-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2>Purchase Management</h2>
              <p>Track and manage all purchase orders</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Purchase
            </Button>
          </div>
        </Card>

        <Card className="filter-card">
          <Space size="large">
            <Search
              placeholder="Search purchases..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              placeholder="Filter by status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Button icon={<FilterOutlined />}>
              More Filters
            </Button>
          </Space>
        </Card>

           <PurchaseTable
            purchases={purchases}
            loading={loading}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
      </div>
    </Spin>
  );
}

export default Purchases;