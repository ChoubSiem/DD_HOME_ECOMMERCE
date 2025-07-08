import React from 'react';
import { Modal, Button, Divider, Table } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';

const StockModalDetail = ({ open, onCancel, onEdit, stock }) => {
  const handlePrint = () => {
    window.print();
  };
  
  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (text, record, index) => <span>{index + 1}</span>,
      width: '5%',
    },
    {
      title: 'Date',
      key: 'date',
      render: (record) => <span>{record.created_at?.slice(0, 10)}</span>,
      width: '20%',
      align: 'center',
    },


    {
      title: ' Product',
      key: 'date',
      render: (record) => <span>{record.product?.name || 'N/A'}</span>,
      width: '20%',
      align: 'center',
    },
    // {
    //   title: ' From',
    //   key: 'source_qty',
    //   render: (record) => <span>{record.source_qty || 0}</span>,
    //   width: '10%',
    //   align: 'center',
    // },
    // {
    //   title: 'To ',
    //   key: 'source_unit',
    //   render: (record) => <span>{record.source_unit?.name || 'N/A'}</span>,
    //   width: '10%',
    //   align: 'center',
    // },
    {
      title: 'Unit',
      key: 'destination_product',
      render: (record) => <span>{record.destination_product?.name || 'N/A'}</span>,
      width: '20%',
      align: 'center',
    },
    {
      title: 'QTY',
      key: 'destination_qty',
      render: (record) => <span>{record.quantity || 0}</span>,
      width: '10%',
      align: 'center',
    },
  ];
  

  return (
    <Modal
      className="stock-modal"
      open={open}
      onCancel={onCancel}
      footer={null}
      width="60%"
      styles={{ body: { padding: 0 } }}
      destroyOnClose
    >
      <div className="invoice-container">
        <header className="invoice-header">
          <div className="header-left">
            <div className="company-logo">
              <img src={logo} alt="Logo" style={{ width: "90px", marginRight: "20px" }} />
            </div>
            <div className="header-info">
              <h1 className="document-title">STOCK TRANSFER</h1>
              <p className="document-reference">Transfer User: {stock?.transfer_user?.username || '.............'}</p>
              <p className="document-reference">Warehouse: {stock?.warehouse?.name || '...........'}</p>
            </div>
          </div>
          <div className="header-right">
            <p className="document-date">
              {stock?.date ? new Date(stock.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) : 'N/A'}
            </p>
          </div>
        </header>

        <main className="invoice-body">
          <Divider className="section-divider" />

          {stock?.note && (
            <section className="notes-section">
              <Divider orientation="left" className="section-title">Notes</Divider>
              <div className="notes-content">
                <p className="note-text">{stock.note}</p>
              </div>
            </section>
          )}

          <Table
            dataSource={stock?.items || []}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.id || record.key || record.product?.id || JSON.stringify(record)}
            bordered
            size="middle"
            className="items-table"
            rowClassName={() => 'table-row'}
          />
        </main>

        <footer className="invoice-footer">
          <div className="action-buttons">
            <Button
              onClick={onCancel}
              icon={<CloseOutlined />}
              className="close-button"
              style={{ border: "1px solid red" }}
            >
              Close
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="print-button"
            >
              Print Document
            </Button>
            <Button
              type="primary"
              onClick={onEdit}
              icon={<EditOutlined />}
              className="edit-button"
            >
              Edit Stock
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default StockModalDetail;
