import * as XLSX from 'xlsx';
import { message } from 'antd';

const exportToExcel = (adjustment, itemStatuses) => {
  if (!adjustment?.items || adjustment.items.length === 0) {
    message.warning('No data available to export');
    return;
  }

  try {
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
      [""], // Empty row for spacing
      [""] // Additional empty row for better separation
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
      "Total Cost",
      "Status"
    ];

    // Add headers to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A9" });

    // Add data rows
    let totalQuantity = 0;
    let totalCost = 0;
    
    adjustment.items.forEach((item, index) => {
      const cost = item.cost || 0;
      const itemTotalCost = cost * item.qty;
      totalQuantity += item.qty;
      totalCost += itemTotalCost;
      
      const status = itemStatuses[item.id] || 'pending';
      
      const rowData = [
        index + 1,
        item.product?.code || 'N/A',
        item.product?.name || 'N/A',
        item.qty || 0,
        item.operation?.toUpperCase() || 'N/A',
        item.unit_name || 'N/A',
        cost,
        itemTotalCost,
        status.toUpperCase()
      ];
      
      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${10 + index}` });
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
      totalCost,
      ""
    ];
    
    XLSX.utils.sheet_add_aoa(worksheet, [totalRow], { origin: `A${10 + adjustment.items.length}` });

    // Apply styling
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style title row
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({r: 0, c: C});
      if (!worksheet[address]) worksheet[address] = {t: 's'};
      worksheet[address].s = {
        font: {name: 'Calibri', bold: true, sz: 16, color: {rgb: "FFFFFF"}},
        fill: {fgColor: {rgb: "003087"}},
        alignment: {horizontal: 'center', vertical: 'center'},
        border: {top: {style: 'thin', color: {rgb: "D3D3D3"}}}
      };
    }
    
    // Merge title cells
    worksheet['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: headers.length - 1}}];

    // Style report details (rows 1-6)
    for (let R = 1; R <= 6; R++) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({r: R, c: C});
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: {name: 'Calibri', sz: 11},
          alignment: {horizontal: 'left'},
          border: {bottom: {style: 'thin', color: {rgb: "D3D3D3"}}}
        };
      }
    }

    // Style header row (row 8)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({r: 8, c: C});
      if (!worksheet[address]) worksheet[address] = {t: 's'};
      worksheet[address].s = {
        font: {name: 'Calibri', bold: true, sz: 12, color: {rgb: "333333"}},
        fill: {fgColor: {rgb: "E6F0FA"}},
        border: {
          top: {style: 'thin', color: {rgb: "D3D3D3"}},
          left: {style: 'thin', color: {rgb: "D3D3D3"}},
          bottom: {style: 'thin', color: {rgb: "D3D3D3"}},
          right: {style: 'thin', color: {rgb: "D3D3D3"}}
        },
        alignment: {horizontal: 'center', vertical: 'center'}
      };
    }

    // Style data rows with alternating colors
    for (let R = 9; R < 9 + adjustment.items.length; R++) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({r: R, c: C});
        if (!worksheet[address]) worksheet[address] = {t: 's'};
        
        const isEvenRow = (R % 2 === 0);
        worksheet[address].s = {
          font: {name: 'Calibri', sz: 11},
          fill: {fgColor: {rgb: isEvenRow ? "FFFFFF" : "F5F5F5"}},
          border: {
            top: {style: 'thin', color: {rgb: "D3D3D3"}},
            left: {style: 'thin', color: {rgb: "D3D3D3"}},
            bottom: {style: 'thin', color: {rgb: "D3D3D3"}},
            right: {style: 'thin', color: {rgb: "D3D3D3"}}
          },
          alignment: {horizontal: (C === 3 || C === 6 || C === 7) ? 'right' : 'left'}
        };

        // Format numeric columns
        if (C === 3) worksheet[address].z = '0'; // Quantity
        if (C === 6 || C === 7) worksheet[address].z = '$#,##0.00'; // Unit Cost, Total Cost

        // Conditional formatting for Status column
        if (C === 8) {
          const statusValue = worksheet[address].v?.toLowerCase();
          let statusColor;
          if (statusValue === 'pending') statusColor = "FFD700";
          else if (statusValue === 'approved') statusColor = "28A745";
          else if (statusValue === 'rejected') statusColor = "DC3545";
          else statusColor = "FFFFFF";
          
          worksheet[address].s = {
            ...worksheet[address].s,
            fill: {fgColor: {rgb: statusColor}},
            alignment: {horizontal: 'center'}
          };
        }
      }
    }

    // Style total row
    const totalRowIndex = 9 + adjustment.items.length;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({r: totalRowIndex, c: C});
      if (!worksheet[address]) worksheet[address] = {t: 's'};
      
      worksheet[address].s = {
        font: {name: 'Calibri', bold: true, sz: 11},
        fill: {fgColor: {rgb: "FFF3CD"}},
        border: {
          top: {style: 'medium', color: {rgb: "D3D3D3"}},
          left: {style: 'thin', color: {rgb: "D3D3D3"}},
          bottom: {style: 'thin', color: {rgb: "D3D3D3"}},
          right: {style: 'thin', color: {rgb: "D3D3D3"}}
        },
        alignment: {horizontal: (C === 3 || C === 7) ? 'right' : 'left'}
      };
      
      // Format numeric columns in total row
      if (C === 3) worksheet[address].z = '0'; // Quantity
      if (C === 7) worksheet[address].z = '$#,##0.00'; // Total Cost
    }

    // Set column widths
    const colWidths = [
      {wch: 6},   // No
      {wch: 20},  // Product Code
      {wch: 35},  // Product Name
      {wch: 12},  // Quantity
      {wch: 12},  // Type
      {wch: 12},  // Unit
      {wch: 15},  // Unit Cost
      {wch: 15},  // Total Cost
      {wch: 15}   // Status
    ];
    worksheet['!cols'] = colWidths;

    // Set row heights
    worksheet['!rows'] = [
      {hpx: 30}, // Title row
      ...Array(7).fill({hpx: 20}), // Report details and empty rows
      {hpx: 25}, // Header row
      ...Array(adjustment.items.length).fill({hpx: 20}), // Data rows
      {hpx: 25} // Total row
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Adjustment');

    XLSX.writeFile(workbook, `adjustment_report_${adjustment?.reference || 'export'}.xlsx`);

    message.success('Excel report downloaded successfully!');
    return true;
  } catch (error) {
    message.error('Failed to export to Excel');
    return false;
  }
};

export default exportToExcel;