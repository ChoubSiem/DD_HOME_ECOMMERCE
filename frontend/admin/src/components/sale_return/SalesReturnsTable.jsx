import React, { useState, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import dayjs from 'dayjs';
import "./SaleReturnTable.css";
import { justify } from "@antv/g2plot/lib/plots/sankey/sankey";
const SalesReturnsTable = ({ data, onEdit, onDelete, onDetail, loading }) => {
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);
  const actionMenuRef = useRef(null);    
  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      pending: { severity: 'warning', text: 'Pending' },
      completed: { severity: 'success', text: 'Completed' },
      cancelled: { severity: 'danger', text: 'Cancelled' },
      refunded: { severity: 'info', text: 'Refunded' }
    };
    
    return (
      <Tag 
        value={statusConfig[rowData.status]?.text || rowData.status} 
        severity={statusConfig[rowData.status]?.severity || null} 
        className="p-tag-rounded"
      />
    );
  };

  const referenceBodyTemplate = (rowData) => {
    return (
      <>
        <Tooltip target=".reference-tooltip" />
        <span 
          className="reference-tooltip p-text-bold" 
          data-pr-tooltip="Click to view details"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReturn(rowData);
            setDetailDialogVisible(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          {rowData.reference}
        </span>
      </>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return dayjs(rowData.date).format('DD/MM/YYYY HH:mm');
  };

  const amountBodyTemplate = (rowData) => {
    return <span className="p-text-bold">${parseFloat(rowData.refund_amount).toFixed(2)}</span>;
  };

  const actionBodyTemplate = (rowData) => {
const items = [
  {
    label: 'View Details',
    icon: 'pi pi-eye',
    template: (item, options) => (
      <a
        className="p-menuitem-link custom-menu-view"
        onClick={(e) => {
          options.onClick(e); // important for Menu to close
          setSelectedReturn(rowData);
          setDetailDialogVisible(true);
          if (onDetail) onDetail(rowData);
        }}
      >
        <span className={`p-menuitem-icon ${item.icon}`} />
        <span className="p-menuitem-text">{item.label}</span>
      </a>
    )
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    template: (item, options) => (
      <a
        className="p-menuitem-link custom-menu-delete"
        onClick={(e) => {
          options.onClick(e);
          setSelectedReturn(rowData);
          setDeleteDialogVisible(true);
        }}
      >
        <span className={`p-menuitem-icon ${item.icon}`} />
        <span className="p-menuitem-text">{item.label}</span>
      </a>
    )
  }
];


    return (
      <div className="p-d-flex p-jc-center">
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-rounded p-button-text p-button-sm p-button-secondary"
          onClick={(e) => {
            e.stopPropagation();
            actionMenuRef.current.toggle(e);
          }}
          aria-controls={`action-menu-${rowData.id}`}
          aria-haspopup
        />
        <Menu
          model={items}
          popup
          ref={actionMenuRef}
          id={`action-menu-${rowData.id}`}
          popupAlignment="right"
          className="p-menu-action"
        />
      </div>
    );
  };

  const header = (
    <div className="p-d-flex p-jc-between p-ai-center" style={{display:'flex',justifyContent:'space-between'}}>
      <h2 className="p-text-bold p-m-0">Sales Returns</h2>
      <span className="p-input-icon-left">
        {/* <i className="pi pi-search" /> */}
        <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => setGlobalFilter(e.target.value)}
            className="p-inputtext-sm"
            style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                width: '220px',
                boxShadow: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            />

      </span>
    </div>
  );

  const deleteDialogFooter = (
    <div>
      <Button 
        label="No" 
        icon="pi pi-times" 
        className="p-button-text" 
        onClick={() => setDeleteDialogVisible(false)} 
      />
      <Button 
        label="Yes" 
        icon="pi pi-check" 
        className="p-button-danger" 
        onClick={() => {
          onDelete(selectedReturn.id);
          setDeleteDialogVisible(false);
        }} 
      />
    </div>
  );

  const renderReturnItemsTable = (items) => {    
    if (!items || items.length === 0) {

      return <p className="p-text-secondary">No items found for this return.</p>;
    }

    return (
      <div className="p-mt-4">
        <h4>Returned Items</h4>
        <div className="p-datatable p-datatable-sm p-datatable-striped">
          <div className="p-datatable-wrapper">
            <table className="p-datatable-table" style={{ width: '100%' }}>
              <thead className="p-datatable-thead">
                <tr className="p-datatable-row">
                  <th className="p-datatable-header p-text-left">Product</th>
                  <th className="p-datatable-header p-text-center">Quantity</th>
                  <th className="p-datatable-header p-text-right">Unit Price</th>
                  <th className="p-datatable-header p-text-left">Discount</th>
                  <th className="p-datatable-header p-text-right">Total</th>
                </tr>
              </thead>
              <tbody className="p-datatable-tbody">
                {items.map((item, index) => (
                  <tr key={index} className="p-datatable-row">
                    <td className="p-datatable-cell">{item.product.name}</td>
                    <td className="p-datatable-cell p-text-center">{item.qty}</td>
                    <td className="p-datatable-cell p-text-right">${item.unit_price}</td>
                    <td className="p-datatable-cell">{item.discount || 'N/A'}</td>
                    <td className="p-datatable-cell p-text-right">${(item.qty * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="p-datatable-tfoot">
                <tr className="p-datatable-row">
                  <td colSpan="3" className="p-datatable-cell p-text-right p-text-bold">Total Refund:</td>
                  <td colSpan="1" className="p-datatable-cell p-text-right p-text-bold">
                    {/* ${items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0).toFixed(2)} */}
                  </td>
                  <td colSpan="2" className="p-datatable-cell p-text-right p-text-bold">
                    ${items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-card">
      <Toast ref={toast} position="top-center" />
      
      <DataTable
        ref={dt}
        value={data}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        loading={loading}
        emptyMessage="No returns found"
        selectionMode="checkbox"
        stripedRows
        showGridlines
        className="p-datatable-sm"
      >
        <Column 
          field="reference" 
          header="Reference" 
          sortable 
          body={referenceBodyTemplate}
          style={{ minWidth: '180px' }}
        />
        <Column 
          field="date" 
          header="Date" 
          sortable 
          body={dateBodyTemplate}
          style={{ minWidth: '180px' }}
        />
        <Column 
          field="original_sale" 
          header="Original Sale" 
          sortable 
          body={(rowData) => rowData.original_sale || 'N/A'}
          style={{ minWidth: '180px' }}
        />
        <Column 
          field="customer.username" 
          header="Customer" 
          sortable 
          body={(rowData) => rowData.customer.username}
        />
        <Column 
          field="type" 
          header="Type" 
          sortable 
          body={(rowData) => rowData.type || 'POS'}
        />
        <Column 
          field="refund_amount" 
          header="Total Amount" 
          sortable 
          body={amountBodyTemplate}
          className="p-text-right"
          style={{ minWidth: '180px' }}
        />
        <Column 
          field="status" 
          header="Status" 
          sortable 
          body={statusBodyTemplate}
          style={{ minWidth: '120px' }}
        />
        <Column 
          body={actionBodyTemplate} 
          header="Actions"
          style={{ minWidth: '120px' }}
          frozen
          alignFrozen="right"
        />
      </DataTable>

        <Dialog 
        visible={detailDialogVisible} 
        style={{ width: '60vw', maxWidth: '800px' }} 
        header="Return Details" 
        modal 
        className="p-dialog-detail custom-return-dialog"
        onHide={() => setDetailDialogVisible(false)}
        footer={
            <Button 
            label="Close" 
            icon="pi pi-times" 
            onClick={() => setDetailDialogVisible(false)} 
            className="p-button-text"
            />
        }
        >
        {selectedReturn && (
            <div className="p-fluid grid gap-4" style={{margin:'10px'}} >
            <div className="grid" style={{ margin: '0 1rem' }}>
                <div className="col-12 md:col-6" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0' }}>
                    <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Reference:</label>
                    <p className="m-0">{selectedReturn.reference}</p>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Date:</label>
                    <p className="m-0">{dayjs(selectedReturn.date).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Original Sale:</label>
                    <p className="m-0">{selectedReturn.original_sale || 'N/A'}</p>
                    </div>
                </div>

                <div className="col-12 md:col-6" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0' }}>
                    {/* <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Original Sale:</label>
                    <p className="m-0">{selectedReturn.original_sale || 'N/A'}</p>
                    </div> */}
                    <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Type:</label>
                    <p className="m-0">{selectedReturn.type || 'POS'}</p>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                    <label className="block font-semibold mb-1">Amount:</label>
                    <p className="m-0">${parseFloat(selectedReturn.refund_amount).toFixed(2)}</p>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                    {/* <label className="block font-semibold mb-1">Amount:</label> */}
                    {/* <p className="m-0">${parseFloat(selectedReturn.refund_amount).toFixed(2)}</p> */}
                    </div>
                </div>
                </div>

            <div className="col-12 mt-3">
                <div className="card">
                {renderReturnItemsTable(selectedReturn.items)}
                </div>
            </div>
            </div>
        )}
        </Dialog>

        <Dialog 
        visible={deleteDialogVisible} 
        style={{ width: '450px' }} 
        header="Confirm Deletion" 
        modal 
        footer={deleteDialogFooter}
        onHide={() => setDeleteDialogVisible(false)}
        className="p-dialog-delete"
        >
        <div 
            className="p-d-flex p-ai-center" 
            style={{ padding: '1rem' }} 
        >
            <i 
            className="pi pi-exclamation-triangle p-mr-3" 
            style={{ fontSize: '2rem', color: '#f59e0b' }} 
            />
            {selectedReturn && (
            <span>Are you sure you want to delete <b>{selectedReturn.reference}</b>?</span>
            )}
        </div>
        </Dialog>

    </div>
  );
};

export default SalesReturnsTable;