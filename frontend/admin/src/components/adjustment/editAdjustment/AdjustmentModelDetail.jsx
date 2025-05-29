import React from 'react';
import { Modal, Button, Divider, Table } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './AdjustmentModalDetail.css';
import logo from '../../../assets/logo/DD_Home_Logo 2.jpg';
const AdjustmentModalDetail = ({ open, onCancel, onEdit, adjustment }) => {
  const handlePrint = () => {
    window.print();
  };  

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (text, record, index) => <span>{index + 1}</span>,
      width: '5%',
    },
    
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product) => <span className="product-name">{product?.name || 'N/A'}</span>,
      width: '35%',
      align: 'center',

    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      render: (quantity) => <span className="quantity-value">{quantity?.toLocaleString() || 'N/A'}</span>,
      width: '15%',
      align: 'center',

    },
    {
      title: 'Type',
      dataIndex: 'operation',
      key: 'operation',
      render: (type) => (
        <span className={`adjustment-type ${type === 'add' ? 'add-type' : 'remove-type'}`}>
          {type?.toUpperCase() || 'N/A'}
        </span>
      ),
      align: 'center',
      width: '15%',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center',
      render: (unit) => <span className="unit-value">{unit || 'N/A'}</span>,
      width: '15%',
    }
  ];

  return (
    <Modal
      className="adjustment-modal"
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
              <img src={logo} alt="Logo" style={{width:"90px",marginRight:"20px"}}/>
            </div>
            <div className="header-info">
              <h1 className="document-title">STOCK ADJUSTMENT</h1>
              <p className="document-reference">Reference: {adjustment?.reference || '.............'}</p>
              <p className="document-reference">Adjuster: {adjustment?.adjuster?.username || '.............'}</p>
              <p className="document-reference">Warehouse: {adjustment?.warehouse || '...........'}</p>
            </div>
          </div>
          <div className="header-right">
            <p className="document-date">
              {adjustment?.date ? new Date(adjustment.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) : 'N/A'}
            </p>
          </div>
        </header>
        <main className="invoice-body">
          <Divider className="section-divider" />

          {adjustment?.note && (
            <section className="notes-section">
              <Divider orientation="left" className="section-title">Notes</Divider>
              <div className="notes-content">
                <p className="note-text">{adjustment.note}</p>
              </div>
            </section>
          )}

            <Table
              dataSource={adjustment?.items || []}
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
              style={{border:"1px solid red"}}
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
              Edit Adjustment
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default AdjustmentModalDetail;