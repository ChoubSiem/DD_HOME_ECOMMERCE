import React, { useState,useEffect } from "react";
import { Modal, Descriptions, Table, Empty, Tag } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import "./ViewPayment.css";
import { useSale } from "../../../hooks/UseSale";

const ViewPaymentModal = ({ open, onCancel, sale }) => {
  const {handleGetPaymentOne} = useSale();
  const token = localStorage.getItem('token');
  const [payments , setPayments] = useState([]);
  const handleGetPaymentOneData = async() =>{
    let result = await handleGetPaymentOne(sale.id ,token);      
    if (result.success) {
      setPayments(result.payments);
    }
  }

useEffect(() => {
  if (open && sale?.id) {
    handleGetPaymentOneData();
  }
}, [open, sale]);

  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => index + 1,
      width: "10%",
    },
    {
      title: "Payment Date",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
      width: "20%",
    },
    {
      title: "Amount",
      dataIndex: "paid",
      key: "paid",
      render: (paid) => `$${parseFloat(paid || 0).toFixed(2)}`,
      width: "15%",
    },
    {
  title: "Payment Method",
  dataIndex: "payment_method",  // fix typo here to match your data property
  key: "payment_method",
  render: (method) => {
    const methodMap = {
      cash: "Cash",
      credit: "Credit Card",       // map 'credit' to 'Credit Card'
      credit_card: "Credit Card",  // keep for possible other values
      bank_transfer: "Bank Transfer",
      check: "Check",
    };
    return (
      <Tag color="#52c41a">{methodMap[method] || method || "N/A"}</Tag>
    );
  },
  width: "20%",
}
,
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "-",
      width: "35%",
    },
  ];
  
  return (
    <Modal
      title="View Payments"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
      className="view-payment-modal"
    >
      {sale ? (
        <>
          {/* Sale Details */}
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Invoice #">
              {sale.reference || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {sale.customerName || "Walk-in Customer"}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              ${parseFloat(sale.totalPrice || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Amount Paid">
              ${parseFloat(sale.paid || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Balance Due">
              ${parseFloat(sale.balance || 0).toFixed(2)}
            </Descriptions.Item>
          </Descriptions>

          {/* Payments Table */}
          {payments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={payments}
              rowKey={(record) => record.id || Math.random().toString(36).substring(2)}
              pagination={false}
              bordered
              size="middle"
              className="payments-table"
            />
          ) : (
            <Empty
              image={<HistoryOutlined style={{ fontSize: 48, color: "#52c41a" }} />}
              description="No payments recorded for this sale"
              style={{ margin: "40px 0" }}
            />
          )}
        </>
      ) : (
        <Empty description="No sale selected" />
      )}
    </Modal>
  );
};

export default ViewPaymentModal;