import { message } from 'antd';
import { createPayment} from '../services/paymentService';

export const usePayment = () => {
  const handlePaymentCreate = async (values,token) => {
    try {
      const companyData = await createPayment(values,token);            
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