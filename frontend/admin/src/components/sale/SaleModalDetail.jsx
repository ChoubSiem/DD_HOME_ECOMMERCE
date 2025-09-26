import React, { useRef, useState, useMemo } from 'react';
import { Modal, Button, message, Spin } from 'antd';
import { PrinterOutlined, CloseOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';
import "./SaleModalDetail.css";

const SaleModalDetail = ({ open, onCancel, sale }) => {    
  const invoiceRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);  
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

  const { subTotal, discount, grandTotal } = useMemo(() => {
    if (!sale?.items) return { subTotal: '0.00', discount: '0.00', grandTotal: '0.00' };
    
    const subTotal = sale.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discount = sale.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
    // const payment = (sale.payments || []).reduce((total, payment) => {
    //   const amount = Number(payment.paid) || 0;
    //   return total + amount;
    // }, 0);
    return {
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: (subTotal - discount).toFixed(2),
    };
  }, [sale]);
  
  const exportToPDF = async () => {
    if (!invoiceRef.current) {
      message.warning('Invoice content not ready for export');
      return;
    }
    
    setIsExporting(true);
    setLoading(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(canvas);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DDHome_Invoice_${sale?.reference || new Date().getTime()}.pdf`);
      
      message.success('PDF exported successfully');
    } catch (error) {
      message.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

  const exportToImage = async () => {
    if (!invoiceRef.current) {
      message.warning('Invoice content not ready for export');
      return;
    }
    
    setIsExporting(true);
    setLoading(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `DDHome_Invoice_${sale?.reference || new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      message.success('Image downloaded successfully');
    } catch (error) {
      message.error('Failed to export image');
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!invoiceRef.current) {
      message.warning('Invoice content not ready for printing');
      return;
    }
    
    setLoading(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>DD Home Invoice - ${sale?.reference || ''}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              @page { size: auto; margin: 0mm; }
            </style>
          </head>
          <body>
            ${invoiceRef.current.innerHTML}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      message.error('Printing failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sale) {
    return (
      <Modal open={open} onCancel={onCancel} footer={null}>
        <div className="empty-state">No invoice data available</div>
      </Modal>
    );
  }    

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width="80%"
      style={{ maxWidth: '900px' }}
      className="invoice-modal"
      destroyOnClose
      closable={!loading}
    >
      <Spin spinning={loading} tip={isExporting ? "Exporting..." : "Preparing..."}>
        <div ref={invoiceRef} className="invoice-container">
          {/* Header Section */}
          <header className="invoice-header">
            <div className="logo-container">
              <img src={logo} alt="DD Home Logo" className="logo" />
            </div>
            <div className="company-details">
              <h1 className="company-name">DD Home</h1>
              <div className="company-info">
                <p><strong>Address:</strong> #114, St 20MC, Mean Chey, Phnom Penh, Cambodia</p>
                <p><strong>Phone:</strong> 081 90 50 50 / 078 90 50 50</p>
                <p><strong>Email:</strong> ddhomekh@gmail.com</p>
                <p><strong>Website:</strong> www.ddhomekh.com</p>
              </div>
            </div>
          </header>

          <div className="divider" />

          {/* Invoice Title Section */}
          <section className="invoice-title-section">
            <h2 className="invoice-title">INVOICE</h2>
            <div className="invoice-meta">
              <span className="invoice-number">{sale.reference || 'N/A'}</span>
            </div>
          </section>

          {/* Invoice Details */}
      <section className="invoice-details">
        <div className="detail-row">
          <span className="detail-label">Invoice Date:</span>
          <span className="detail-value">{formatDate(sale.saleDate)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Customer:</span>
          <span className="detail-value">{sale.customerName || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{sale.customerPhone || 'N/A'}</span>

        </div>
      </section>


          <div className="divider" />

          {/* Items Table */}
          <section className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="col-no">No.</th>
                  <th className="col-desc">Description</th>
                  <th className="col-price">Price ($)</th>
                  <th className="col-qty">QTY UOM</th>
                  <th className="col-discount">Discount ($)</th>
                  <th className="col-total">Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="col-no">{index + 1}</td>
                    <td className="col-desc">
                      <div className="product-code">{item.productCode || ''}</div>
                      <div className="product-name">{item.productName || ''}</div>
                    </td>
                    <td className="col-price">{parseFloat(item.price || 0).toFixed(2)}</td>
                    <td className="col-qty">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="col-discount">{parseFloat(item.discount || 0).toFixed(2)}</td>
                    <td className="col-total">{parseFloat(item.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="divider" />

          {/* Totals Section */}
          <section className="totals-section">
            <div className="total-row">
              <span className="total-label">Sub Total:</span>
              <span className="total-value">${subTotal}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Discount:</span>
              <span className="total-value">${discount}</span>
            </div>
            <div className="total-row grand-total">
              <span className="total-label">Grand Total:</span>
              <span className="total-value">${grandTotal}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Payment:</span>
              <span className="total-value">${sale.payment}</span>
            </div>
            <div className="total-row">
              <span className="total-label">Balance:</span>
              <span className="total-value">
                {(grandTotal - (Number(sale.payment) || 0)).toFixed(2)}
              </span>
            </div>
          </section>

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
                <div className="signature-label">Customer Signature</div>
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

          {/* Footer */}
          <footer className="invoice-footer">
            <div className="footer-text">
              Printed by {sale.createdBy || 'System'}, {formatDate(new Date())} • Page 1 of 1
            </div>
          </footer>
        </div>
      </Spin>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button 
          onClick={onCancel} 
          icon={<CloseOutlined />} 
          disabled={loading}
          className="cancel-btn"
        >
          Close
        </Button>
        <Button 
          onClick={exportToPDF} 
          icon={<FilePdfOutlined />} 
          loading={isExporting}
          type="primary"
          className="export-btn"
        >
          Export PDF
        </Button>
        <Button 
          onClick={exportToImage} 
          icon={<DownloadOutlined />} 
          loading={isExporting}
          className="download-btn"
        >
          Save as Image
        </Button>
        <Button 
          onClick={handlePrint} 
          icon={<PrinterOutlined />}
          disabled={loading}
          className="print-btn"
        >
          Print
        </Button>
      </div>
    </Modal>
  );
};

export default SaleModalDetail;