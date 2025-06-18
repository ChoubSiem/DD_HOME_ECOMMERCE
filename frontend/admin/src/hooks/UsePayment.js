import { message } from 'antd';
import { createPaymen,getPurchasePayment,addPurchasePayment,updatePurchasePayment} from '../services/paymentService';

export const usePayment = () => {
  const handlePaymentCreate = async (values,token) => {
    try {
      const companyData = await getPurchasePayment(values,token);            
      return {
        success: true,
        payment: companyData.data,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleGetPurchasePayment = async (purchaseId,token) => {
    try {
      const companyData = await createPayment(purchaseId,token);            
      return {
        success: true,
        payment: companyData.data,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };

  

  return { handlePaymentCreate};
};