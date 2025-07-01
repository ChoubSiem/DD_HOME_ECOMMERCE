import React, { useState, useMemo, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import Cookies from "js-cookie";
import { motion } from "framer-motion";

const ProductTable = ({ products = [], handleEdit, handleDelete, onRowClick }) => {
  const [filters, setFilters] = useState({
    global: '',
    name: '',
    category: '',
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);
  const userData = JSON.parse(Cookies.get("user"));

  // Unique categories for dropdown
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    products.forEach(product => categories.add(product.category_name));
    return Array.from(categories);
  }, [products]);

  // Filtered data
  const filteredData = useMemo(() => {
    return products.filter(product => {
      return (
        (!filters.global || 
          Object.values(product).some(val => 
            String(val).toLowerCase().includes(filters.global.toLowerCase())
          )
        ) &&
        (!filters.name || product.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.category || product.category_name === filters.category) &&
        (!filters.status || product.status === filters.status)
      );
    });
  }, [products, filters]);

  // Confirm delete action
  const confirmDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  };

  const executeDelete = () => {
    if (selectedProduct && handleDelete) {
      handleDelete(selectedProduct.id);
      setDeleteDialog(false);
      setSelectedProduct(null);
      showToast('success', 'Product Deleted', 'Product has been successfully removed.');
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  // Body templates
  const nameBodyTemplate = (rowData) => (
    <motion.span 
      className="d-flex justify-content-center align-items-center"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '20px', fontSize: '12px', padding: 0,paddingLeft:'10px' }}
    >
      {rowData.name}
    </motion.span>
  );

  const categoryBodyTemplate = (rowData) => (
    <motion.span
      style={{ display: 'flex', justifyContent: 'center', fontSize: '12px', padding: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {rowData.category_name}
    </motion.span>
  );
  const codeBodyTemplate = (rowData) => (
    <motion.span
      style={{ display: 'flex', justifyContent: 'center', fontSize: '12px', padding: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {rowData.code}
    </motion.span>
  );

  const priceBodyTemplate = (rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ display: 'flex', justifyContent: 'center', fontSize: '12px', padding: 0,flexDirection:'column' }}
    >
      <div>Cost: ${rowData.cost}</div>
      <div>{userData.warehouse_id == null ? 'Branch Price' : 'Price'}: ${rowData.price}</div>
      {rowData.discount > 0 && (
        <div style={{ color: '#f5222d' }}>Discount: {rowData.discount}%</div>
      )}
    </motion.div>
  );

  const stockBodyTemplate = (rowData) => {
    const color = rowData.stock > rowData.alert_qty 
      ? "#52c41a"
      : rowData.stock > 0
      ? "#faad14"
      : "#f5222d";

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="d-flex flex-column justify-content-center align-items-center"
        style={{display:'flex',flexDirection:'column'}}
      >
        <div className="d-flex align-items-center gap-1">
          <div style={{
            backgroundColor: `${color}20`,
            color,
            padding: "2px 8px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
          }}>
            {`${rowData.stock ?? 0} ${rowData.units ?? ''}`}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
          Alert at: <strong style={{ color: "#262626" }}>{rowData.alert_qty ?? 0}</strong>
        </div>
      </motion.div>
    );
  };

  const statusBodyTemplate = (rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="d-flex justify-content-center"
      style={{background:'none'}}
    >
      <Tag 
        value={rowData.status} 
        severity={rowData.status === 'active' ? 'success' : 'danger'} 
        style={{ fontSize: '12px',padding:'2px 10px',borderRadius:'20px' }}
      />
    </motion.div>
  );

  const draftBodyTemplate = (rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="d-flex justify-content-center"
    >
      <Tag 
        value={rowData.is_draft ? 'Draft' : 'Published'} 
        severity={rowData.is_draft ? 'warning' : 'success'} 
        style={{ fontSize: '12px' }}
      />
    </motion.div>
  );

  const actionBodyTemplate = (rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="action-buttons d-flex justify-content-center"
      style={{padding:0,margin:0}}
    >
      <Button 
        icon="pi pi-pencil" 
        text
        rounded
        className="p-button-sm p-button-text p-button-plain edit-icon"
        onClick={() => handleEdit(rowData.id)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button 
        icon="pi pi-trash" 
        text
        rounded
        className="p-button-sm p-button-text p-button-plain delete-icon"
        onClick={() => confirmDelete(rowData)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </motion.div>
  );

  const header = (
    <div className="table-header-custom">
      <IconField iconPosition="left" className="icon-field">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Search products..."
          onInput={(e) => setGlobalFilter(e.target.value)}
          className="search-input"
        />
      </IconField>
    </div>
  );

  const deleteDialogFooter = (
    <div className="d-flex justify-content-center gap-3">
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        className="p-button-sm cancel-button"
        onClick={() => setDeleteDialog(false)} 
      />
      <Button 
        label="Delete" 
        icon="pi pi-check" 
        className="p-button-sm confirm-delete-button"
        onClick={executeDelete} 
      />
    </div>
  );

  // Custom styles to fix scrolling issues
  const customStyles = {
    table: {
      style: {
        tableLayout: 'fixed' // Ensures consistent column widths
      }
    },
    headRow: {
      style: {
        // position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: 'white'
      }
    },
    headCells: {
      style: {
        // position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    },
    cells: {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="product-table-container"
      style={{ width: '100%' }}
    >
      <Toast ref={toast} position="top-center" />
      
      <div className="card" style={{ width: '100%', height: '450px', display: 'flex', flexDirection: 'column' }}>
        <DataTable
          ref={dt}
          value={filteredData}
          dataKey="id"
          scrollable
          scrollHeight="400px"
          virtualScrollerOptions={{ 
            itemSize: 50,
            scrollHeight: '450px'
          }}
          paginator={rows !== products.length}
          rows={rows}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
          globalFilter={globalFilter}
          loading={loading}
          emptyMessage="No products found"
          className="p-datatable-sm p-datatable-striped p-datatable-gridlines"
          style={{ width: '100%', flex: '1 1 auto',justifyContent:'center' }}
          onRowClick={(e) => onRowClick(e.data)}
          resizableColumns
          columnResizeMode="expand"
          reorderableColumns
          scrollDirection="both"
          frozenWidth="100px"
          responsiveLayout="scroll"
        >
          <Column 
            field="name" 
            header="Name" 
            sortable 
            body={nameBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '200px', minWidth: '200px' }}
          />
          <Column 
            field="product_code" 
            header="Code" 
            sortable 
            body={codeBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '150px', minWidth: '150px' }}
          />
          <Column 
            field="category_name" 
            header="Category" 
            sortable 
            body={categoryBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '150px', minWidth: '150px' }}
          />
          <Column 
            header="Price" 
            body={priceBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '180px', minWidth: '180px',padding:'10px' }}
          />
          <Column 
            header="Stock" 
            body={stockBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '150px', minWidth: '150px' }}
          />
          {/* <Column 
            field="is_draft" 
            header="Draft Status" 
            body={draftBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '120px', minWidth: '120px' }}
          /> */}
          <Column 
            field="status" 
            header="Status" 
            body={statusBodyTemplate}
            className="text-center"
            headerClassName="text-center"
            style={{ width: '100px', minWidth: '100px' }}
          />
          <Column 
            body={actionBodyTemplate} 
            header="Actions"
            className="text-center"
            headerClassName="text-center"
            frozen
            alignFrozen="right"
            style={{ width: '70px', minWidth: '70px' }}
          />
        </DataTable>
      </div>

      <Dialog 
        visible={deleteDialog} 
        style={{ width: '32rem' }} 
        breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
        header="Confirm Deletion" 
        modal 
        footer={deleteDialogFooter} 
        onHide={() => setDeleteDialog(false)}
        className="delete-dialog text-center"
        headerClassName="text-center"
      >
        <div className="confirmation-content d-flex justify-content-center align-items-center">
          <i className="pi pi-exclamation-triangle mr-3 warning-icon" />
          {selectedProduct && (
            <span className="confirmation-message">
              Are you sure you want to delete <b>{selectedProduct.name}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </motion.div>
  );
};

export default ProductTable;