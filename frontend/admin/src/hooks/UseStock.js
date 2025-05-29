import { message } from 'antd';
import { 
    fetchAdjustment , 
    createAdjustment ,
    createStockTransfer ,
    updateAdjustment , 
    deleteAdjustment ,
    showAdjustment,
    deleteUomTransfer,
    createUomTransfer,
    getUomTransfer,
    getUomTransferOne,
    updateUomTransfer,
    createPurchase, 
    showPurchase, 
    updatePurchase, 
    deletePurchase,
    createSuspand,
    deleteSuspand,
    getSuspends,
    fetchPurchase,
    getStockTransfers

} from '../services/stockService';

export const useStock = () => {
    const handleAdjustments = async(token) => {
        let result = await fetchAdjustment(token);
        if (result) {
            return{
                success:true,
                adjustments:result.adjustments
            }
        }
        return false;
    }
    const handleCreateAdjustment = async(values,token) => {
        let result = await createAdjustment(values,token);
        if (result) {
            return{
                success:true,
                adjustment:result.adjustment
            }
        }
        return false;
    }
    const handleShowAdjustment = async(adjustId,token) => {
        let result = await showAdjustment(adjustId,token);
        if (result) {
            return{
                success:true,
                adjustment:result.adjustment
            }
        }
        return false;
    }
    const handleUpdateAdjustment = async(adjustId,values,token) => {
        let result = await updateAdjustment(adjustId,values,token);
        if (result) {
            return{
                success:true,
                adjustment:result.adjustment
            }
        }
        return false;
    }
    const handleDeleteAdjustment = async(adjustId, token) => {
        let result = await deleteAdjustment(adjustId ,token);
        if (result) {
            return{
                success:true,
                adjustment:result.adjustment
            }
        }
        return false;
    }

    const handleCreateUomTransfer = async(values, token) => {
        let result = await createUomTransfer(values ,token);
        if (result) {
            return{
                success:true,
                uoms:result.uoms
            }
        }
        return false;
    }
    const handleGetUomTransfer = async(token, warehouse_id) => {
        let result = await getUomTransfer(token ,warehouse_id);
        if (result) {
            return{
                success:true,
                uoms:result.data
            }
        }
        return false;
    }
    const handleUomTransferUpdate = async(uomId,values,token) => {
        let result = await updateUomTransfer( uomId,values,token);
        if (result) {
            return{
                success:true,
                uoms:result.data
            }
        }
        return false;
    }
    const handleGetUomTransferOne = async(token, uomId) => {
        let result = await getUomTransferOne(token ,uomId);
        if (result) {
            return{
                success:true,
                uoms:result.data
            }
        }
        return false;
    }
    const handleGetUomTransferDelete = async(token, uomId) => {
        let result = await deleteUomTransfer(token ,uomId);
        if (result) {
            return{
                success:true,
                uom:result.data
            }
        }
        return false;
    }
    const handleGetPurchases = async(values,token) => {
        let result = await fetchPurchase(values,token);
        if (result) {
            return{
                success:true,
                purchases:result.list
            }
        }
        return false;
    }
    const handleCreatePurchase = async(values,token) => {
        let result = await createPurchase(values,token);
        if (result) {
            return{
                success:true,
                purchase:result.purchase
            }
        }
        return false;
    }
    const handleShowPurchase = async(purchaseId,token) => {
        let result = await showPurchase(purchaseId,token);
        if (result) {
            return{
                success:true,
                purchase:result.purchase
            }
        }
        return false;
    }
    const handleUpdatePurchase = async(values,token) => {
        let result = await updatePurchase(values,token);
        if (result) {
            return{
                success:true,
                purchases:result.list
            }
        }
        return false;
    }
    const handleDeletePurchase = async(purchaseId, token) => {
        let result = await deletePurchase(purchaseId ,token);
        if (result) {
            return{
                success:true,
                purchase:result.purchase
            }
        }
        return false;
    }
    
    const handleGetStockTransfers = async(warehouse_id, token) => {
        let result = await getStockTransfers(warehouse_id ,token);
        if (result) {
            return{
                success:true,
                stockTransfers:result.list,
                message:result.message
            }
        }
    }
    const handleCreateStockTransfer = async(values, token) => {
        let result = await createStockTransfer(values ,token);
        if (result) {
            return{
                success:true,
                uoms:result.uoms,
                message:result.message
            }
        }
    }


    const handleSuspandCreate = async(values,warehouseId, token) => {        
        let result = await createSuspand(values ,warehouseId,token);
        if (result) {
            return{
                success:true,
                suspand:result.suspand,
                message:result.message
            }
        }
    }
    const handleGetSuspends = async(warehouseId, shiftId , token) => {        
        let result = await getSuspends( warehouseId,shiftId,token);
        if (result) {
            return{
                success:true,
                suspands:result.suspands,
                message:result.message
            }
        }
    }
    const handleSuspendDelete = async(id, token) => {        
        let result = await deleteSuspand(id,token);
        if (result) {
            return{
                success:true,
                suspand:result.suspand,
                message:result.message
            }
        }
    }

  return { 
    handleAdjustments,
    handleCreateStockTransfer ,
    handleCreateAdjustment,
    handleGetUomTransferDelete,
    handleShowAdjustment,
    handleUpdateAdjustment,
    handleDeleteAdjustment,
    handleUomTransferUpdate,
    handleGetUomTransferOne,
    handleCreateUomTransfer,
    handleGetUomTransfer,
    handleGetPurchases,
    handleCreatePurchase,
    handleShowPurchase,
    handleUpdatePurchase,
    handleDeletePurchase,
    handleSuspandCreate,
    handleSuspendDelete,
    handleGetSuspends,
    handleGetStockTransfers

    };
};