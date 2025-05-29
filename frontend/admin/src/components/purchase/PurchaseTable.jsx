import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Dropdown, Space, Tag } from "antd";
import {
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import PurchaseModalDetail from "../../components/purchase/PurchaseModalDetail";

const PurchaseTable = ({ purchases, loading, handleEdit, handleDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const showModal = (purchase) => {
    const transformedPurchase = {
      id: purchase.id,
      reference: purchase.reference || "N/A",
      supplier:
        typeof purchase.supplier === "object"
          ? purchase.supplier.name || purchase.supplier.username || "N/A"
          : purchase.supplier || "N/A",
      createdBy: {
        username:
          typeof purchase.purchaser === "object"
            ? purchase.purchaser.name || purchase.purchaser.username || "N/A"
            : purchase.purchaser || "N/A",
      },
      date: purchase.date || new Date().toISOString(),
      note: purchase.note || "",
      status: purchase.approval || "pending",
      items: purchase.purchase_items || [],
      payments:purchase.payments , 
      total: parseFloat(purchase.total || 0),
    };
    setSelectedPurchase(transformedPurchase);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (selectedPurchase) {
      console.log("Selected Purchase:", selectedPurchase);
    }
  }, [selectedPurchase]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
  };

  const items = (purchase) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "View Details",
      onClick: () => showModal(purchase),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => handleEdit(purchase),
    },
    {
      key: "status",
      icon: purchase.approval === "approved" ? <CheckOutlined /> : <CloseOutlined />,
      label: purchase.approval === "approved" ? "Mark as Pending" : "Mark as Approved",
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      danger: true,
      onClick: () => handleDelete(purchase.id),
    },
  ];

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
            row.approval === "approved" ? "green" : row.approval === "request" ? "orange" : "blue"
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
        <>
          <div>
            {
              Array.isArray(row.payments) && row.payments.length > 0
                ? row.payments.map((p, index) => (
                    <div key={index}>{     p.paid+' | '+p.payment_type || ""}</div>
                  ))
                : null
            }
          </div>


        </>
      ),
      width: "10%",
    },

    {
      name: "Note",
      selector: (row) => row.note,
      sortable: true,
      cell: (row) => <span>{row.note || null}</span>,
      width: "15%",
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
            menu={{ items: items(row) }}
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
        onRowClicked={(row) => showModal(row)}
      />
      {selectedPurchase && (
        <PurchaseModalDetail
          open={isModalOpen}
          onCancel={handleCancel}
          onEdit={() => {
            handleEdit(selectedPurchase);
            handleCancel();
          }}
          purchase={selectedPurchase}
        />
      )}
    </div>
  );
};

export default PurchaseTable;