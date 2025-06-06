import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Cookies from "js-cookie";
import { useSale } from "../../hooks/UseSale";
import {
  Button,
  Card,
  Input,
  Space,
  Popconfirm,
  message,
  Dropdown,
  Menu,
  Tag,
  Spin
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  DollarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import PosSaleDetail from "../../components/pos/PosDetail";
import AddPaymentModal from "../../components/pos/payment/AddPayment";
import ViewPaymentModal from "../../components/pos/payment/ViewPayment";
import "./PosSale.css";

const PosSaleList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isViewPaymentModalVisible, setIsViewPaymentModalVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const { handlePosSales, handleDeleteSalePos } = useSale();
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user") || "{}");

  useEffect(() => {
    fetchSales();
  }, [token, userData.warehouse_id]);

  useEffect(() => {
    const result = sales.filter((sale) => {
      const reference = sale?.reference || "";
      const customerName = sale?.customerName || "";
      return (
        reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredSales(result);
  }, [
    searchTerm,
    sales,
    isModalVisible,
    isPaymentModalVisible,
    isViewPaymentModalVisible,
    currentSale,
  ]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const result = await handlePosSales(userData.warehouse_id, token);
      console.log(result);
      
      if (result?.success) {
        const formattedSales = result.sales.map((sale) => ({
          id: sale.id,
          reference: sale.reference,
          customerName: sale?.customerName || "Walk-in Customer",
          saleDate: sale.saleDate,
          totalPrice: parseFloat(sale.totalPrice || 0),
          discount: parseFloat(sale.discount || 0),
          subTotal: parseFloat(sale.subTotal || 0),
          paymentStatus: sale.status || "pending",
          items: sale.items || [],
          paid: parseFloat(sale.paid || 0),
          balance: parseFloat(sale.balance || 0),
          note: sale.note || "",
          payments: sale.payment || [], 
        }));
        setSales(formattedSales);
        setFilteredSales(formattedSales);
      } else {
        message.error("Failed to load sales");
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      message.error("Error loading sales");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = (sale) => {
    setCurrentSale(sale);
    setIsModalVisible(true);
  };

  const handleEdit = (sale) => {
    console.log("Edit Sale Clicked:", sale);
    setCurrentSale(sale);
    message.info("Edit functionality is a placeholder. Implement API call as needed.");
  };

  const handleDelete = async (saleId) => {
    try {
      const result = await handleDeleteSalePos(saleId, token);
      if (result?.success) {
        setSales(sales.filter((s) => s.id !== saleId));
        message.success(`Sale ${saleId} deleted successfully`);
      } else {
        message.error("Failed to delete sale");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      message.error("Error deleting sale");
    }
  };

  const handleAddPayment = (sale) => {
    console.log("Add Payment Clicked:", sale);
    setCurrentSale(sale);
    setIsPaymentModalVisible(true);
  };

  const handleViewPayment = (sale) => {
    console.log("View Payment Clicked:", sale);
    setCurrentSale(sale);
    setIsViewPaymentModalVisible(true);
  };

  const handlePaymentSubmit = (sale) => {
    console.log("Payment Submitted for Sale:", sale);
    setIsPaymentModalVisible(false);
  };

  const ActionMenu = (row) => {
    const items = [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => handleViewSale(row),
      },
      ...(row.paymentStatus?.toLowerCase().trim() !== 'paid' ? [{
        key: 'add-payment',
        icon: <DollarOutlined />,
        label: 'Add Payment',
        onClick: () => handleAddPayment(row),
      }] : []),
      {
        key: 'view-payment',
        icon: <HistoryOutlined />,
        label: 'View Payment',
        onClick: () => handleViewPayment(row),
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
        label: (
          <Popconfirm
            title="Are you sure to delete this sale?"
            onConfirm={() => handleDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            Delete
          </Popconfirm>
        ),
      },
    ];

    return { items };
  };




  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "Date/Time",
      selector: (row) => row.saleDate,
      sortable: true,
      cell: (row) => new Date(row.saleDate).toLocaleString(),
      width: "15%",
    },
    {
      name: "Reference",
      selector: (row) => row.reference,
      sortable: true,
      cell: (row) => <strong>{row.reference}</strong>,
      width: "12%",
    },
    {
      name: "Customer",
      selector: (row) => row.customerName,
      sortable: true,
      width: "20%",
    },
    {
      name: "Total ($)",
      selector: (row) => row.totalPrice,
      sortable: true,
      cell: (row) => `$${row.totalPrice.toFixed(2)}`,
      width: "10%",
    },
    {
      name: "Paid ($)",
      selector: (row) => row.paid,
      sortable: true,
      cell: (row) => `$${row.paid.toFixed(2)}`,
      width: "10%",
    },
    {
      name: "Discount ($)",
      selector: (row) => row.discount,
      sortable: true,
      cell: (row) => `$${row.discount.toFixed(2)}`,
      width: "10%",
    },
    {
      name: "Sub Total ($)",
      selector: (row) => row.subTotal,
      sortable: true,
      cell: (row) => `$${row.subTotal.toFixed(2)}`,
      width: "10%",
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Space size="middle">
          <Dropdown menu={ActionMenu(row)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined style={{ color: '#52c41a' }} />} />
          </Dropdown>
        </Space>
      ),
      width: '120px',
    }

  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
      },
    },
  };

  return (
    <Spin spinning={loading}>
      <div className="pos-sale-management">
        {/* Header */}
        <Card className="header-card">
          <div className="header-content">
            <div>
              <h1 style={{ color: "#52c41a" }}>POS Sale Management</h1>
              <p>Manage your point of sale transactions</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info("Add sale functionality requires POS integration")}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Add Sale
            </Button>
          </div>
        </Card>

        {/* Filter Bar */}
        <Card className="filter-card">
          <div className="filter-content">
            <Input
              placeholder="Search sales by invoice # or customer..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <div className="filter-controls">
              <Button
                icon={<FilterOutlined />}
                style={{ color: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => message.info("Advanced filters coming soon!")}
              >
                Advanced Filters
              </Button>
            </div>
          </div>
        </Card>

          <DataTable
            columns={columns}
            data={filteredSales}
            // progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            striped
            onRowClicked={(row, event) => {
              if (!event.target.closest(".rdt_TableCell:last-child")) {
                handleViewSale(row);
              }
            }}
          />

        {/* Sale Detail Modal */}
        <PosSaleDetail
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          sale={currentSale}
          onEdit={handleEdit}
        />

        {/* Add Payment Modal */}
        <AddPaymentModal
          open={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          sale={currentSale}
          onSubmit={handlePaymentSubmit}
        />

        {/* View Payment Modal */}
        <ViewPaymentModal
          open={isViewPaymentModalVisible}
          onCancel={() => setIsViewPaymentModalVisible(false)}
          sale={currentSale}
        />
      </div>

      </Spin>
  );
};

export default PosSaleList;