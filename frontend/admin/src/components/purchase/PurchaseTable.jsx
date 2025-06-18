import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Dropdown, Space, Tag, Modal, message } from 'antd';
import {
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  EyeOutlined,
  DollarOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import PurchaseModalDetail from '../../components/purchase/PurchaseModalDetail';
import ViewPaymentModal from '../../components/purchase/payment/ViewPayment';
import AddPaymentModal from '../../components/purchase/payment/AddPayment';
import EditPaymentModal from '../../components/purchase/payment/EditPayment';

const PurchaseTable = ({ purchases, loading, handleEdit, handleDelete }) => {
  // Modal states
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [viewPaymentModalVisible, setViewPaymentModalVisible] = useState(false);
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [editPaymentModalVisible, setEditPaymentModalVisible] = useState(false);
  
  // Selected items
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Show purchase details modal
  const showPurchaseModal = (purchase) => {
    const transformedPurchase = {
      id: purchase.id,
      reference: purchase.reference || "N/A",
      supplier: typeof purchase.supplier === "object"
        ? purchase.supplier.name || purchase.supplier.username || "N/A"
        : purchase.supplier || "N/A",
      createdBy: {
        username: typeof purchase.purchaser === "object"
          ? purchase.purchaser.name || purchase.purchaser.username || "N/A"
          : purchase.purchaser || "N/A",
      },
      date: purchase.date || new Date().toISOString(),
      note: purchase.note || "",
      status: purchase.approval || "pending",
      items: purchase.purchase_items || [],
      payments: purchase.payments || [], 
      total: parseFloat(purchase.total || 0),
    };
    setSelectedPurchase(transformedPurchase);
    setPurchaseModalVisible(true);
  };

  // Payment actions
  const handleViewPayment = (purchase) => {
    if (purchase.payments?.length > 0) {
      setSelectedPayment(purchase.payments[0]); // View first payment
      setViewPaymentModalVisible(true);
    } else {
      Modal.info({
        title: 'No Payments',
        content: 'This purchase has no payments recorded yet.',
      });
    }
  };

  const handleAddPayment = (purchase) => {
    setSelectedPurchase(purchase);
    setAddPaymentModalVisible(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditPaymentModalVisible(true);
  };

  // Payment CRUD operations
  const handlePaymentAdded = (newPayment) => {
    // API call or state update would go here
    message.success('Payment added successfully');
    setAddPaymentModalVisible(false);
  };

  const handlePaymentUpdated = (updatedPayment) => {
    // API call or state update would go here
    message.success('Payment updated successfully');
    setEditPaymentModalVisible(false);
  };

  // Dropdown menu items
  const getDropdownItems = (purchase) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Details",
      onClick: () => showPurchaseModal(purchase),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(purchase),
    },
    {
      key: "view-payment",
      icon: <DollarOutlined />,
      label: "View Payment",
      onClick: () => handleViewPayment(purchase),
    },
    {
      key: "add-payment",
      icon: <PlusCircleOutlined />,
      label: "Add Payment",
      onClick: () => handleAddPayment(purchase),
    },
    { type: "divider" },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => handleDelete(purchase.id),
    },
  ];

  // Table columns
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      cell: (row, index) => <strong>{index + 1}</strong>,
      width: "5%",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).getTime(),
      sortable: true,
      cell: (row) => <span>{new Date(row.date).toLocaleDateString()}</span>,
      width: "10%",
    },
    {
      name: "Reference",
      selector: (row) => row.reference,
      sortable: true,
      cell: (row) => <span>{row.reference || "N/A"}</span>,
      width: "10%",
    },
    {
      name: "Supplier",
      selector: (row) => (typeof row.supplier === "object" ? row.supplier.name : row.supplier),
      sortable: true,
      cell: (row) => (
        <strong>
          {typeof row.supplier === "object"
            ? row.supplier.name || row.supplier.username || "N/A"
            : row.supplier || "N/A"}
        </strong>
      ),
      width: "10%",
    },
    {
      name: "Purchaser",
      selector: (row) => (typeof row.purchaser === "object" ? row.purchaser.name : row.purchaser),
      sortable: true,
      cell: (row) => (
        <strong>
          {typeof row.purchaser === "object"
            ? row.purchaser.name || row.purchaser.username || "N/A"
            : row.purchaser || "N/A"}
        </strong>
      ),
      width: "10%",
    },
    {
      name: "Status",
      selector: (row) => row.approval,
      sortable: true,
      cell: (row) => (
        <Tag
          color={
            row.approval === "approved" ? "green" : 
            row.approval === "request" ? "orange" : "blue"
          }
        >
          {row.approval?.toUpperCase() || "N/A"}
        </Tag>
      ),
      width: "10%",
    },
    {
      name: "Total",
      selector: (row) => parseFloat(row.total || 0),
      sortable: true,
      cell: (row) => <strong>${parseFloat(row.total || 0).toFixed(2)}</strong>,
      width: "10%",
    },
    {
      name: "Payment",
      selector: (row) => row.payments?.map(p => p.payment_type).join(", "),
      sortable: true,
      cell: (row) => (
        <div>
          {Array.isArray(row.payments) && row.payments.length > 0 ? (
            row.payments.map((p, index) => (
              <div key={index}>
                <Tag 
                  color={p.status === 'completed' ? 'green' : 'orange'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPayment(p);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  ${p.amount} | {p.payment_type}
                </Tag>
              </div>
            ))
          ) : (
            <Tag color="red">No Payment</Tag>
          )}
        </div>
      ),
      width: "15%",
    },
    {
      name: "Note",
      selector: (row) => row.note,
      sortable: true,
      cell: (row) => <span>{row.note || null}</span>,
      width: "10%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#52c41a" }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          />
          <Dropdown
            menu={{ items: getDropdownItems(row) }}
            trigger={["click"]}
            placement="bottomRight"
            onClick={(e) => e.stopPropagation()}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
      width: "10%",
      ignoreRowClick: true,
      button: true,
    },
  ];

  // Table styles
  const customStyles = {
    table: {
      style: {
        border: "1px solid #e8e8e8",
        borderRadius: "4px",
      },
    },
    head: {
      style: {
        backgroundColor: "#fafafa",
        borderBottom: "1px solid #e8e8e8",
      },
    },
    headCells: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        color: "#000000",
        padding: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        padding: "12px",
        borderBottom: "1px solid #f0f0f0",
      },
    },
    rows: {
      style: {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e8e8e8",
        padding: "12px",
      },
    },
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={purchases}
        progressPending={loading}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        customStyles={customStyles}
        highlightOnHover
        onRowClicked={(row) => showPurchaseModal(row)}
      />

      {/* Purchase Detail Modal */}
      <PurchaseModalDetail
        open={purchaseModalVisible}
        onCancel={() => setPurchaseModalVisible(false)}
        onEdit={() => {
          handleEdit(selectedPurchase);
          setPurchaseModalVisible(false);
        }}
        purchase={selectedPurchase}
      />

      {/* Payment Modals */}
      <ViewPaymentModal
        payment={selectedPayment}
        visible={viewPaymentModalVisible}
        onCancel={() => setViewPaymentModalVisible(false)}
      />

      <AddPaymentModal
        purchase={selectedPurchase}
        visible={addPaymentModalVisible}
        onCreate={handlePaymentAdded}
        onCancel={() => setAddPaymentModalVisible(false)}
      />

      <EditPaymentModal
        payment={selectedPayment}
        visible={editPaymentModalVisible}
        onUpdate={handlePaymentUpdated}
        onCancel={() => setEditPaymentModalVisible(false)}
      />
    </div>
  );
};

export default PurchaseTable;