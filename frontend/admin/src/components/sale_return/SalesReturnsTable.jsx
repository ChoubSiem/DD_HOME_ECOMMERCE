import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Menu } from "primereact/menu";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import dayjs from "dayjs";
import SaleReturnModalDetail from "./SaleReturnModal";
import "./SaleReturnTable.css";

const SalesReturnsTable = ({ data, onEdit, onDelete, onDetail, loading }) => {
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);
  const dt = useRef(null);

  // Status Tag Template
  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      pending: { severity: "warning", text: "Pending" },
      completed: { severity: "success", text: "Completed" },
      cancelled: { severity: "danger", text: "Cancelled" },
      refunded: { severity: "info", text: "Refunded" },
    };
    return (
      <Tag
        value={statusConfig[rowData.status]?.text || rowData.status}
        severity={statusConfig[rowData.status]?.severity || null}
        className="p-tag-rounded"
      />
    );
  };

  // Reference Column Template
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
            setDetailModalVisible(true);
            if (onDetail) onDetail(rowData);
          }}
          style={{ cursor: "pointer" }}
        >
          {rowData.reference}
        </span>
      </>
    );
  };

  // Date Column Template
  const dateBodyTemplate = (rowData) => dayjs(rowData.date).format("DD/MM/YYYY HH:mm");

  // Amount Column Template
  const amountBodyTemplate = (rowData) => (
    <span className="p-text-bold">${parseFloat(rowData.refund_amount).toFixed(2)}</span>
  );

  // Action Column Template
  const actionBodyTemplate = (rowData) => {
    const menuRef = useRef(null);

const items = [
  {
    label: "View Details",
    icon: "pi pi-eye",
    command: () => {
      setSelectedReturn(rowData);
      setDetailModalVisible(true);
      if (onDetail) onDetail(rowData);
    },
    className: "custom-menu-item view",
  },
  {
    separator: true,
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: () => {
      setSelectedReturn(rowData);
      setDeleteDialogVisible(true);
    },
    className: "custom-menu-item delete",
  },
];


    return (
      <div className="p-d-flex p-jc-center">
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-rounded p-button-text p-button-sm p-button-secondary"
          onClick={(e) => {
            e.stopPropagation();
            menuRef.current.toggle(e);
          }}
        />
        <Menu model={items} popup ref={menuRef} />
      </div>
    );
  };

  const header = (
    <div className="p-d-flex p-jc-between p-ai-center" style={{ display: "flex", justifyContent: "space-between" }}>
      <h2 className="p-text-bold p-m-0">Sales Returns</h2>
      <span className="p-input-icon-left">
        <InputText
          type="search"
          placeholder="Search..."
          onInput={(e) => setGlobalFilter(e.target.value)}
          className="p-inputtext-sm"
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outline: "none",
            width: "220px",
            boxShadow: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
        <Column field="reference" header="Reference" sortable body={referenceBodyTemplate} style={{ minWidth: "180px" }} />
        <Column field="date" header="Date" sortable body={dateBodyTemplate} style={{ minWidth: "180px" }} />
        <Column field="original_sale" header="Original Sale" sortable body={(rowData) => rowData.original_sale || "N/A"} style={{ minWidth: "180px" }} />
        <Column field="customer.username" header="Customer" sortable body={(rowData) => rowData?.customer?.username} />
        <Column field="type" header="Type" sortable body={(rowData) => rowData.type || "POS"} />
        <Column field="refund_amount" header="Total Amount" sortable body={amountBodyTemplate} className="p-text-right" style={{ minWidth: "180px" }} />
        <Column body={actionBodyTemplate} header="Actions" style={{ minWidth: "120px" }} frozen alignFrozen="right" />
      </DataTable>

      {/* Detail Modal */}
      <SaleReturnModalDetail
        returnData={selectedReturn}
        visible={detailModalVisible}
        onHide={() => setDetailModalVisible(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteDialogVisible}
        style={{ width: "450px" }}
        header="Confirm Deletion"
        modal
        footer={deleteDialogFooter}
        onHide={() => setDeleteDialogVisible(false)}
        className="p-dialog-delete"
      >
        <div className="p-d-flex p-ai-center" style={{ padding: "1rem" }}>
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: "2rem", color: "#f59e0b" }} />
          {selectedReturn && (
            <span>
              Are you sure you want to delete <b>{selectedReturn.reference}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default SalesReturnsTable;
