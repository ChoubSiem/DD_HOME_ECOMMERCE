import React, { useState , useEffect } from 'react';
import EmployeeForm from './EmployeeForm';
import { usePolicy } from '../../../../hooks/usePolicy';
import {useUser} from "../../../../hooks/UserUser";
import Cookies from "js-cookie";
const EmployeeCreate = () => {
    const {handleRoles} = usePolicy();
    const {handleEmployee} = useUser();
  const token = localStorage.getItem("token");
    const [roles , setRoles] = useState([]);
    const [employees , setEmployees] = useState([]);

    const getEmployeeDatas = async() =>{
        const result = await handleEmployee(token);        
        if (result.success) {
            setEmployees(result.employees);
        }
    }
    
    const getRoleDatas = async() =>{
        const result = await handleRoles(token);
        if (result.success) {
            setRoles(result.roles);
        }
    }

      useEffect(() => {
        getEmployeeDatas();
        getRoleDatas();
      }, []);



    



  return (
    // <div>
      <EmployeeForm 
      roles = {roles}
      employees = {employees}
      
      />
    // </div>
  );
}

export default EmployeeCreate;