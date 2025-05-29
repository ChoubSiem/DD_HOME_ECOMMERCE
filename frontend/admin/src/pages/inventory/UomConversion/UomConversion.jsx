import React, { useState, useEffect } from "react";
import { Card, message, Space, Button, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { useProductTerm } from "../../../hooks/UserProductTerm";
import UomConversionModal from "../../../components/unit-conversion/UnitConversionModal";
import UomConversionTable from "../../../components/unit-conversion/UnitConversionTable";
import UomConversionToolbar from "../../../components/unit-conversion/UnitConversionToolbar";

const UomConversionManagement = () => {
  const token = localStorage.getItem("token");
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [currentConversion, setCurrentConversion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);

  const { 
    handleUomConversions, 
    handleUomConversionsCreate, 
    handleUomConversionsDelete, 
    handleUomConversionsUpdate,
    handleUnits
  } = useProductTerm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const conversionsResult = await handleUomConversions(token);

      if (conversionsResult) {
        setConversions(conversionsResult.uoms);
      }

      const unitsResult = await handleUnits(token);
      
      if (unitsResult?.units) {
        setAvailableUnits(unitsResult.units);
      }
    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsModalVisible(true);
    setCurrentConversion(null);
  };

  const handleEdit = (conversion) => {    
    setCurrentConversion(conversion);
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      let result;
      if (currentConversion) {
        result = await handleUomConversionsUpdate(currentConversion.id, values, token);
        
      } else {
        console.log(values);
        
        result = await handleUomConversionsCreate(values, token);
      }      
      if (result?.success) {
        message.success(result.message || 
          `Conversion ${currentConversion ? 'updated' : 'created'} successfully`);
        fetchData();
        setIsModalVisible(false);
      } else {
        message.error(result?.message || 
          `Failed to ${currentConversion ? 'update' : 'create'} conversion`);
      }
    } catch (error) {
      message.error("Operation failed");
    } finally {
        (false);
      setCurrentConversion(null);
    }
  };

  const handleDelete = async (conversionId) => {
    try {
      const result = await handleUomConversionsDelete(conversionId, token);
      if (result?.success) {
        message.success(result.message || 'Conversion deleted successfully');
        setIsModalVisible(false);
        fetchData();
      }
    } catch (error) {
      message.error('Failed to delete conversion');
    }
  };
  const filteredConversions = (Array.isArray(conversions) ? conversions : []).filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.fromUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.toUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.description && conv.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUnitFilter = unitFilter === 'all' || 
      conv.fromUnit === unitFilter || 
      conv.toUnit === unitFilter;
    
    return matchesSearch && matchesUnitFilter;
  });

  return (
    <Spin spinning={loading}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#52c41a", margin: 0 }}>UOM Conversion Management</h2>
            <p style={{ margin: "8px 0 0", color: "#666" }}>
              Manage your unit of measure conversion rules
            </p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Conversion
          </Button>
        </div>
      </Card>

      <UomConversionToolbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        unitFilter={unitFilter}
        setUnitFilter={setUnitFilter}
        availableUnits={availableUnits}
      />

      <UomConversionTable
        conversions={filteredConversions}
        onEdit={handleEdit} 
        onDelete={handleDelete}
      />

        <UomConversionModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          currentConversion={currentConversion}
          handleSave={handleSave}
          availableUnits={availableUnits}
        />
    </Spin>
  );
};

export default UomConversionManagement;