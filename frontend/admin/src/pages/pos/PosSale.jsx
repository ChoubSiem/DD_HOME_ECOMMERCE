import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Cookies from "js-cookie";
import { useSale } from "../../hooks/UseSale";
import { Button, Card, Input, Space, Popconfirm, message, Dropdown, Menu, Tag, Spin} from "antd";
import { SearchOutlined, PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, DollarOutlined, HistoryOutlined, RollbackOutlined} from "@ant-design/icons";
import PosSaleDetail from "../../components/pos/PosDetail";
import AddPaymentModal from "../../components/pos/payment/AddPayment";
import ViewPaymentModal from "../../components/pos/payment/ViewPayment";
import "./PosSale.css";
import { useNavigate } from "react-router-dom";

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
  const navigate  = useNavigate();
  const handleAddSaleReturn = (saleId, type) => {
    navigate(`/sale-return/add/${type}/${saleId}`);
  }
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
    setCurrentSale(sale);
    setIsPaymentModalVisible(true);
  };

  const handleViewPayment = (sale) => {
    setCurrentSale(sale);
    setIsViewPaymentModalVisible(true);
  };

  const handlePaymentSubmit = (sale) => {
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
        key: 'add-sale-return',
        icon: <RollbackOutlined />, 
        label: 'Add Sale Return',
        onClick: () => handleAddSaleReturn(row.id,'pos'),
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
      name: "Sub Total ($)",
      selector: (row) => row.subTotal,
      sortable: true,
      cell: (row) => `$${row.subTotal.toFixed(2)}`,
      width: "10%",
    },
    {
      name: "Discount ($)",
      selector: (row) => row.discount,
      sortable: true,
      cell: (row) => `$${row.discount} `,
      width: "10%",
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
      name: 'Actions',
      cell: (row) => (
        <Space size="middle">
          <Dropdown menu={ActionMenu(row)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined style={{ color: '#52c41a' }} />} />
          </Dropdown>
        </Space>
      ),
      width: '100px',
    }

  ];

  const customStyles = {
    table: {
      style: {
        maxHeight: '500px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold'
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
              <h1 style={{ color: "#52c41a" }}>POS Sale</h1>
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
            pagination                   // enable pagination
  paginationPerPage={10}       // rows per page
  paginationRowsPerPageOptions={[10, 25, 50, 100,500]} 
            fixedHeader 
            fixedHeaderScrollHeight="500px" 
            customStyles={{
              ...customStyles,
              table: {
                style: {
                  maxHeight: '500px',
                },
              },
            }}
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