import React from 'react';
import DataTable from 'react-data-table-component';
import { Modal, Button, Divider } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import './PurchaseModalDetail.css';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';

const PurchaseModalDetail = ({ open, onCancel, onEdit, purchase }) => {
  const handlePrint = () => {
   
    window.print();
  };

  const Logo = () => (
    <img
      src={logo}
      alt="Logo"
      style={{ width: '70px', height: '70px' }}
    />
  );

  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '5%',
      center: true,
    },
    {
      name: 'Product',
      selector: (row) => row.product.name || 'N/A',
      width: '35%',
      center: true,
      cell: (row) => <span className="product-name">{row.product.name || 'N/A'}</span>,
    },
    {
      name: 'Unit',
      selector: (row) => row.unit.name || 'N/A',
      width: '15%',
      center: true,
      cell: (row) => <span className="unit-value">{row.unit.name || 'N/A'}</span>,
    },
    {
      name: 'Quantity',
      selector: (row) => row.qty || 'N/A',
      width: '15%',
      center: true,
      cell: (row) => <span className="quantity-value">{row.qty?.toLocaleString() || 'N/A'}</span>,
    },
    {
      name: 'Price',
      selector: (row) => row.price || 'N/A',
      width: '15%',
      center: true,
      cell: (row) => <span className="price-value">{row.price ? `$${row.price}` : 'N/A'}</span>,
    },
    {
      name: 'Total',
      selector: (row) => row.total_price || null,
      width: '15%',
      center: true,
      cell: (row) => <span className="total-value">{row.total_price ? `$${row.total_price}` :null}</span>,
    },
  ];

  const customStyles = {
    table: {
      style: {
        border: '1px solid #e8e8e8',
        borderRadius: '4px',
      },
    },
    head: {
      style: {
        backgroundColor: 'green !important',
        borderBottom: '1px solid #e8e8e8',
      },
    },
    headCells: {
      style: {
        fontWeight: '600',
        fontSize: '14px',
        color: '#000000',
        padding: '12px',
        justifyContent: 'center',
      },
    },
    cells: {
      style: {
        fontSize: '13px',
        padding: '12px',
        borderBottom: '1px solid #f0f0f0',
        justifyContent: 'center',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  };

  return (
    <Modal
      className="purchase-modal"
      open={open}
      onCancel={onCancel}
      footer={null}
      width="60%"
      styles={{ body: { padding: 0 } }}
      destroyOnClose
    >
      <div id="purchase-modal-content" className="invoice-container">
        <header className="invoice-header">
          <div className="header-left">
            <div className="company-logo">
              <Logo />
            </div>
            <div className="header-info">
              <h2 className="documentitle">PURCHASE ORDER</h2>
              <p className="document-reference">Reference: {purchase?.reference || '.............'}</p>
              <p className="document-reference">
                Supplier:{' '}
                {typeof purchase?.supplier === 'object'
                  ? purchase.supplier.name || purchase.supplier.username || '.............'
                  : purchase?.supplier || '.............'}
              </p>
              <p className="document-reference">
                Created By:{' '}
                {typeof purchase?.createdBy === 'object'
                  ? purchase.createdBy.username || purchase.createdBy.name || '.............'
                  : purchase?.createdBy || '.............'}
              </p>
            </div>
          </div>
          <div className="header-right">
            <p className="document-date">
              {purchase?.date
                ? new Date(purchase.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
        </header>

          <DataTable
            columns={columns}
            data={purchase?.items || []}
            noHeader
            customStyles={customStyles}
            noDataComponent={<span>No items found</span>}
            className="items-table"
          />
                  {purchase?.note && (
                            <p className="note-text">Note: {purchase.note}</p>
          )}          
        <footer className="invoice-footer">
          <div className="action-buttons">
            <Button onClick={onCancel} icon={<CloseOutlined />} className="close-button" style={{ border: '1px solid red' }}>
              Close
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint} className="print-button">
              Print Document
            </Button>
            <Button type="primary" onClick={onEdit} icon={<EditOutlined />} className="edit-button">
              Edit Purchase
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default PurchaseModalDetail;