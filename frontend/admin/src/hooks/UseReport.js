import { message } from 'antd';
import {getPurchaseReports , getSaleReports ,getShiftReports ,getStockReports ,getProductReports ,getPaymentReport} from "../services/reoportService";

export const useReport = () => {
  const getPurchaseReportData = async(values , token ) =>{
    const response = await getPurchaseReports(values,token);
    if (response.purchases) {
        return {
            success: true,
            purchases: response.purchases,     
            message: response.message  
        };
    }
  }
  const getSaleReportsData = async(values , token ) =>{
    const response = await getSaleReports(values,token);
    if (response.sales) {
        return {
            success: true,
            sales: response.sales,     
            message: response.message  
        };
    }
  }
  const getStockReportsData = async(values , token ) =>{
    const response = await getStockReports(values,token);
          console.log(response);

    if (response.success) {
        return {
            success: true,
            stocks: response.stocks,     
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
  const getProductReportsData = async(values , token ) =>{
    const response = await getProductReports(values,token);
    if (response.success) {
        return {
            success: true,
            products: response.products,     
            message: response.message  
        };
    }
  }
  const getPaymentReportsData = async(values , token ) =>{
    const response = await getPaymentReport(values,token);
    if (response.success) {
        return {
            success: true,
            payments: response.payments,     
            message: response.message  
        };
    }
  }
  
  return { getPurchaseReportData ,getSaleReportsData , getShiftReportData ,getStockReportsData ,getProductReportsData,getPaymentReportsData};
};