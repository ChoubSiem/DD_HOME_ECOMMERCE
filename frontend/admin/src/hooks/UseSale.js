import { message } from 'antd';
import { getPosSales,addPosSale,addOpenShift ,getOneOpenShift,UpdateOpenShift,addCloseShift,getSalesInventory,getSalePaymentOne,getOneInventorySale,updateSaleInventory,deleteSaleInventory, deletePosSale, getOneProcessingShift} from '../services/saleService';
export const useSale = () => {
  const handlePosSales = async (warehouseId,token) => {
    try {
      const permissionData = await getPosSales(warehouseId,token);            
      return {
        success: true,
        data: permissionData,
        sales: permissionData.list            
      };
      
    } catch (error) {
      
    }
  };
  const handleSaleInventory = async (warehouseId,token) => {
    try {
      const permissionData = await getSalesInventory(warehouseId,token);            
      return {
        success: true,
        data: permissionData,
        sales: permissionData.data            
      };
      
    } catch (error) {
      
    }
  };
  const handleGetOneInventorySale = async (saleId,token) => {
    try {
      const saleData = await getOneInventorySale(saleId,token);            
      return {
        success: true,
        data: saleData,
        sale: saleData.data            
      };
      
    } catch (error) {
      
    }
  };
  const handlePosSaleCreate = async (values,token) => {
    try {
      const posSaleData = await addPosSale(values,token);            
      return {
        success: true,
        data: posSaleData,
        sales: posSaleData.sales, 
      };
      
    } catch (error) {
      
    }
  };
  const handleOpenShiftCreate = async (values,token) => {
    try {
      const posSaleData = await addOpenShift(values,token);            
      return {
        success: true,
        data: posSaleData,
        shift: posSaleData.shift, 
      };
      
    } catch (error) {
      
    }
  };
  const handleCloseShiftCreate = async (values,token) => {
    try {
      const posSaleData = await addCloseShift(values,token);            
      return {
        success: true,
        data: posSaleData,
        shift: posSaleData.shift, 
      };
      
    } catch (error) {
      
    }
  };
  const handleGetOneOpenShift = async (shiftId,warehouse_id,token) => {
    try {
      const shiftData = await getOneOpenShift(shiftId,warehouse_id,token);   
              
      return {
        success: true,
        shift: shiftData.data
        , 
      };
      
    } catch (error) {
      
    }
  };
  const handleGetOneProcessingShift = async (warehouse_id,token) => {
    try {
      const shiftData = await getOneProcessingShift(warehouse_id,token);   
              
      return {
        success: true,
        shift: shiftData.data
        , 
      };
      
    } catch (error) {
      
    }
  };
  
  const handleOpenShiftUpdate = async (shiftId,values,token) => {
    try {
      const posSaleData = await UpdateOpenShift(shiftId,values,token);            
      return {
        success: true,
        data: posSaleData,
        shift: posSaleData.shift, 
      };
      
    } catch (error) {
      
    }
  };


  const handleGetPaymentOne = async (saleId,token) => {
    try {
      const paymentData = await getSalePaymentOne(saleId,token);            
      return {
        success: true,
        data: paymentData,
        payments: paymentData.data, 
      };
      
    } catch (error) {
      
    }
  };
  const handleUpdateSaleInventory = async (saleId,values,token) => {
    try {
      const saleData = await updateSaleInventory(saleId,values,token);            
      return {
        success: true,
        data: saleData,
        sale: saleData.data, 
      };
      
    } catch (error) {
      
    }
  };
  const handleDeleteSaleInventory = async (saleId,token) => {
    try {
      const saleData = await deleteSaleInventory(saleId,token);            
      return {
        success: true,
        data: saleData,
        sale: saleData.data, 
      };
      
    } catch (error) {
      
    }
  };
  const handleDeleteSalePos = async (saleId,token) => {
    try {
      const saleData = await deletePosSale(saleId,token);            
      return {
        success: true,
        data: saleData,
        sale: saleData.data, 
      };
      
    } catch (error) {
      
    }
  };
  return {
    
    handlePosSales,
    handlePosSaleCreate,
    handleOpenShiftCreate,
    handleGetOneOpenShift,
    handleOpenShiftUpdate,
    handleCloseShiftCreate,
    handleSaleInventory,
    handleGetPaymentOne,
    handleGetOneInventorySale,
    handleUpdateSaleInventory,
    handleDeleteSaleInventory,
    handleDeleteSalePos,
    handleGetOneProcessingShift
  
  };
};