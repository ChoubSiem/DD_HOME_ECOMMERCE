import React, { useRef, useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Modal, Button } from 'antd';
import { PrinterOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './PurchaseModalDetail.css';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';
import { useCompany } from '../../hooks/UseCompnay';
import Cookies from "js-cookie";
const PurchaseModalDetail = ({ open, onCancel, onEdit, purchase }) => {
  const printRef = useRef();
  const [company,setCompany] = useState();
  const token = localStorage.getItem('token');
  const {handleCompany} = useCompany();
  const handleWarehouse = async() =>{
    let result = await handleCompany(token);    
    if (result.success) {
      setCompany(result.companies);
    }
  }
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return '';
      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return new Date(dateString).toLocaleString('en-GB', options);
    };
  }, []);  

  useEffect(()=>{
    handleWarehouse();
  },[purchase])
  const handlePrint = async () => {
    try {
      const element = printRef.current;
      const actionButtons = element.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const xPos = 10; // Left margin

      pdf.addImage(imgData, 'PNG', xPos, 10, pdfWidth, pdfHeight);
      window.open(pdf.output('bloburl'), '_blank');

      if (actionButtons) actionButtons.style.display = 'flex';
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  console.log('Purchase Data:', purchase);
  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calculate totals
  const subtotal = purchase?.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;  
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = parseFloat(subtotal + tax).toFixed(2);

  const columns = [
    {
      name: '#',
      selector: (_, index) => index + 1,
      width: '40px',
      center: true
    },
    {
      name: 'Code',
      selector: (row) => row.product?.code || 'N/A',
      grow: 1,
      cell: (row) => <div className="product-cell">{row.product?.code || 'N/A'}</div>
    },
    {
      name: 'Name',
      selector: (row) => row.product?.name || 'N/A',
      grow: 2,
      cell: (row) => <div className="product-cell">{row.product?.name || 'N/A'}</div>
    },
    {
      name: 'QTY',
      selector: (row) => row.qty,
      width: '60px',
      center: true
    },
    {
      name: 'UNIT',
      selector: (row) => row.unit?.name || 'EA',
      width: '60px',
      center: true
    },
    {
      name: 'UNIT PRICE',
      selector: (row) => row.price,
      width: '90px',
      right: true,
      cell: (row) => formatCurrency(row.price)
    },
    {
      name: 'AMOUNT',
      selector: (row) => row.total_price,
      width: '90px',
      right: true,
      cell: (row) => formatCurrency(row.total_price)
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width="80%"
      style={{ maxWidth: '900px' }}
      className="purchase-modal"
      destroyOnClose
    >
      <div ref={printRef} className="invoice-container">
        <header className="invoice-headers">
                    <div className="logo">
                      <img src={logo} alt="DD Home Logo" />
                    </div>
                    <div className="header-title">
                      <h1><strong>PURCHASE INVOICE</strong></h1>
                    </div>
                    <div className="invoice-id">
                      <p><strong>{purchase?.reference || 'N/A'}</strong></p>
                    </div>
                    {/* <div className="company-details">
                      <h1 className="company-name">DD Home</h1>
                      <div className="company-info">
                        <h1>Purchase Invoice</h1>
                        <p><strong>Invoice Date: </strong>{formatDate(purchase?.date)}</p>
                        <p><strong>From: </strong>{purchase?.supplier_comapny}</p>
                        <p><strong>To: </strong>{purchase?.supplier_comapny}</p>
                        
                        <p><strong>Address:</strong> #114, St 20MC, Mean Chey, Phnom Penh, Cambodia</p>
                        <p><strong>Phone:</strong> 081 90 50 50 / 078 90 50 50</p>
                        <p><strong>Email:</strong> ddhomekh@gmail.com</p>
                        <p><strong>Website:</strong> www.ddhomekh.com</p>
                      </div>
                    </div> */}
        </header>

        {/* <section className="invoice-title-section">
            <h2 className="invoice-title">PURCHASE INVOICE</h2>
            <div className="invoice-meta">
              <span className="invoice-number">{purchase?.reference || 'N/A'}</span>
            </div>
        </section> */}
        
        <section className="invoice-details">
          <div className="detail-row">
            <span className="detail-label">Invoice Date:</span>
            <span className="detail-value">{formatDate(purchase?.date)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">From:</span>
            <span className="detail-value">{purchase?.supplier}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">To:</span>
            <span className="detail-value">{purchase?.status}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{purchase?.supplier_comapny}</span>
          </div>
        </section>

        <div className="divider" />

        {/* Items Table */}
        {/* <div className="items-section"> */}
          <DataTable
            columns={columns}
            data={purchase?.items || []}
            noHeader
            customStyles={{
              table: {
                style: {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  borderCollapse: 'collapse',
                  width: '100%',
                },
              },
              head: {
                style: {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }
              },
              cells: {
                style: {
                  fontSize: '13px',
                  padding: '8px 4px'
                }
              },
              rows: {
                style: {
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }
              }
            }}
            noDataComponent={<div className="no-items">No items in this purchase order</div>}
          />
        {/* </div> */}

        {/* Totals Section */}
        <table className="totals-section">
          <tbody>
            <tr>
              {/* <td className="notes">
                <h4>NOTES</h4>
                <p>{purchase?.note || 'No additional notes'}</p>
              </td> */}
              <td className="amounts">
                <table>
                  <tbody>
                    <tr className="amount-row total">
                      <td>TOTAL:</td>
                      <td>{formatCurrency(purchase?.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

          <div className="divider" />

          {/* Signatures Section */}
          <section className="signatures-section">
            <div className="signature-grid">
              <div className="signature-box">
                <div className="signature-line"></div>
                <div className="signature-label">Authorized Signature</div>
              </div>
              <div className="signature-box">
                <div className="signature-line"></div>
                <div className="signature-label">Receiver signature</div>
              </div>
              <div className="signature-box">
                {/* <div className="signature-text">{sale.customerName || 'Customer Name'}</div>
                <div className="signature-label">Customer Name</div> */}
              </div>
              <div className="signature-box">
                {/* <div className="signature-text">{formatDate(new Date())}</div>
                <div className="signature-label">Date</div> */}
              </div>
            </div>
          </section>

        <div className="action-buttons" style={{  display: 'flex' }}>
          <Button 
            type="danger" 
            onClick={onCancel} 
            icon={<CloseOutlined />} 
            style={{ flex: 1, marginRight: 8 }}
          >
            Close
          </Button>
          <Button 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint} 
            style={{ flex: 1, marginRight: 8 }}
          >
            Print
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={onEdit} 
            style={{ flex: 1 }}
          >
            Edit
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default PurchaseModalDetail;