import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Divider, Table } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';
// import "./SaleModalDetail.css";
const SaleModalDetail = ({ open, onCancel, onEdit, sale }) => {
  const printRef = useRef();
  const [isPrintReady, setIsPrintReady] = useState(false);

  // useEffect(() => {
  //   console.log('Modal open:', open);
  //   console.log('printRef:', printRef.current);
  //   console.log('Sale data:', sale);
  //   console.log('Sale items:', sale?.items);
  // }, [open, sale]);

  useEffect(() => {
    if (!open) {
      setIsPrintReady(false);
      console.log('Modal closed, resetting print state');
    }
  }, [open]);

  const calculateTotal = () => {
    if (!sale || !sale.items) return 0;
    return sale.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2);
  };

  const fillEmptyRows = (items) => {
    const minRows = 20; 
    const emptyRow = {
      productName: '',
      unit: '',
      quantity: '',
      price: '',
      discount: '',
      total: '',
    };
    const filledItems = [...(items || [])];
    while (filledItems.length < minRows) {
      filledItems.push({ ...emptyRow, key: `empty-${filledItems.length}` });
    }
    return filledItems;
  };

  const handlePrint = () => {
    if (!printRef.current) {
      console.error('printRef is null, cannot print');
      alert('Cannot print: Content is not available. Check console for details.');
      setIsPrintReady(false);
      return;
    }

    setIsPrintReady(true);
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      console.error('Failed to open print window. Check pop-up blocker.');
      alert('Failed to open print window. Please allow pop-ups for this site.');
      setIsPrintReady(false);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${sale?.reference || 'N/A'}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Roboto', Arial, sans-serif; color: #333; }
            .invoice-container { padding: 20px; width: 100%; max-width: 900px; margin: 0 auto; }
            .no-print { display: none; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; }
            .header-left, .header-right { width: 45%; }
            .company-logo img { width: 120px; margin-bottom: 15px; }
            .document-title { font-size: 30px; font-weight: 700; color: #1a3c34; margin: 0; }
            .invoice-details, .customer-details { font-size: 14px; color: #555; line-height: 1.6; }
            .section-divider { border-top: 0.1px solid #1a3c34; margin: 25px 0; }
            .notes-section { margin-bottom: 25px; }
            .notes-section .section-title { font-size: 16px; font-weight: 600; color: #1a3c34; }
            .note-text { font-size: 14px; color: #333; line-height: 1.6; }
            .ant-table { border: 1px solid #e8e8e8; border-radius: 4px; min-height: 600px; }
            .ant-table-content { min-height: 600px; display: flex; flex-direction: column; }
            .ant-table-tbody { flex: 1; }
            .ant-table-tbody > tr > td { border-bottom: 1px solid #e8e8e8; font-size: 13px; color: #333; padding: 12px; }
            .ant-table-tbody > tr:empty > td { border-bottom: none; }
            .ant-table-thead > tr > th { background: #f5f5f5; font-weight: 600; color: #1a3c34; border-bottom: 2px solid #1a3c34; font-size: 14px; padding: 12px; }
            .ant-table-tbody > tr:nth-child(odd) { background: #fafafa; }
            .total-section { margin-top: 25px; text-align: right; padding: 15px; background: #f5f5f5; border-radius: 4px; }
            .total-label { font-size: 16px; font-weight: 700; color: #1a3c34; margin-right: 15px; }
            .total-amount { font-size: 18px; font-weight: 700; color: #d32f2f; }
            .footer-notes { margin-top: 25px; font-size: 12px; color: #555; text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrintReady(false);
    }, 500);
  }

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (text, record, index) => <span>{record.productName ? index + 1 : ''}</span>,
      width: '5%',
    },
    {
      title: 'Product',
      key: 'productName',
      render: (record) => <span>{record.productName || ''}</span>,
      width: '25%',
      align: 'left',
    },
    {
      title: 'Unit',
      key: 'unit',
      render: (record) => <span>{record.unit || ''}</span>,
      width: '15%',
      align: 'center',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (record) => <span>{record.quantity || ''}</span>,
      width: '10%',
      align: 'center',
    },
    {
      title: 'Price ($)',
      key: 'price',
      render: (_, record) => <span>{record.price ? parseFloat(record.price).toFixed(2) : ''}</span>,
      width: '15%',
      align: 'right',
    },
    {
      title: 'Discount ($)',
      key: 'discount',
      render: (_, record) => <span>{record.discount ? parseFloat(record.discount).toFixed(2) : ''}</span>,
      width: '15%',
      align: 'right',
    },
    {
      title: 'Total ($)',
      key: 'total',
      render: (_, record) => <span>{record.total ? parseFloat(record.total).toFixed(2) : ''}</span>,
      width: '15%',
      align: 'right',
    },
  ];

  // Guard clause for missing sale data
  if (!sale) {
    console.log('No sale data provided');
    return (
      <Modal open={open} onCancel={onCancel} footer={null} width="60%">
        <div>No sale data available</div>
      </Modal>
    );
  }

  // Company details (hardcoded or extend sale prop if needed)
  const companyDetails = {
    name: 'DD Home',
    address: '123 Business Street, City, Country',
    phone: '+1 (123) 456-7890',
    email: 'contact@ddhome.com',
  };

  return (
    <Modal
      className="stock-modal"
      open={open}
      onCancel={onCancel}
      footer={null}
      width="50%"
      styles={{ body: { padding: 0 } }}
      destroyOnClose={false}
    >
      <div
        ref={printRef}
        className="invoice-container"
        style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <header className="invoice-header" style={{ paddingBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              // flexDirection: 'column',
              // alignItems: 'center',
              // textAlign: 'center',
              // marginBottom: '20px'
            }}
          >
            <img src={logo} alt="Logo" style={{ width: '120px' }} />
            <div style={{marginLeft:10}}>
              <p style={{ fontSize: '18px', fontWeight: 'bold'}}>
                {companyDetails.name}
              </p>
              <p style={{ fontSize: '14px',}}>
                    Invoice #: {sale.reference || 'N/A'}
              </p>

              <p style={{ fontSize: '14px',}}>
                    Customer: {sale.customerName || 'N/A'}
              </p>

            </div>
          </div>

          <div
            style={{
              display: 'flex',
              // justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <p style={{ fontSize: '14px',}}>
                Date: {sale.saleDate || 'N/A'}
              </p>

          </div>
        </header>


        <Divider className="section-divider" style={{ borderTop: '2px solid #1a3c34', margin: '25px 0' }} />

        {sale.note && (
          <section className="notes-section" style={{ marginBottom: '25px' }}>
            <Divider orientation="left" className="section-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1a3c34' }}>
              Notes
            </Divider>
            <div className="notes-content">
              <p className="note-text" style={{ fontSize: '14px', color: '#333', lineHeight: 1.6 }}>{sale.note}</p>
            </div>
          </section>
        )}

        <Table
          dataSource={fillEmptyRows(sale.items)}
          columns={columns}
          pagination={false}
          rowKey={(record) => record.id || record.key || record.product?.id || JSON.stringify(record)}
          bordered
          size="middle"
          className="items-table"
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-even' : 'table-row-odd')}
          style={{ minHeight: '600px', marginBottom: '25px' }}
        />

        <div className="total-section" style={{ textAlign: 'right', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <span className="total-label" style={{ fontSize: '16px', fontWeight: 700, color: '#1a3c34', marginRight: '15px' }}>
            Total Amount:
          </span>
          <span className="total-amount" style={{ fontSize: '18px', fontWeight: 700, color: '#d32f2f' }}>
            ${calculateTotal()}
          </span>
        </div>

        <div className="footer-notes" style={{ marginTop: '25px', fontSize: '12px', color: '#555', textAlign: 'center' }}>
          <p style={{ margin: '2px 0' }}>Thank you for your business!</p>
          <p style={{ margin: '2px 0' }}>Payment Terms: Due within 30 days. Please contact us at {companyDetails.email} for any inquiries.</p>
        </div>
      </div>

      <footer
        className="invoice-footer no-print"
        style={{ padding: '15px 20px', background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}
      >
        <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button
            onClick={onCancel}
            icon={<CloseOutlined />}
            className="close-button"
            style={{ border: '1px solid #d32f2f', color: '#d32f2f', borderRadius: '4px' }}
          >
            Close
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="print-button"
            loading={isPrintReady}
            disabled={!open}
            style={{ color: '#52c41a', borderRadius: '4px' }}
          >
            Print Invoice
          </Button>
        </div>
      </footer>
    </Modal>
  );
};

export default SaleModalDetail;