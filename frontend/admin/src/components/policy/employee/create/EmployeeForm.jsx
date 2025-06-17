import React, { useState,useEffect  } from 'react';
import { Select } from 'antd';
import { UserOutlined, TeamOutlined,EyeOutlined,EyeInvisibleOutlined,ShopOutlined   } from '@ant-design/icons';
import './EmployeeForm.css';
import { useUser } from '../../../../hooks/UserUser';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../../../hooks/UseCompnay';

const EmployeeForm = ({roles , employees}) => {
    const [showPassword, setShowPassword] = useState(false);
    const {handleEmployeeCreate} = useUser();
    const {handleWarehouse} = useCompany();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [warehouses, setWarehouses] = useState([]);
    useEffect(() => {
      const fetchWarehouses = async () => {
          try {
              const result = await handleWarehouse(token);
              if (result.success) {
                  setWarehouses(result.warehouses);
              }
          } catch (error) {
              console.error("Failed to fetch warehouses:", error);
          }
      };
      fetchWarehouses();
  }, [token]);
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: '',
        warehouse_id:'',
        role_id: '',
        profileImage: null,
        parentIds: [],
        childrenIds: []
    });  

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const supervisorIcon = <UserOutlined />;
  const teamIcon = <TeamOutlined />;

  const availableParents = employees
    .filter(e => !formData.parentIds.includes(e.id));

  const availableChildren = employees
    .filter(e => !formData.childrenIds.includes(e.id));

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.phone || !/^\d{9,10}$/.test(formData.phone))
      newErrors.phone = 'Valid 9-digit phone number is required';
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.role) newErrors.role = 'Role is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParentChange = (selectedItems) => {
    setFormData({ ...formData, parentIds: selectedItems });
  };

  const handleChildrenChange = (selectedItems) => {
    setFormData({ ...formData, childrenIds: selectedItems });
  };
  const warehouseIcon = <ShopOutlined />;

  const handleSubmit = async(e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log('Form submitted:', formData);
    let result = await handleEmployeeCreate(formData , token);
    if (result.success) {
        navigate("/employee");
    }
  };

  return (
    <div className="container-form">
      <div className="form-card card-form">
        <div className="header">
          <h2 style={{color:"#52c41a"}}>Create Employee</h2>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-layout">
            <div className="form-content">
              <div className="form-grid">
                {/* Row 1 */}
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
                      placeholder="012345678"
                    />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-wrapper" style={{ position: 'relative' }}>
                        <input
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        />
                        <span 
                        className="password-toggle-icon"
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer'
                        }}
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
                      className={`form-select ${errors.role ? 'select-error' : ''}`}
                      id="role"
                      name="role_id"
                      value={formData.role}
                      onChange={(value) => handleChange({ target: { name: 'role', value } })}
                      options={[
                        { value: '', label: 'Select role', disabled: true },
                        ...roles.map(role => ({
                          value: role.id,
                          label: role.name.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')
                        }))
                      ]}
                      style={{
                        width: '100%',
                        height: '42px'
                      }}
                      popupClassName="select-dropdown"
                    />
                    {errors.role && <span className="error-msg">{errors.role}</span>}
                    </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="warehouse">Warehouse</label>
                    <Select
                      className={`form-select ${errors.warehouse ? 'select-error' : ''}`}
                      id="warehouse"
                      name="warehouse_id"
                      value={formData.warehouse_id}
                      onChange={(value) => handleChange({ target: { name: 'warehouse_id', value } })}
                      options={[
                        { value: '', label: 'Select warehouse', disabled: true },
                        { 
                          value: 'company', 
                          label: 'Company',
                          style: { fontWeight: 'bold', color: '#1890ff' }
                        },
                        ...warehouses.map(warehouse => ({
                          value: warehouse.id,
                          label: `${warehouse.warehouse_name}`
                        }))
                      ]}
                      suffixIcon={warehouseIcon}
                      style={{
                        width: '100%',
                        height: '42px'
                      }}
                      popupClassName="select-dropdown"
                    />
                    {errors.warehouse && <span className="error-msg">{errors.warehouse}</span>}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="form-row relationship-group">
                    <div className="form-group">
                        <label>Reports To</label>
                        <Select
                        mode="multiple"
                        placeholder="Select supervisor(s)"
                        suffixIcon={supervisorIcon}
                        value={formData.parentIds}
                        onChange={handleParentChange}
                        options={availableParents.map(emp => ({
                            value: emp.id,
                            label: `${emp.username} (${emp.role_name})`
                        }))}
                        className="antd-select-custom select"
                        tagRender={(props) => {
                            const employee = getEmployeeById(props.value);
                            return (
                            <span className="ant-select-selection-item">
                                <span className="ant-select-selection-item-content">
                                {employee ? `${employee.username} (${employee.role_name})` : props.value}
                                </span>
                                <span 
                                className="ant-select-selection-item-remove"
                                onClick={props.onClose}
                                >
                                ×
                                </span>
                            </span>
                            );
                        }}
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
                        options={availableChildren.map(emp => ({
                            value: emp.id,
                            label: `${emp.username} (${emp.role_name})`
                        }))}
                        className="antd-select-custom select"
                        tagRender={(props) => {
                            const employee = getEmployeeById(props.value);
                            return (
                            <span className="ant-select-selection-item">
                                <span className="ant-select-selection-item-content">
                                {employee ? `${employee.username} (${employee.role_name})` : props.value}
                                {/* {employee} */}
                                </span>
                                <span 
                                className="ant-select-selection-item-remove"
                                onClick={props.onClose}
                                >
                                ×
                                </span>
                            </span>
                            );
                        }}
                        />
                        <small className="hint">Hold CTRL/CMD to select multiple</small>
                    </div>
                    </div>
              </div>

              <div className="form-footer">
                <button className="submit-btn-employee" type="submit">
                  Add Employee
                </button>
              </div>
            </div>

            {/* Profile Image Section */}
            <div className="image-section">
              <div className="image-upload">
                <div className="image-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="preview-img" />
                  ) : (
                    <div className="placeholder">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="upload-label">
                  <span className="upload-btn">Upload Photo</span>
                  <input
                    type="file"
                    className="hidden-input"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;