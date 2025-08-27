import React, { useRef, useState } from 'react';
import { Modal, Button, Divider, Table, message } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css';
import './AdjustmentModalDetail.css';
import logo from '../../../assets/logo/DD_Home_Logo 2.jpg';

const AdjustmentModalDetail = ({ open, onCancel, onEdit, adjustment }) => {
  const invoiceRef = useRef();
  const [capturing, setCapturing] = useState(false);
  const downloadAsImage = () => {
    setCapturing(true);
    message.loading('Capturing image...', 0);

    setTimeout(() => {
      if (invoiceRef.current) {
        html2canvas(invoiceRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `adjustment-${adjustment?.reference || 'document'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.destroy();
          message.success('Image downloaded successfully!');
          setCapturing(false);
        }).catch(err => {
          message.destroy();
          message.error('Failed to capture image');
          console.error('Error capturing image:', err);
          setCapturing(false);
        });
      }
    }, 500);
  };

  const exportToExcel = () => {
    if (!adjustment?.items || adjustment.items.length === 0) {
      message.warning('No data to export');
      return;
    }

    try {
      // Prepare data for Excel
      const worksheetData = [
        ['No', 'Product', 'Quantity', 'Type', 'Unit']
      ];

      adjustment.items.forEach((item, index) => {
        worksheetData.push([
          index + 1,
          item.product?.name || 'N/A',
          item.qty || 0,
          item.operation?.toUpperCase() || 'N/A',
          item.unit || 'N/A'
        ]);
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Adjustment Items');

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `adjustment-${adjustment?.reference || 'export'}.xlsx`);

      message.success('Excel file downloaded successfully!');
    } catch (error) {
      message.error('Failed to export to Excel');
      console.error('Error exporting to Excel:', error);
    }
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
      title: 'Code',
      key: 'product.code',
      render: (_, record) => (
        <span className="product-code">
          {record.product?.code || 'N/A'}
        </span>
      ),
      width: '15%',
      align: 'center',
    },
        {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center',
      render: (_, record) => <span className="unit-value">{record.unit_name || 'N/A'}</span>,
      width: '15%',
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
      <div className="invoice-container" ref={invoiceRef}>
        <header className="invoice-header">
          <div className="header-left">
            <div className="company-logo">
              <img src={logo} alt="Logo" style={{ width: "90px", marginRight: "20px" }} />
            </div>
            <div className="header-info">
              <h1 className="document-title">STOCK ADJUSTMENT</h1>
              <p className="document-reference">Reference: {adjustment?.reference || '.............'}</p>
              <p className="document-reference">Adjuster: {adjustment?.adjuster?.username || '.............'}</p>
              <p className="document-reference">Warehouse: {adjustment?.warehouse?.name || '...........'}</p>
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
              style={{ border: "1px solid red" }}
            >
              Close
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadAsImage}
              className="image-button"
              loading={capturing}
            >
              Download as Image
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              className="excel-button"
            >
              Export to Excel
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