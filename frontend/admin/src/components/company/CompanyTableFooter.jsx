import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Space, Popconfirm, Input, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { formatDateTime } from "../../util/helper";

const CompanyTable = ({ companies = [], setCurrentCompany, setIsModalVisible, handleDelete }) => {
  const [filters, setFilters] = useState({
    name: "",
    ceo: "",
    location: "",
    phone: "",
    email: "",
    updated_at: "",
  });

  const handleFilterChange = (e, column) => {
    setFilters({ ...filters, [column]: e.target.value });
  };

  const filteredData = companies.filter((company) => {
    return (
      (company.name?.toLowerCase().includes(filters.name.toLowerCase()) || filters.name === "") &&
      (company.ceo?.username?.toLowerCase().includes(filters.ceo.toLowerCase()) || filters.ceo === "") &&
      (company.location?.toLowerCase().includes(filters.location.toLowerCase()) || filters.location === "") &&
      (company.phone?.toLowerCase().includes(filters.phone.toLowerCase()) || filters.phone === "") &&
      (company.email?.toLowerCase().includes(filters.email.toLowerCase()) || filters.email === "") &&
      (company.updated_at?.toLowerCase().includes(filters.updated_at.toLowerCase()) || filters.updated_at === "")
    );
  });

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "5%",
    },
    {
      name: "Company Name",
      selector: (row) => row.name || "-",
      sortable: true,
      width: "15%",
    },
    {
      name: "Managing Director/CEO",
      selector: (row) => row.ceo?.username || null,
      sortable: true,
      width: "15%",
    },
    {
      name: "Address",
      selector: (row) => row.location || "-",
      sortable: true,
      width: "20%",
    },
    {
      name: "Phone",
      selector: (row) => row.phone || "-",
      sortable: true,
      width: "10%",
    },
    {
      name: "Email",
      selector: (row) => row.email || "-",
      sortable: true,
      width: "10%",
    },
    {
      name: "Last Updated",
      selector: (row) => row.updated_at,
      sortable: true,
      width: "15%",
      cell: (row) => row.updated_at ? formatDateTime(row.updated_at) : "-",
    },
    {
      name: "Actions",
      cell: (row) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentCompany(row);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this company?"
            onConfirm={() => handleDelete(row.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
      ignoreRowClick: true,
      width: "10%",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#52c41a",
        color: "white",
        fontWeight: "bold",
      },
    },
  };

  return (
    <div style={{ minHeight: "200px" }}>
      <DataTable
        columns={columns}
        data={filteredData.map(company => ({ ...company, key: company.id }))}
        persistTableHead
        pagination
        highlightOnHover
        noDataComponent={
          <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
            🚫 No companies found.
          </div>
        }
        customStyles={customStyles}
      />
      
      {/* Filter Footer */}
      <div style={{ marginTop: "20px" }}>
        <Row gutter={16}>
          {columns.map((column, index) => {
            if (column.name !== "Actions") {
              return (
                <Col span={8} key={index}>
                  <Input
                    placeholder={`Filter ${column.name}`}
                    value={filters[column.name.toLowerCase()]}
                    onChange={(e) => handleFilterChange(e, column.name.toLowerCase())}
                    allowClear
                  />
                </Col>
              );
            }
            return null;
          })}
        </Row>
      </div>
    </div>
  );
};

export default CompanyTable;
