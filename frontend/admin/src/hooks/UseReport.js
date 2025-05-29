import { message } from 'antd';
import {getPurchaseReports , getSaleReports ,getShiftReports} from "../services/reoportService";

export const useReport = () => {
  const getPurchaseReportData = async(warehouse_id , token ) =>{
    const response = await getPurchaseReports(warehouse_id,token);
    if (response.list) {
        return {
            success: true,
            purchases: response.list,     
            message: response.message  
        };
    }
  }
  const getSaleReportsData = async(warehouse_id , token ) =>{
    const response = await getSaleReports(warehouse_id,token);
    if (response.sales) {
        return {
            success: true,
            sales: response.sales,     
            message: response.message  
        };
    }
  }
  const getShiftReportData = async(warehouse_id , token ) =>{
    const response = await getShiftReports(warehouse_id,token);
    if (response.shifts) {
        return {
            success: true,
            shifts: response.shifts,     
            message: response.message  
        };
    }
  }

  return { getPurchaseReportData ,getSaleReportsData , getShiftReportData};
};