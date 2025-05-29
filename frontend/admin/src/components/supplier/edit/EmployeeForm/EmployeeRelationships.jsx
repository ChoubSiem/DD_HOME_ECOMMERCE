import React from 'react';
import { Select } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';

const EmployeeRelationships = ({ employees, employee, formData, loading, setFormData }) => {
  const supervisorIcon = <UserOutlined />;
  const teamIcon = <TeamOutlined />;

  // const availableParents = employees.filter(
  //   e => e.id !== employee?.id && !formData.parentIds.includes(e.id)
  // );
  
  // const availableChildren = employees.filter(
  //   e => e.id !== employee?.id && !formData.childrenIds.includes(e.id)
  // );

  const handleParentChange = (selectedItems) => {
    setFormData(prev => ({ ...prev, parentIds: selectedItems }));
  };

  const handleChildrenChange = (selectedItems) => {
    setFormData(prev => ({ ...prev, childrenIds: selectedItems }));
  };

  return (
    <div className="form-row relationship-group">
      <div className="form-group">
        <label>Reports To</label>
        <Select
          mode="multiple"
          placeholder="Select supervisor(s)"
          suffixIcon={supervisorIcon}
          value={formData.parentIds}
          onChange={handleParentChange}
          options={availableParents.map((emp) => ({
            value: emp.id,
            label: `${emp.username} (${emp.role?.name || emp.role_name})`,
          }))}
          className="antd-select-custom select"
          disabled={loading}
          optionFilterProp="label"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
        <small className="hint">Select who this employee reports to</small>
      </div>
      <div className="form-group">
        <label>Team Members</label>
        <Select
          mode="multiple"
          placeholder="Select team member(s)"
          suffixIcon={teamIcon}
          value={formData.childrenIds}
          onChange={handleChildrenChange}
          options={availableChildren.map((emp) => ({
            value: emp.id,
            label: `${emp.username} (${emp.role?.name || emp.role_name})`,
          }))}
          className="antd-select-custom select"
          disabled={loading}
          optionFilterProp="label"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
        <small className="hint">Hold CTRL/CMD to select multiple</small>
      </div>
    </div>
  );
};

export default EmployeeRelationships;