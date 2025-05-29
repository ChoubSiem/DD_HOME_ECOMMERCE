import React, { useState, useEffect } from "react";
import { Card, message, Space, Button, Spin } from "antd";
import {PlusOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CompanyToolbar from "../../../components/company/CompanyToolbar";
import CompanyTable from "../../../components/company/CompanyTable";
import "./Company.css";
import { useCompany } from "../../../hooks/UseCompnay";

const CompanyManagement = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { handleCompany, handleCompanyUpdate, handleCompanyDelete } = useCompany();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const result = await handleCompany(token);
      if (result && result.companies) {
        setCompanies(result.companies);
      } else {
        message.error("Failed to load companies: No data received");
      }
    } catch (error) {
      message.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = () => {
    navigate("/company/add");
  };

  const handleEdit = (company) => {
    navigate(`/company/edit/${company.id}`);
  };
  


  const handleDelete = async (companyId) => {
    try {
      const result = await handleCompanyDelete(companyId, token);
      if (result.success) {
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Something went wrong");
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="company-management">
          <div className="company-header-content" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Company Management</h1>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
                Manage your company information
              </p>
            </div>
            <Button onClick={handleCreate} type="primary">
              <PlusOutlined/>
              Add Company
            </Button>
          </div>

        <Space direction="vertical" size="middle" style={{ marginBottom: "30px",marginTop:"30px" }}>
          <CompanyToolbar />
        </Space>


        <CompanyTable
          companies={companies}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          setIsModalVisible={setIsModalVisible}
          setCurrentCompany={setCurrentCompany}
        />
      </div>
    </Spin>
  );
};

export default CompanyManagement;
