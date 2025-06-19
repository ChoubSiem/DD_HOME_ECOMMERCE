import { message } from 'antd';
import { createPayment,getPurchasePayment,addPurchasePayment,updatePurchasePayment} from '../services/paymentService';

export const usePayment = () => {
  const handlePaymentCreate = async (values,token) => {
    try {
      const companyData = await createPayment(values,token);            
      return {
        success: true,
        payment: companyData,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleGetPurchasePayment = async (purchaseId,token) => {
    try {
      const purchasePayment = await getPurchasePayment(purchaseId,token);                  
      return {
        success: true,
        payment: purchasePayment,     
        message: purchasePayment.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleAddPurchasePayment = async (values,token) => {
    try {
      const purchasePayment = await addPurchasePayment(values,token);                  
      return {
        success: true,
        payment: purchasePayment,     
        message: purchasePayment.message  
      };
      
    } catch (error) {
      
    }
  };

  

  return { handlePaymentCreate ,handleGetPurchasePayment,handleAddPurchasePayment};
};