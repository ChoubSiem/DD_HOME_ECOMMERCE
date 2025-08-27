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
  const [exportLoading, setExportLoading] = useState(false);
  
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

  const exportToExcel = async () => {
    setExportLoading(true);
    
    try {
      if (!adjustment?.items || adjustment.items.length === 0) {
        message.warning('No data available to export');
        return;
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([]);

      // Add title row
      XLSX.utils.sheet_add_aoa(worksheet, [["DD Home Stock Adjustment Report"]], { origin: "A1" });
      
      // Add report details
      XLSX.utils.sheet_add_aoa(worksheet, [
        [`Reference: ${adjustment?.reference || 'N/A'}`],
        [`Date: ${adjustment?.date ? new Date(adjustment.date).toLocaleDateString('en-US') : 'N/A'}`],
        [`Adjuster: ${adjustment?.adjuster?.username || 'N/A'}`],
        [`Warehouse: ${adjustment?.warehouse?.name || 'N/A'}`],
        [`Note: ${adjustment?.note || 'N/A'}`],
        [""] // Empty row
      ], { origin: "A2" });

      // Define headers
      const headers = [
        "No",
        "Product Code",
        "Product Name",
        "Quantity",
        "Type",
        "Unit",
        "Unit Cost",
        "Total Cost"
      ];

      // Add headers to worksheet
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A8" });

      // Add data rows
      let totalQuantity = 0;
      let totalCost = 0;
      
      adjustment.items.forEach((item, index) => {
        const cost = item.cost || 0;
        const itemTotalCost = cost * item.qty;
        totalQuantity += item.qty;
        totalCost += itemTotalCost;
        
        const rowData = [
          index + 1,
          item.product?.code || 'N/A',
          item.product?.name || 'N/A',
          item.qty || 0,
          item.operation?.toUpperCase() || 'N/A',
          item.unit_name || 'N/A',
          cost,
          itemTotalCost
        ];
        
        XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${9 + index}` });
      });

      // Add totals row
      const totalRow = [
        "TOTAL",
        "",
        "",
        totalQuantity,
        "",
        "",
        "",
        totalCost
      ];
      
      XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: `A${9 + adjustment.items.length}` });

      // Apply styling
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Style title row
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({r: 0, c: C});
        if (!worksheet[address]) worksheet[address] = {t: 's'};
        worksheet[address].s = {font: {bold: true, sz: 16}, alignment: {horizontal: 'center'}};
      }
      
      // Merge title cells
      worksheet['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}}];

      // Style header row (row 7)
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({r: 7, c: C});
        if (!worksheet[address]) worksheet[address] = {t: 's'};
        worksheet[address].s = {
          font: {bold: true}, 
          fill: {fgColor: {rgb: "D3D3D3"}},
          border: {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          },
          alignment: {vertical: 'middle', horizontal: 'center'}
        };
      }

      // Style data rows
      for (let R = 8; R < 8 + adjustment.items.length; R++) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({r: R, c: C});
          if (!worksheet[address]) worksheet[address] = {t: 's'};
          
          // Format numeric columns
          if (C === 3 || C === 6 || C === 7) { // Quantity, Unit Cost, Total Cost columns
            worksheet[address].z = C === 3 ? '0' : '#,##0.00';
            worksheet[address].s = {alignment: {horizontal: 'right'}};
          }
        }
      }

      // Style total row
      const totalRowIndex = 8 + adjustment.items.length;
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
        if (!worksheet[address]) worksheet[address] = {t: 's'};
        
        worksheet[address].s = {
          font: {bold: true},
          border: {top: {style: 'thin'}}
        };
        
        // Format numeric columns in total row
        if (C === 3 || C === 6 || C === 7) {
          worksheet[address].z = C === 3 ? '0' : '#,##0.00';
          worksheet[address].s = {
            ...worksheet[address].s,
            alignment: {horizontal: 'right'}
          };
        }
      }

      // Set column widths
      const colWidths = [
        {wch: 5},   // No
        {wch: 15},  // Product Code
        {wch: 30},  // Product Name
        {wch: 10},  // Quantity
        {wch: 10},  // Type
        {wch: 10},  // Unit
        {wch: 12},  // Unit Cost
        {wch: 12}   // Total Cost
      ];
      
      worksheet['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Adjustment');

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `adjustment_report_${adjustment?.reference || 'export'}.xlsx`);

      message.success('Excel report downloaded successfully!');
    } catch (error) {
      message.error('Failed to export to Excel');
      console.error('Error exporting to Excel:', error);
    } finally {
      setExportLoading(false);
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
              loading={exportLoading}
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