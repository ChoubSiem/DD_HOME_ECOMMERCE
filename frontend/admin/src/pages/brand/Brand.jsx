import React, { useState,useEffect  } from "react";
import {Card,message,Space,Button,Spin} from "antd";
import BrandModle from "../../components/brand/BrandModal";
import BrandTable from "../../components/brand/BrandTable";
import BrandToolbar from "../../components/brand/BrandToolbar";
// import "./Unit.css";
import {useProductTerm} from "../../hooks/UserProductTerm";
import { PlusOutlined } from "@ant-design/icons";

const BrandManagement = () => {
  const token = localStorage.getItem('token');
  const [brands, setBrands] = useState([]);
  const [loading , setLoading] = useState(false);

  const [currentBrand, setCurrentBrand] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {handleBrands ,handleBrandCreate ,handleBrandDelete,handleBrandUpdate} = useProductTerm();


  const handleCreate = () =>{
    setIsModalVisible(true);
  }


  const fetchUnit = async () => {
    setLoading(true); 
    try {
      const result = await handleBrands(token);       
       
      if (result && result.brands) {          
        setBrands(result.brands); 
      } else {
        message.error("Failed to load brand: No data received");
      }
    } catch (error) {
      message.error("Failed to load brand");
    }finally {
      setLoading(false); 
    }
  };  

  useEffect(() => {

    fetchUnit();
  }, []);

  const handleSave = async (values) => {
    const isUpdate = currentBrand !== null;
    let result;
  
    try {
      if (isUpdate) {
        console.log(currentBrand);
        
        result = await handleBrandUpdate( currentBrand.id,values, token);
        
        if (result?.success) {
          message.success(result.message || "brand updated successfully");          
          setBrands((prev) =>
            prev.map((brand) => brand.id === result.brand.id ? result.brand : brand)
          );
        } else {
          message.error(result?.message || "Failed to update brand");
        }
      } else {
        result = await handleBrandCreate(values, token);
  
        if (result?.success) {
          message.success(result.message || "brand created successfully");        
          setBrands((prev) => [...prev, result.brand]);
        } else {
          message.error(result?.message || "Failed to create brand");
        }
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setIsModalVisible(false);
      setCurrentBrand(null);
    }
  };
  
  
  const handleDelete = async (brandId) => {    
    let result = await handleBrandDelete(brandId , token);
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
            <h1 style={{ color: "#52c41a", fontSize: "23px", margin: 0 }}>Brand Management</h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#666" }}>
              Manage your brand information
            </p>
          </div>
          <Button onClick={handleCreate} type="primary"> <PlusOutlined/> Add Brand</Button>
        </div>
      </Card>

        <Space direction="vertical" size="middle" style={{ width: "100%",marginBottom:'30px' }}>
          <BrandToolbar />
        </Space>

        <BrandTable
          brands={brands}     
          setCurrentBrand={setCurrentBrand}
          setIsModalVisible={setIsModalVisible}
          handleDelete={handleDelete}
        />

      <BrandModle
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        currentBrand={currentBrand}
        handleSave={handleSave}
      />
    </div>
  </Spin>
  );
};

export default BrandManagement;