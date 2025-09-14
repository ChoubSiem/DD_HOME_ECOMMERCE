import React, { useState,useEffect  } from "react";
import {Card,message,Space,Button,Spin} from "antd";
import UnitModal from "../../../components/unit/UnitModal";
import UnitTable from "../../../components/unit/UnitTable";
import UnitToolbar from "../../../components/unit/UnitToolbar";
import "./Unit.css";
import {useProductTerm} from "../../../hooks/UserProductTerm";
import { PlusOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { usePolicy } from "../../../hooks/usePolicy";

const UnitManagement = () => {
  const token = localStorage.getItem("token");
  const [units, setUnits] = useState([]);
  const [loading , setLoading] = useState(false);
  const userData = JSON.parse(Cookies.get("user"));

  const [currentUnit, setCurrentUnit] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {handleUnits ,handleUnitCreate ,handleUnitDelete,handleUnitUpdate} = useProductTerm();

  const [permissions, setPermission] = useState([]);
  const { handleRolePermission } = usePolicy();   

  const handleCreate = () =>{
    setIsModalVisible(true);
  }


  const fetchUnit = async () => {
    setLoading(true); 
    try {
      const result = await handleUnits(token);        
      if (result && result.units) {          
        setUnits(result.units); 
      } else {
        message.error("Failed to load unit: No data received");
      }
    } catch (error) {
      message.error("Failed to load unit");
    }finally {
      setLoading(false); 
    }
  };
  
  const fetchPermisson = async () => {
    let result = await handleRolePermission(userData.role_id);
      
    if (result.success) {
      setPermission(result.rolePermissions);
    }
  }  

  useEffect(() => {
    fetchUnit();
    fetchPermisson();
  }, []);

  const hasUnitPermission = permissions.some(
    (p) => p.name === "Unit.create"
  );

  const handleSave = async (values) => {
    const isUpdate = currentUnit !== null;
    let result;
  
    try {
      if (isUpdate) {
        result = await handleUnitUpdate(values, token, currentUnit.id);
  
        if (result?.success) {
          message.success(result.message || "Unit updated successfully");          
          setUnits((prev) =>
            prev.map((unit) => unit.id === result.unit.id ? result.unit : unit)
          );
        } else {
          message.error(result?.message || "Failed to update unit");
        }
      } else {
        result = await handleUnitCreate(values, token);
  
        if (result?.success && result.unit) {
          message.success(result.message || "Unit created successfully");
  
          setUnits((prev) => [...prev, result.unit]);
        } else {
          message.error(result?.message || "Failed to create unit");
        }
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setIsModalVisible(false);
      setCurrentUnit(null);
    }
  };
  
  
  const handleDelete = async (unitId) => {    
    let result = await handleUnitDelete(unitId , token);
    if(result.success){
      fetchUnit(token);
      message.success(result.message || 'unit deleted successfully');
    }
  };

  return (
    <Spin spinning={loading}>
    <div className="warehouse-management">
      <Card className="warehouse-header-card" style={{ body:{ padding: "24px" }}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="warehouse-header-content">
            <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Unit Management</h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
              Manage your unit information
            </p>
          </div>
          {hasUnitPermission && (
          <Button onClick={handleCreate} type="primary"> <PlusOutlined/> Add Unit</Button>
          )}
        </div>
      </Card>

        <Space direction="vertical" size="middle" style={{ width: "100%",marginBottom:'30px' }}>
          <UnitToolbar />
        </Space>

        <UnitTable
          units={units}     
          setCurrentUnit={setCurrentUnit}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
          permissions={permissions}
        />

      <UnitModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        currentUnit={currentUnit}
        handleSave={handleSave}
      />
    </div>
  </Spin>
  );
};

export default UnitManagement;