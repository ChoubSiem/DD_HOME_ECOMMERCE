import React, { useState , useEffect } from 'react';
import EmployeeForm from './EmployeeForm/EmployeeForm';
import { usePolicy } from '../../../../hooks/usePolicy';
import {useUser} from "../../../../hooks/UserUser";
import Cookies from "js-cookie";
import { useParams } from 'react-router-dom';
const EmployeeEdit = () => {
    const {id} = useParams();
    const {handleRoles} = usePolicy();
    const {handleEmployee,handleEmployeeEdit} = useUser();
  const token = localStorage.getItem("token");
    const [roles , setRoles] = useState([]);
    const [employees , setEmployees] = useState([]);
    const [employee , setEmployee] = useState([]);

    const getEmployeeDatas = async() =>{
        const result = await handleEmployee(token);        
        if (result.success) {
            setEmployees(result.employees);
        }
    }
    // console.log(id);
    
    
    const getRoleDatas = async() =>{
        const result = await handleRoles(token);
        if (result.success) {
            setRoles(result.roles);
        }
    }

    const getEmployee = async() =>{        
        let result = await handleEmployeeEdit(id , token);        
        if(result.success){
            setEmployee(result.employee);
        }
    }

      useEffect(() => {
        getEmployeeDatas();
        getRoleDatas();
        getEmployee();
      }, []);



    



      console.log(employee);
      
  return (
    <div>
      <EmployeeForm 
      roles = {roles}
      employees = {employees}
      employee = {employee}
      
      />
    </div>
  );
}

export default EmployeeEdit;