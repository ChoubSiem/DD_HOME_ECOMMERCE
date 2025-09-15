import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Space,
  DatePicker,
  Row,
  Col,
  Spin,
  message,
  Typography,
} from "antd";
import {
  SearchOutlined,
  FileExcelOutlined,
  ClearOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useUser } from "../../../hooks/UserUser";
import { useReport } from "../../../hooks/UseReport";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const CreditInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { getCreditSalesData } = useReport();

  // Filter states
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    dateRange: null,
    customer: "all",
    customerGroup: "all",
    invoiceType: "all",
  });

  const [pendingFilters, setPendingFilters] = useState({
    searchTerm: "",
    dateRange: null,
    customer: "all",
    customerGroup: "all",
    invoiceType: "all",
  });

  const { handleCustomers, handleGetCustomerGroup } = useUser();

  const userData = useMemo(() => JSON.parse(Cookies.get("user") || "{}"), []);
  const token = localStorage.getItem("token");

  const fetchCustomers = async () => {
    try {
      const result = await handleCustomers(token);
      if (result?.success) {
        setCustomers(result.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchCustomerGroups = async () => {
    try {
      const result = await handleGetCustomerGroup(token);
      if (result?.success) {
        setCustomerGroups(result.groups || []);
      }
    } catch (error) {
      console.error("Error fetching customer groups:", error);
      message.error("Failed to fetch customer groups.");
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerGroups();
  }, []);

  const fetchCreditInvoices = async () => {
    try {
      setIsLoading(true);

      const filters = {
        warehouse_id: userData.warehouse_id,
        customer:
          appliedFilters.customer !== "all"
            ? appliedFilters.customer
            : undefined,
        customer_group:
          appliedFilters.customerGroup !== "all"
            ? appliedFilters.customerGroup
            : undefined,
        search_term: appliedFilters.searchTerm || undefined,
        start_date: appliedFilters.dateRange?.[0]?.format(
          "YYYY-MM-DD HH:mm:ss"
        ),
        end_date: appliedFilters.dateRange?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
        invoice_type:
          appliedFilters.invoiceType !== "all"
            ? appliedFilters.invoiceType
            : undefined,
        per_page: 10000,
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const response = await getCreditSalesData(cleanedFilters, token);
      if (response.success) {
        // Get all data without pagination
        setInvoices(response.creditSales.data.data || []);
        setError(null);
      }
    } catch (err) {
      message.error("Failed to load credit invoices");
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditInvoices();
  }, [appliedFilters]);

  const debouncedSetPendingSearch = useMemo(
    () =>
      debounce(
        (value) =>
          setPendingFilters((prev) => ({ ...prev, searchTerm: value })),
        500
      ),
    []
  );

  useEffect(() => {
    return () => debouncedSetPendingSearch.cancel();
  }, [debouncedSetPendingSearch]);
  
  const columns = useMemo(
    () => [
      {
        field: "reference",
        header: "Invoice No",
        sortable: true,
        style: { minWidth: "150px" },
        body: (rowData) => <Text strong>{rowData.reference}</Text>,
      },
      {
        field: "date",
        header: "Date",
        sortable: true,
        style: { minWidth: "120px" },
        body: (rowData) => (
          <Text>{dayjs(rowData.date).format("YYYY-MM-DD HH:mm")}</Text>
        ),
      },
      {
        field: "customer_name",
        header: "Customer",
        sortable: true,
        style: { minWidth: "180px" },
        body: (rowData) => (
          <Text>{rowData.customer?.username || "Walk-in"}</Text>
        ),
      },
      {
        field: "customer_group",
        header: "Customer Group",
        sortable: true,
        style: { minWidth: "150px" },
        body: (rowData) => (
          <Text>{rowData.customer?.customer_group?.name || "N/A"}</Text>
        ),
      },
      {
        field: "total_amount",
        header: "Amount",
        sortable: true,
        style: { minWidth: "120px", textAlign: "right" },
        body: (rowData) => (
          <Text>${Number(rowData.total || 0).toFixed(2)}</Text>
        ),
      },
      {
        field: "credit_amount",
        header: "Credit Amount",
        sortable: true,
        style: { minWidth: "120px", textAlign: "right" },
        body: (rowData) => (
          <Text>${Number(rowData.credit_amount || 0).toFixed(2)}</Text>
        ),
      },
      {
        field: "next_payment",
        header: "Next Payment Date",
        sortable: true,
        style: { minWidth: "120px" },
        body: (rowData) => (
          <Text>
            {rowData.next_payment_date
              ? dayjs(rowData.next_payment_date).format("YYYY-MM-DD")
              : "N/A"}
          </Text>
        ),
      },
    ],
    []
  );

  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      if (!invoices.length) {
        message.warning("No data available to export");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Credit Invoices");

      worksheet.addRow(["Credit Invoices Report"]).font = {
        size: 16,
        bold: true,
      };
      worksheet.addRow([
        `Date Range: ${
          appliedFilters.dateRange?.[0]
            ? dayjs(appliedFilters.dateRange[0]).format("YYYY-MM-DD")
            : "All Dates"
        } to ${
          appliedFilters.dateRange?.[1]
            ? dayjs(appliedFilters.dateRange[1]).format("YYYY-MM-DD")
            : "All Dates"
        }`,
      ]);
      worksheet.addRow([`Warehouse: ${invoices[0]?.warehouse?.name || "All"}`]);
      worksheet.addRow([`Generated At: ${dayjs().format("YYYY-MM-DD HH:mm")}`]);
      worksheet.addRow([]);

      const headers = [
        "Invoice No",
        "Date",
        "Customer",
        "Customer Group",
        "Total Amount",
        "Credit Amount",
        "Next Payment Date",
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      invoices.forEach((invoice) => {
        const rowData = [
          invoice.reference,
          dayjs(invoice.date).format("YYYY-MM-DD HH:mm"),
          invoice.customer?.username || "Walk-in",
          invoice.customer?.customer_group?.name || "N/A",
          Number(invoice.total || 0),
          Number(invoice.credit_amount || 0),
          invoice.next_payment_date
            ? dayjs(invoice.next_payment_date).format("YYYY-MM-DD")
            : "N/A",
        ];
        const row = worksheet.addRow(rowData);
        row.getCell(5).numFmt = "#,##0.00";
        row.getCell(6).numFmt = "#,##0.00";
      });

      const totalAmount = invoices.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0
      );

      const totalCredit = invoices.reduce(
        (sum, inv) => sum + Number(inv.credit_amount || 0),
        0
      );

      const totalRow = worksheet.addRow([
        "",
        "",
        "",
        "TOTAL:",
        totalAmount,
        totalCredit,
        "",
      ]);

      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 5 || colNumber === 6) {
          cell.font = { bold: true };
          cell.numFmt = "#,##0.00";
        }
        if (colNumber === 4) {
          cell.font = { bold: true };
        }
      });

      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 0;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 30);
      });

      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `credit-invoices-${dayjs().format("YYYY-MM-DD-HHmm")}.xlsx`
      );
      message.success("Excel file exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export Excel file");
    } finally {
      setExportLoading(false);
    }
  }, [invoices, appliedFilters]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: "",
      dateRange: null,
      customer: "all",
      customerGroup: "all",
      invoiceType: "all",
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setSelectedRows([]);
    message.info("Filters cleared");
  }, []);

  if (error) {
    return (
      <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
        <Card>
          <Text type="danger">
            Error: {error.message || "Failed to load credit invoices"}
          </Text>
          <Button
            type="primary"
            onClick={fetchCreditInvoices}
            style={{ marginLeft: 16 }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin
      spinning={isLoading || exportLoading}
      tip={exportLoading ? "Exporting..." : "Loading credit invoices..."}
      size="large"
    >
      <div>
        <Card style={{ marginBottom: 24, background: "#fff2f0" }} hoverable>
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ margin: 0, color: "#cf1322" }}>
                Credit Invoices
              </Title>
              <Text type="secondary">Manage credit sales and invoices</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Warehouse: </Text>
                <Text>{invoices[0]?.warehouse?.name || "N/A"}</Text>
              </div>
            </Col>
            <Col>
              <RollbackOutlined
                style={{ fontSize: 48, color: "#ffa39e", opacity: 0.8 }}
              />
            </Col>
          </Row>
        </Card>

        <Card
          style={{ marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          hoverable
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search invoice or customer"
                prefix={<SearchOutlined style={{ color: "#cf1322" }} />}
                onChange={(e) => debouncedSetPendingSearch(e.target.value)}
                value={pendingFilters.searchTerm}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Start Date", "End Date"]}
                value={pendingFilters.dateRange}
                onChange={(dates) =>
                  setPendingFilters((prev) => ({ ...prev, dateRange: dates }))
                }
                size="large"
                format="YYYY-MM-DD"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter by customer"
                value={pendingFilters.customer}
                onChange={(value) =>
                  setPendingFilters((prev) => ({ ...prev, customer: value }))
                }
                allowClear
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                optionFilterProp="children"
              >
                <Option value="all">All Customers</Option>
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.username || customer.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter by customer group"
                value={pendingFilters.customerGroup}
                onChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    customerGroup: value,
                  }))
                }
                allowClear
                size="large"
              >
                <Option value="all">All Groups</Option>
                {customerGroups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Row style={{ marginTop: "20px", gap: "10px" }}>
            <Col xs={24} sm={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                size="large"
                style={{
                  width: "100%",
                  backgroundColor: "#cf1322",
                  borderColor: "#cf1322",
                }}
              >
                Apply Filters
              </Button>
            </Col>
            <Col xs={24} sm={12} md={3}>
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="large"
                style={{ width: "100%" }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card>

        <div>
          <Card
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  loading={exportLoading}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    color: "white",
                  }}
                >
                  Export Excel
                </Button>
              </Space>
            }
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <DataTable
              value={invoices}
              dataKey="id"
              scrollable
              scrollHeight="600px"
              sortMode="multiple"
              tableStyle={{ width: "100%" }}
              className="p-datatable-striped p-datatable-gridlines"
              loading={isLoading}
              responsiveLayout="scroll"
            >
              {columns.map((col, index) => (
                <Column
                  key={`${col.field}-${index}`}
                  field={col.field}
                  header={col.header}
                  sortable={col.sortable}
                  body={col.body}
                  style={col.style}
                />
              ))}
            </DataTable>
          </Card>
        </div>
      </div>
    </Spin>
  );
};

export default CreditInvoice;
