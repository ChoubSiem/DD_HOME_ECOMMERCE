import React, { useRef, useState,useEffect } from 'react';
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
      name: 'DESCRIPTION',
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
      width={800}
      className="purchase-modal"
      destroyOnClose
    >
      <div ref={printRef} className="invoice-container">
        <table className="invoice-headers" style={{alignItems:'center'}}>
          <tbody style={{width:'100%',padding:0}}>
            <tr style={{width:'100%',display:'flex',justifyContent:'space-between'}}>
              <td className="company-info" style={{display:'flex',justifyContent:'space-between'}}>
                <img src={logo} alt="Company Logo" className="company-logo" style={{width:'80px',height:'80px'}}/>
              <div>
                <h1>{company?.[0]?.name}</h1>
                <p>Address: {company?.[0]?.location}</p>
                <p>Phone: {company?.[0]?.phone}</p>
              </div>

              </td>
              <td className="document-info">
                <h2>PURCHASE ORDER</h2>
                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td>FEF #:</td>
                      <td>{purchase?.reference || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Date:</td>
                      <td>{purchase?.date ? new Date(purchase.date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>Vendor:</td>
                      <td>{purchase?.supplier_comapny}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <div className="items-section">
          <DataTable
            columns={columns}
            data={purchase?.items || []}
            noHeader
            customStyles={{
              table: {
                style: {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
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
        </div>

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