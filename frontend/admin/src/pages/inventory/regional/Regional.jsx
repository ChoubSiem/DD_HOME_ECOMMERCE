import React, { useState,useEffect  } from "react";
import {message,Space,Button,Spin} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import RegionalModal from "../../../components/regional/RegionalModal";
import RegionalTable from "../../../components/regional/RegionalTable";
import RegionalToolbar from "../../../components/regional/RegionalToolbar";
import "./Regional.css";
import {useCompany} from "../../../hooks/UseCompnay";
import { useNavigate } from "react-router-dom";
import { usePolicy } from "../../../hooks/usePolicy";
import Cookies from "js-cookie";

const CompanyManagement = () => {
  const user = JSON.parse(Cookies.get("user"));
  const token = localStorage.getItem('token');
  const {handleRegional, handleRegionalCreate , handleRegionalUpdate,handleRegionalDelete} = useCompany();
  const [regionals, setRegionals] = useState([]);
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentRegionals, setCurrentRegionals] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [permissions, setPermission] = useState([]);
  const { handleRolePermission } = usePolicy();

  
  const fetchPermisson = async () => {
      let result = await handleRolePermission(user.role_id);
      
      if (result.success) {
        setPermission(result.rolePermissions);
      }
    }
    useEffect(() => {
      fetchPermisson();
    }, []);
    const hasRegionalPermission = permissions.some(
      (p) => p.name === "Regional.create"
    );
  
  useEffect(() => {
    const fetchRegionals = async () => {
      setLoading(true);
      try {
        const result = await handleRegional(token);     
        if (result && result.regionals) {          
          setRegionals(result.regionals); 
        }
      } catch (error) {
        message.error("Failed to load regional");
      }finally {
        setLoading(false); 
      }
    };

    fetchRegionals();
  }, []);
  

  const handleCreate = () => {
    navigate("/regional/add");
  };

  const handleEdit = (company) => {
    navigate(`/regional/edit/${company.id}`);
  };

  const handleSave = async (values) => {
    const isUpdate = currentRegionals !== null; 
  
    try {
      let result; 
  
      if (isUpdate) {
        result = await handleRegionalUpdate(values, token, currentCompany);
        
        if (result && result.success && result.data) {
          message.success(result.message || "Regional updated successfully");
          setRegionals((prev) => 
            prev.map((regional) => regional.id === result.data.id ? result.data : regional)
        );
      } else {
        message.error(result?.message || "Failed to update regional");
      }
    } else {
      result = await handleRegionalCreate(values, token);        
      if (result && result.success) { 
          message.success(result.message || "Regional created successfully");
          setRegionals((prev) => [...prev, result.regionals]);
          setLoading(true);
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 2000);

        } else {
          message.error(result?.message || "Failed to create regional");
        }
      }
    } catch (error) {
      console.error("Error during company save:", error);
      message.error(error?.message || "Something went wrong");
    } finally {
      setIsModalVisible(false);
      setCurrentRegionals(null); 
    }
  };
  
  
  const handleDelete = async(regional_id) => {
    let  result = await handleRegionalDelete(regional_id, token);    
      if (result.success) {
        setCompanies(regionals.filter((c) => c.key !== regional_id));
        message.success(result.message || "Regional deleted successfully");
      }else{
        message.error(result?.message );
    };
  };

  return (
    <Spin spinning={loading}>
    <div className="company-management">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
              <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Regional Management</h1>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
                Manage your regional information
              </p>
            </div>
          {hasRegionalPermission && (
            <Button onClick={handleCreate} type="primary"> <PlusOutlined/>Add Regional</Button>
          )}
        </div>

        <Space direction="vertical" size="middle" style={{ marginBottom: "30px",marginTop:"30px" }}>
          <RegionalToolbar />
        </Space>

        <RegionalTable
          regionals={regionals}
          setCurrentRegionals={setCurrentRegionals}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          permissions={permissions}
        />

      <RegionalModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        currentRegionals={currentRegionals}
        handleSave={handleSave}
      />
    </div>
  </Spin>
  );
};

export default CompanyManagement;