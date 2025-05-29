import React, { useState } from 'react';
import { Select } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const EmployeeFormFields = ({ formData, errors, loading, roles, onChange, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRoleChange = (value) => {
    onChange(prev => ({ ...prev, role_id: value }));
    if (errors.role_id) setErrors(prev => ({ ...prev, role_id: undefined }));
  };

  return (
    <div className="form-grid">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            className={`form-input ${errors.username ? 'error' : ''}`}
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            disabled={loading}
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            className={`form-input ${errors.phone ? 'error' : ''}`}
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="1234567890"
            disabled={loading}
          />
          {errors.phone && <span className="error-msg">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </span>
          </div>
          {errors.password && <span className="error-msg">{errors.password}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <Select
            className={`select form-input ${errors.role_id ? 'error' : ''}`}
            id="role"
            value={formData.role_id || undefined}
            onChange={handleRoleChange}
            options={[
              { value: '', label: 'Select role', disabled: true },
              ...(roles?.map((role) => ({
                value: role.id,
                label: role.name
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '),
              }))) || [],
            ]}
            disabled={loading}
          />
          {errors.role_id && <span className="error-msg">{errors.role_id}</span>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormFields;