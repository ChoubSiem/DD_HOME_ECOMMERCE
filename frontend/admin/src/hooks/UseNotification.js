import { message } from 'antd';
import { getAdjustmentNotification,updateAdjustmentNotification} from '../services/notificationService';

export const useNotifications = () => {
  const handleAdjustmentNotifications = async (token) => {
    try {
      const companyData = await getAdjustmentNotification(token);            
      return {
        success: true,
        notifications: companyData.notifications,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };
  const handleUpdateAdjustmentNotifications = async (token,id) => {
    try {
      const companyData = await updateAdjustmentNotification(token,id);            
      return {
        success: true,
        notifications: companyData.notifications,     
        message: companyData.message  
      };
      
    } catch (error) {
      
    }
  };



  return { 
    handleAdjustmentNotifications,
    handleUpdateAdjustmentNotifications
  };
};