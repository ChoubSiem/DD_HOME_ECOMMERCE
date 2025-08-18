import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import dayjs from "dayjs";
import {
  PrinterOutlined,
  CloseOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/logo/DD_Home_Logo 2.jpg";
import "./SaleReturnModal.css";

const SaleReturnModalDetail = ({ returnData, visible, onHide }) => {
  const modalRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const statusBodyTemplate = (status) => {
    const statusConfig = {
      pending: { severity: "warning", text: "Pending" },
      completed: { severity: "success", text: "Completed" },
      cancelled: { severity: "danger", text: "Cancelled" },
      refunded: { severity: "info", text: "Refunded" },
    };

    return (
      <Tag
        value={statusConfig[status]?.text || status}
        severity={statusConfig[status]?.severity || null}
        className="p-tag-rounded"
      />
    );
  };

  const calculateTotals = (items) => {
    if (!items || items.length === 0)
      return { subTotal: 0, discount: 0, grandTotal: 0 };

    const subTotal = items.reduce(
      (sum, item) => sum + item.qty * item.unit_price,
      0
    );
    const discount = items.reduce(
      (sum, item) => sum + (parseFloat(item.discount) || 0),
      0
    );

    return {
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: (subTotal - discount).toFixed(2),
    };
  };

  const exportToPDF = async () => {
    if (!modalRef.current) {
      console.warn("Return document content not ready for export");
      return;
    }

    setIsExporting(true);
    setLoading(true);

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(canvas);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(canvas, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `DDHome_Return_${returnData?.reference || new Date().getTime()}.pdf`
      );
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

  const exportToImage = async () => {
    if (!modalRef.current) {
      console.warn("Return document content not ready for export");
      return;
    }

    setIsExporting(true);
    setLoading(true);

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `DDHome_Return_${
        returnData?.reference || new Date().getTime()
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  };

const handlePrint = async () => {
  if (!modalRef.current) {
    console.warn("Return document content not ready for printing");
    return;
  }

  setLoading(true);
  try {
    // Step 1: Convert the content to canvas
    const canvas = await html2canvas(modalRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Step 2: Convert canvas to PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(canvas);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Step 3: Open PDF in new window and trigger print
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl, '_blank');
    if (!printWindow) {
      throw new Error("Popup blocked. Please allow popups for this site.");
    }

    // Wait for the PDF to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Clean up the object URL after printing
        URL.revokeObjectURL(pdfUrl);
      }, 500);
    };

  } catch (error) {
    console.error("Printing failed:", error);
    message.error("Failed to generate printable document");
  } finally {
    setLoading(false);
  }
};

  if (!returnData) {
    return (
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Return Details"
        className="p-dialog-detail"
      >
        <div className="p-text-center p-p-4">No return data available</div>
      </Dialog>
    );
  }

  const { subTotal, discount, grandTotal } = calculateTotals(returnData.items);

  const footer = (
    <div className="footer-container">
      <Button
        label="Close"
        icon={<CloseOutlined />}
        onClick={onHide}
        className="footer-button close"
      />
      <Button
        label="Print"
        icon={<PrinterOutlined />}
        onClick={handlePrint}
        className="footer-button"
        disabled={loading}
      />
      <Button
        label="PDF"
        icon={<FilePdfOutlined />}
        onClick={exportToPDF}
        className="footer-button"
        disabled={loading}
      />
      <Button
        label="Image"
        icon={<DownloadOutlined />}
        onClick={exportToImage}
        className="footer-button"
        disabled={loading}
      />
    </div>
  );

  const balance = grandTotal - (parseFloat(returnData.refund_amount) || 0);
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      footer={footer}
      style={{ width: "80vw", maxWidth: "1000px" }}
      className="p-dialog-detail return-modal"
      closable={!loading}
      blockScroll
      showHeader={false}
    >
      <div ref={modalRef} className="return-document-container">
        {/* Header Section */}
        <header className="return-header">
          <div className="logo-container">
            <img src={logo} alt="DD Home Logo" className="logo" />
          </div>
          <div className="company-details">
            <h1 className="company-name">DD Home</h1>
            <div className="company-info">
              <p>
                <strong>Address:</strong> N°26, St.6, Dangkor, Phnom Penh,
                Cambodia
              </p>
              <p>
                <strong>Phone:</strong> 081 90 50 50 / 078 90 50 50
              </p>
              <p>
                <strong>Email:</strong> dd.home81@gmail.com
              </p>
              <p>
                <strong>Website:</strong> www.ddhomekh.com
              </p>
            </div>
          </div>
        </header>

        <div className="divider" />

        {/* Return Details */}
        <section className="return-details">
          <div className="detail-row">
            <span className="detail-label">Return Date:</span>
            <span className="detail-value">{formatDate(returnData.date)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reference:</span>
            <span className="detail-value">{returnData.reference}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Original Sale:</span>
            <span className="detail-value">
              {returnData.original_sale || "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Customer:</span>
            <span className="detail-value">
              {returnData.customer?.username || "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              {returnData.customer?.phone || "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{returnData.reason || "N/A"}</span>
          </div>
        </section>

        <div className="divider" />

        {/* Items Table */}
        <section className="items-section">
          <DataTable
            value={returnData.items || []}
            className="p-datatable-sm p-datatable-striped"
            emptyMessage="No items found for this return"
          >
            <Column field="product.name" header="Product" />
            <Column
              field="qty"
              header="Quantity"
              body={(rowData) => `${rowData.qty} ${rowData.unit || ""}`}
              className="p-text-center"
            />
            <Column
              field="unit_price"
              header="Unit Price ($)"
              body={(rowData) => parseFloat(rowData.unit_price).toFixed(2)}
              className="p-text-right"
            />
            <Column
              field="discount"
              header="Discount ($)"
              body={(rowData) =>
                rowData.discount
                  ? parseFloat(rowData.discount).toFixed(2)
                  : "0.00"
              }
              className="p-text-right"
            />
            <Column
              field="total"
              header="Amount ($)"
              body={(rowData) => (rowData.qty * rowData.unit_price).toFixed(2)}
              className="p-text-right"
            />
          </DataTable>
        </section>

        <div className="divider" />

        {/* Totals Section */}
        <section className="totals-section">
          <div className="total-row">
            <span className="total-label">Sub Total:</span>
            <span className="total-value">${subTotal}</span>
          </div>
          <div className="total-row grand-total">
            <span className="total-label">Total Refund:</span>
            <span className="total-value">${grandTotal}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Amount Refunded:</span>
            <span className="total-value">
              ${parseFloat(returnData.refund_amount || 0).toFixed(2)}
            </span>
          </div>
          {balance > 0 && (
            <div className="total-row">
              <span className="total-label">Balance:</span>
              <span className="total-value">${balance.toFixed(2)}</span>
            </div>
          )}
        </section>

        <div className="divider" />

        {/* Notes Section */}
        {returnData.notes && (
          <section className="notes-section">
            <h4>Notes</h4>
            <p>{returnData.notes}</p>
          </section>
        )}

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
          </div>
        </section>
      </div>
    </Dialog>
  );
};

export default SaleReturnModalDetail;
