import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import CustomerModal from './EditCustomerModal';
import { motion } from 'framer-motion';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./CustomerTable.css";

const CustomerTable = ({ customers: allCustomers, onEdit, onDelete, customerGroups, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [currentData, setCurrentData] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteCustomerDialog, setDeleteCustomerDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [rows, setRows] = useState(10);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        setCurrentData(allCustomers);
    }, [allCustomers]);

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleModalSave = async (values) => {
        try {
            if (selectedCustomer && onSave) {
                await onSave(values, true, selectedCustomer.id);
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
                toast.current.show({ 
                    severity: 'success', 
                    summary: 'Successful', 
                    detail: 'Customer Updated', 
                    life: 3000 
                });
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.current.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Failed to update customer', 
                life: 3000 
            });
        }
    };

    const confirmDelete = (customer) => {
        setSelectedCustomer(customer);
        setDeleteCustomerDialog(true);
    };

    const deleteCustomer = () => {
        if (selectedCustomer && onDelete) {
            onDelete(selectedCustomer.id);
            setDeleteCustomerDialog(false);
            setSelectedCustomer(null);
            toast.current.show({ 
                severity: 'success', 
                summary: 'Successful', 
                detail: 'Customer Deleted', 
                life: 3000 
            });
        }
    };

    const showAll = () => {
        setRows(allCustomers.length);
    };

    const showLess = () => {
        setRows(10);
    };
const getRoleTag = (role) => (
    <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
            display: 'flex', 
            justifyContent: 'center',
            fontSize: '15px',
            padding: 0
        }}
    >
        <Tag 
            value={role || 'Customer'} 
            style={{ 
                color: 'gray',
                background: 'white',
                fontSize: '15px',
                padding: '0.1rem 0.5rem',
            }}
        />
    </motion.span>
);

    const actionBodyTemplate = (rowData) => {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="action-buttons d-flex justify-content-center gap-1"
                style={{padding:0}}
            >
                <Button 
                    icon="pi pi-pencil" 
                    text
                    rounded
                    className="p-button-sm p-button-text p-button-plain edit-icon"
                    onClick={() => handleEdit(rowData)}
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
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <motion.span 
                className="khmer-text customer-name d-flex justify-content-center align-items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '40px' ,fontSize:'15px',padding:0 }}
            >
                {rowData.username}
            </motion.span>
        );
    };
    const codeBodyTemplate = (rowData) => {
        return (
            <motion.span 
                className="khmer-text customer-name d-flex justify-content-center align-items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '40px' ,fontSize:'15px',padding:0 }}
            >
                {rowData.customer_code}
            </motion.span>
        );
    };

    const phoneBodyTemplate = (rowData) => {
        return (
            <motion.span
                className="khmer-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  fontSize: '15px',
                  padding: 0
              }}
            >
                {rowData.phone}
            </motion.span>
        );
    };

    const groupBodyTemplate = (rowData) => {
        return getRoleTag(rowData.group_name);
    };

    const addressBodyTemplate = (rowData) => {
        return (
            <motion.span
                className="khmer-text customer-address d-flex justify-content-center align-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ height: '40px' }}
            >
                {rowData.address}
            </motion.span>
        );
    };

    const header = (
      <div className="table-header-custom">
        <IconField iconPosition="left" className="icon-field">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search customers..."
            onInput={(e) => setGlobalFilter(e.target.value)}
            className="search-input"
          />
        </IconField>
      </div>
    );


    const deleteCustomerDialogFooter = (
        <div className="d-flex justify-content-center gap-3">
            <Button 
                label="Cancel" 
                icon="pi pi-times" 
                className="p-button-sm cancel-button"
                onClick={() => setDeleteCustomerDialog(false)} 
            />
            <Button 
                label="Delete" 
                icon="pi pi-check" 
                className="p-button-sm confirm-delete-button"
                onClick={deleteCustomer} 
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="customer-table-container"
            style={{ width: '100%' }}
        >
            <Toast ref={toast} position="top-center" />
            <div className="card" style={{ width: '100%', height: '500px', display: 'flex', flexDirection: 'column' }}>
              <DataTable
                  ref={dt}
                  value={currentData}
                  dataKey="id"
                  scrollable
                  scrollHeight="400px"
                  virtualScrollerOptions={{ itemSize: 40 }}
                  paginator={rows !== allCustomers.length}
                  rows={rows}
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} customers"
                  globalFilter={globalFilter}
                  header={header}
                  loading={loading}
                  emptyMessage="No customers found"
                  className="p-datatable-sm p-datatable-striped p-datatable-gridlines"
                  style={{ width: '100%', flex: '1 1 auto' }}
              >
                <Column 
                    field="username" 
                    header="Name" 
                    sortable 
                    body={nameBodyTemplate}
                    className="name-column text-center"
                    headerClassName="text-center"
                />
                <Column 
                    field="customer_code" 
                    header="Code" 
                    sortable 
                    body={codeBodyTemplate}
                    className="name-column text-center"
                    headerClassName="text-center"
                />
                <Column 
                    field="phone" 
                    header="Phone" 
                    sortable 
                    body={phoneBodyTemplate}
                    className="phone-column text-center"
                    headerClassName="text-center"
                    bodyStyle={{ textAlign: 'center' }}
                />
                <Column 
                    field="group_name" 
                    header="Group" 
                    sortable 
                    body={groupBodyTemplate}
                    className="group-column text-center"
                    headerClassName="text-center"
                    bodyStyle={{ textAlign: 'center' }}
                />
                <Column 
                    field="address" 
                    header="Address" 
                    sortable 
                    body={addressBodyTemplate}
                    className="address-column text-center"
                    headerClassName="text-center"
                    bodyStyle={{ textAlign: 'center' }}
                />
                <Column 
                    body={actionBodyTemplate} 
                    header="Actions"
                    className="actions-column text-center"
                    headerClassName="text-center"
                    bodyStyle={{ textAlign: 'center' }}
                    frozen
                    alignFrozen="right"
                    style={{padding:'10px'}}
                />
            </DataTable>
            </div>

            {selectedCustomer && (
                <CustomerModal
                    visible={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setSelectedCustomer(null);
                    }}
                    onSave={handleModalSave}
                    initialData={selectedCustomer}
                    isEditing={true}
                    customerGroups={customerGroups}
                />
            )}

            <Dialog 
                visible={deleteCustomerDialog} 
                style={{ width: '28rem', borderRadius: '12px' }} 
                breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
                header="⚠️ Confirm Deletion" 
                modal 
                footer={deleteCustomerDialogFooter} 
                onHide={() => setDeleteCustomerDialog(false)}
                className="delete-dialog text-center"
                headerClassName="text-center"
                >
                <div
                    className="confirmation-content"
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    }}
                >
                    <i
                    className="pi pi-exclamation-triangle"
                    style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '16px' }}
                    />
                    {selectedCustomer && (
                    <span
                        className="confirmation-message"
                        style={{ fontSize: '1.1rem', lineHeight: 1.6 }}
                    >
                        Are you sure you want to delete <b>{selectedCustomer.username}</b>?
                    </span>
                    )}
                </div>
                </Dialog>

        </motion.div>
    );
};

export default CustomerTable;