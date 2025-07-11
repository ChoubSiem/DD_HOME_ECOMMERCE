import React, { useRef, useState, useMemo } from 'react';
import { Modal, Button, message, Spin, Divider, Table } from 'antd';
import { PrinterOutlined, CloseOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';
import "./PosSaleDetail.css";

const PosSaleDetail = ({ open, onCancel, sale }) => {
  const invoiceRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoized formatted date
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

  // Calculate totals
  const { subTotal, discount, grandTotal } = useMemo(() => {
    if (!sale?.items) return { subTotal: '0.00', discount: '0.00', grandTotal: '0.00' };
    
    const subTotal = sale.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discount = sale.items.reduce((sum, item) => sum + (parseFloat(item.discount * item.quantity) || 0), 0);
    console.log(discount);
    console.log(sale.items);
    
    return {
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: (subTotal - discount).toFixed(2),
    };
  }, [sale]);

  // Export to PDF
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

  // Export as image
  const exportToImage = async () => {
    if (!invoiceRef.current) {
      message.warning('Invoice content not ready for export');
      return;
    }
    
    setIsExporting(true);
    setLoading(true);
    
    try {
const canvas = await html2canvas(invoiceRef.current, {
  scale: 3, // Increase scale for higher resolution
  width: invoiceRef.current.scrollWidth * 1, // Optional: force wider output
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false
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

  // Handle print
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
              @page { size: 80mm 200mm; margin: 0; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 5px; font-size: 12px; }
              .pos-container { width: 80mm; margin: 0 auto; padding: 5px; }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { width: 30px; height: auto; }
              .company-name { font-weight: bold; font-size: 14px; }
              .invoice-info { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .items-table { width: 100%; border-collapse: collapse; margin: 5px 0; }
              .items-table th { text-align: left; padding: 3px; border-bottom: 1px dashed #ccc; }
              .items-table td { padding: 3px; border-bottom: 1px dashed #eee; }
              .total-row { display: flex; justify-content: space-between; margin-top: 5px; }
              .grand-total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; }
              .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="pos-container">
              ${invoiceRef.current.innerHTML.replace('pos-container', 'print-content')}
            </div>
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
        <div>No sale data available</div>
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
      className="pos-modal"
      destroyOnClose
      closable={!loading}
    >
      <Spin spinning={loading} tip={isExporting ? "Exporting..." : "Preparing..."}>
        <div ref={invoiceRef} className="pos-container" style={{ maxWidth: '80mm', margin: '0 auto' }}>
          {/* Header */}
          <header className="header">
            <img style={{width:'50px'}} src={logo} alt="DD Home Logo" className="logo" />
            <div className="company-name">DD Home</div>
            <div>N°26, St.6, Dangkor, Phnom Penh</div>
            <div>081 90 50 50 / 078 90 50 50</div>
          </header>

          {/* Invoice Info */}
          <div className="invoice-info">
            <div>
              <div>Invoice: {sale.reference || 'N/A'}</div>
              <div>Date: {formatDate(sale.saleDate)}</div>
            </div>
            <div>
              <div>Customer: {sale.customerName || 'Walk-in'}</div>
              <div>Cashier: {sale.createdBy || 'System'}</div>
            </div>
          </div>

          <Divider style={{ margin: '5px 0' }} />

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>{item.productName || ''}</div>
                    <div style={{ fontSize: '10px' }}>{item.productCode || ''}</div>
                  </td>
                  <td>{item.quantity} {item.unit || ''}</td>
                  <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>${parseFloat(item.discount || 0).toFixed(2)}</td>
                  <td>${parseFloat(item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Divider style={{ margin: '5px 0' }} />

          {/* Totals */}
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${subTotal}</span>
          </div>
          <div className="total-row">
            <span>Discount:</span>
            <span>${discount}</span>
          </div>
          <div className="total-row grand-total">
            <span>TOTAL:</span>
            <span>${grandTotal}</span>
          </div>

          <Divider style={{ margin: '5px 0' }} />

          {/* Payment */}
          <div className="total-row">
            <span>Payment:</span>
            <span>${grandTotal}</span>
          </div>
          <div className="total-row">
            <span>Change:</span>
            <span>$0.00</span>
          </div>

          {/* Footer */}
          <footer className="footer">
            <div>Thank you for shopping with us!</div>
            <div>{formatDate(new Date())}</div>
          </footer>
        </div>
      </Spin>

      {/* Action Buttons */}
      <div style={{ padding: '15px', background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={onCancel}
            icon={<CloseOutlined />}
          >
            Close
          </Button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              onClick={exportToPDF}
              icon={<FilePdfOutlined />}
              loading={isExporting}
            >
              Export PDF
            </Button>
            <Button 
              onClick={exportToImage}
              icon={<DownloadOutlined />}
              loading={isExporting}
            >
              Save as Image
            </Button>
            <Button 
              onClick={handlePrint}
              icon={<PrinterOutlined />}
              type="primary"
            >
              Print
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PosSaleDetail;