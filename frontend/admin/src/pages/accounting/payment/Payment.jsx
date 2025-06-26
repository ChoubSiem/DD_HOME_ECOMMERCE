import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { motion } from 'framer-motion';
import { useReport } from '../../../hooks/UseReport';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie';
import debounce from 'lodash.debounce';
import generatePDF from 'react-to-pdf';
import html2canvas from 'html2canvas';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Payment.css';

const PaymentReport = React.memo(() => {
  const [filters, setFilters] = useState({
    warehouse_id: null,
    payment_method: 'all',
    status: 'all',
    customer_id: null,
    date_range: null,
    search_term: '',
  });
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 });
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [exportLoading, setExportLoading] = useState({ excel: false, pdf: false, image: false });
  const toast = useRef(null);
  const dt = useRef(null);
  const tableRef = useRef(null);
  const token = localStorage.getItem('token');
  const userData = useMemo(() => JSON.parse(Cookies.get('user') || '{}'), []);
  const { getPaymentReportsData, getWarehouses, getCustomers } = useReport();

  // Memoized options
  const paymentMethods = useMemo(() => [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'due', label: 'Due' },
  ], []);

  // Fetch warehouses and customers
  const fetchOptions = useCallback(async () => {
    try {
      const [warehouseRes, customerRes] = await Promise.all([
        getWarehouses(token),
        getCustomers(token),
      ]);
      setWarehouses(warehouseRes.data.map(w => ({ value: w.id, label: w.name })));
      setCustomers(customerRes.data.map(c => ({ value: c.id, label: c.name })));
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load options',
        life: 3000,
      });
    }
  }, [token, getWarehouses, getCustomers]);

  // Fetch payment report
  const fetchPaymentReport = useCallback(async (params = {}, retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanParams = {
        ...params,
        payment_method: params.payment_method === 'all' ? undefined : params.payment_method,
        status: params.status === 'all' ? undefined : params.status,
        warehouse_id: params.warehouse_id || undefined,
        customer_id: params.customer_id || undefined,
        search_term: params.search_term || undefined,
        start_date: params.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: params.date_range?.[1]?.format('YYYY-MM-DD'),
        page: params.page || 1,
        per_page: params.per_page || 10,
      };

      Object.keys(cleanParams).forEach(key => 
        cleanParams[key] === undefined && delete cleanParams[key]
      );

      const response = await getPaymentReportsData(cleanParams, token);
      
      setPayments(response.data || []);
      setMeta(response.meta || {
        total: response.data?.length || 0,
        total_amount: response.data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0,
        per_page: cleanParams.per_page || 10,
        current_page: cleanParams.page || 1,
      });
      
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Payment data loaded',
        life: 3000,
      });
    } catch (error) {
      console.error('Error fetching payment reports:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchPaymentReport(params, retryCount + 1), 1000);
        return;
      }
      setError(error.message || 'Failed to fetch payment reports');
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to fetch payment reports',
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, getPaymentReportsData]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((params) => fetchPaymentReport(params), 500),
    [fetchPaymentReport]
  );

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDateChange = useCallback((value) => {
    setFilters(prev => ({
      ...prev,
      date_range: value ? [dayjs(value[0]), dayjs(value[1])] : null,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    debouncedSearch.cancel();
    fetchPaymentReport({ ...filters, ...pagination });
  }, [filters, pagination, debouncedSearch, fetchPaymentReport]);

  const handleReset = useCallback(() => {
    setFilters({
      warehouse_id: null,
      payment_method: 'all',
      status: 'all',
      customer_id: null,
      date_range: null,
      search_term: '',
    });
    setGlobalFilter('');
    setPagination({ page: 1, per_page: 10 });
    fetchPaymentReport({});
  }, [fetchPaymentReport]);

  const handleExportExcel = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, excel: true }));
    try {
      if (!payments.length) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No data to export',
          life: 3000,
        });
        return;
      }

      const exportData = [
        ['Payment Report'],
        [`Generated: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`],
        [`Warehouse: ${userData.warehouse_name || 'All'}`],
        [],
        ['Date', 'Reference', 'Customer', 'Amount', 'Method', 'Status', 'Warehouse'],
        ...payments.map(payment => [
          dayjs(payment.payment_date).format('DD/MM/YYYY'),
          payment.reference_no,
          payment.customer?.name || 'N/A',
          parseFloat(payment.amount || 0).toFixed(2),
          payment.payment_method.toUpperCase(),
          payment.amount === 0 ? 'DUE' : payment.amount < payment.sale?.total ? 'PARTIAL' : 'PAID',
          payment.warehouse?.name || 'N/A',
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
      worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
      XLSX.writeFile(workbook, `payment_report_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Excel exported successfully',
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export Excel',
        life: 3000,
      });
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  }, [payments, userData]);

  const handleExportPDF = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, pdf: true }));
    try {
      if (!payments.length) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No data to export',
          life: 3000,
        });
        return;
      }
      await generatePDF(tableRef, {
        filename: `payment_report_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`,
        page: { format: 'A4', margin: { top: 20, bottom: 20, left: 20, right: 20 } },
      });
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'PDF exported successfully',
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export PDF',
        life: 3000,
      });
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  }, [payments]);

  const handleExportImage = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, image: true }));
    try {
      if (!payments.length) {
        toast.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No data to export',
          life: 3000,
        });
        return;
      }
      if (tableRef.current) {
        const canvas = await html2canvas(tableRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `payment_report_${dayjs().format('YYYYMMDD_HHmmss')}.png`;
        link.click();
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Image exported successfully',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export image',
        life: 3000,
      });
    } finally {
      setExportLoading(prev => ({ ...prev, image: false }));
    }
  }, [payments]);

  // Template functions
  const amountBodyTemplate = useCallback((rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      ${parseFloat(rowData.amount || 0).toFixed(2)}
    </motion.div>
  ), []);

  const dateBodyTemplate = useCallback((rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {dayjs(rowData.payment_date).format('DD MMM YYYY')}
    </motion.div>
  ), []);

  const methodBodyTemplate = useCallback((rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tag
        value={rowData.payment_method.toUpperCase()}
        severity={getPaymentMethodSeverity(rowData.payment_method)}
      />
    </motion.div>
  ), []);

  const statusBodyTemplate = useCallback((rowData) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Tag
        value={getStatusLabel(rowData)}
        severity={getStatusSeverity(rowData)}
      />
    </motion.div>
  ), []);

  // Header
  const header = (
    <div className="flex flex-wrap gap-2 justify-content-between align-items-center">
      <h4 className="m-0">Payment Report</h4>
      <div className="flex gap-2">
        <Tooltip target=".export-excel" content="Export to Excel" />
        <Button
          icon="pi pi-file-excel"
          onClick={handleExportExcel}
          disabled={isLoading || exportLoading.excel || !payments.length}
          className="p-button-success export-excel"
          loading={exportLoading.excel}
        />
        <Tooltip target=".export-pdf" content="Export to PDF" />
        <Button
          icon="pi pi-file-pdf"
          onClick={handleExportPDF}
          disabled={isLoading || exportLoading.pdf || !payments.length}
          className="p-button-danger export-pdf"
          loading={exportLoading.pdf}
        />
        <Tooltip target=".export-image" content="Export to Image" />
        <Button
          icon="pi pi-image"
          onClick={handleExportImage}
          disabled={isLoading || exportLoading.image || !payments.length}
          className="p-button-info export-image"
          loading={exportLoading.image}
        />
      </div>
    </div>
  );

  // Filter header
  const filterHeader = (
    <div className="flex justify-content-between align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Global Search"
          className="p-inputtext-sm"
        />
      </span>
    </div>
  );

  // Initial fetch
  useEffect(() => {
    fetchOptions();
    fetchPaymentReport({});
    return () => debouncedSearch.cancel();
  }, [fetchOptions, fetchPaymentReport, debouncedSearch]);

  // Error UI
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="payment-report-container"
      >
        <Card className="error-card">
          <div className="error-message">
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: '#dc3545' }} />
            <h5>Error</h5>
            <p>{error}</p>
            <Button
              label="Retry"
              icon="pi pi-refresh"
              onClick={() => fetchPaymentReport({ ...filters, ...pagination })}
              className="p-button-primary"
            />
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="payment-report-container"
    >
      <Toast ref={toast} position="top-center" />
      <Card className="main-card">
        <div className="report-header">
          <h3>Payment Report</h3>
          <p className="text-secondary">Overview of payment transactions</p>
        </div>

        <div className="report-filters">
          <div className="p-grid p-fluid">
            <div className="p-col-12 p-md-3">
              <Tooltip target=".warehouse-filter" content="Filter by warehouse" />
              <Dropdown
                options={warehouses}
                optionLabel="label"
                optionValue="value"
                value={filters.warehouse_id}
                onChange={(e) => handleFilterChange('warehouse_id', e.value)}
                placeholder="Select Warehouse"
                className="warehouse-filter"
                showClear
              />
            </div>
            <div className="p-col-12 p-md-3">
              <Tooltip target=".method-filter" content="Filter by payment method" />
              <Dropdown
                options={paymentMethods}
                optionLabel="label"
                optionValue="value"
                value={filters.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.value)}
                placeholder="Payment Method"
                className="method-filter"
                showClear
              />
            </div>
            <div className="p-col-12 p-md-3">
              <Tooltip target=".status-filter" content="Filter by payment status" />
              <Dropdown
                options={statusOptions}
                optionLabel="label"
                optionValue="value"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.value)}
                placeholder="Payment Status"
                className="status-filter"
                showClear
              />
            </div>
            <div className="p-col-12 p-md-3">
              <Tooltip target=".customer-filter" content="Filter by customer" />
              <Dropdown
                options={customers}
                optionLabel="label"
                optionValue="value"
                value={filters.customer_id}
                onChange={(e) => handleFilterChange('customer_id', e.value)}
                placeholder="Select Customer"
                className="customer-filter"
                showClear
                filter
              />
            </div>
            <div className="p-col-12 p-md-3">
              <Tooltip target=".date-filter" content="Filter by date range" />
              <Calendar
                value={filters.date_range}
                onChange={(e) => handleDateChange(e.value)}
                selectionMode="range"
                readOnlyInput
                placeholder="Date Range"
                className="date-filter"
                maxDate={new Date()}
                showIcon
              />
            </div>
            <div className="p-col-12 p-md-3">
              <Tooltip target=".search-filter" content="Search by reference or customer" />
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  placeholder="Search reference or customer"
                  value={filters.search_term}
                  onChange={(e) => {
                    handleFilterChange('search_term', e.target.value);
                    debouncedSearch({ ...filters, search_term: e.target.value, ...pagination });
                  }}
                  className="search-filter w-full"
                />
              </span>
            </div>
          </div>
          <div className="filter-buttons">
            <Button
              label="Apply Filters"
              icon="pi pi-filter"
              onClick={handleSearch}
              loading={isLoading}
              className="p-button-primary"
            />
            <Button
              label="Reset"
              icon="pi pi-refresh"
              onClick={handleReset}
              disabled={isLoading}
              className="p-button-secondary"
            />
          </div>
        </div>

        <div className="report-summary">
          <div className="p-grid">
            <div className="p-col-12 p-md-3">
              <Card className="summary-card">
                <div className="summary-title">Total Payments</div>
                <div className="summary-value">
                  ${meta?.total_amount?.toFixed(2) || '0.00'}
                </div>
              </Card>
            </div>
            <div className="p-col-12 p-md-3">
              <Card className="summary-card">
                <div className="summary-title">Total Records</div>
                <div className="summary-value">
                  {meta?.total || 0}
                </div>
              </Card>
            </div>
            <div className="p-col-12 p-md-3">
              <Card className="summary-card">
                <div className="summary-title">Paid Payments</div>
                <div className="summary-value">
                  {meta?.filters_applied?.status === 'paid' ? meta.total : payments.filter(p => p.amount >= p.sale?.total).length}
                </div>
              </Card>
            </div>
            <div className="p-col-12 p-md-3">
              <Card className="summary-card">
                <div className="summary-title">Due Payments</div>
                <div className="summary-value">
                  {meta?.filters_applied?.status === 'due' ? meta.total : payments.filter(p => p.amount === 0).length}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="report-table" ref={tableRef}>
          <DataTable
            ref={dt}
            value={payments}
            paginator
            rows={pagination.per_page}
            totalRecords={meta?.total || 0}
            rowsPerPageOptions={[10, 20, 50, 100]}
            loading={isLoading}
            dataKey="id"
            header={header}
            globalFilter={globalFilter}
            emptyMessage="No payments found."
            responsiveLayout="scroll"
            className="p-datatable-sm"
            onPage={(e) => {
              const newPagination = { page: e.page + 1, per_page: e.rows };
              setPagination(newPagination);
              fetchPaymentReport({ ...filters, ...newPagination });
            }}
          >
            <Column field="payment_date" header="Date" body={dateBodyTemplate} sortable style={{ width: '15%' }} />
            <Column field="reference_no" header="Reference" sortable style={{ width: '15%' }} />
            <Column field="customer.name" header="Customer" sortable style={{ width: '20%' }} />
            <Column field="amount" header="Amount" body={amountBodyTemplate} sortable style={{ width: '15%' }} />
            <Column field="payment_method" header="Method" body={methodBodyTemplate} sortable style={{ width: '15%' }} />
            <Column header="Status" body={statusBodyTemplate} sortable style={{ width: '10%' }} />
            <Column field="warehouse.name" header="Warehouse" sortable style={{ width: '15%' }} />
          </DataTable>
        </div>
      </Card>
    </motion.div>
  );
});

export default PaymentReport;