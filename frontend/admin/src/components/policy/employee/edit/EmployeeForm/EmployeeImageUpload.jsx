import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const EmployeeImageUpload = ({ formData, loading, setFormData, employee }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (employee?.profile) {
      setImageLoading(true);
      const img = new Image();
      img.src = `http://127.0.0.1:8000/storage/employee_images/${employee.profile}`;
      img.onload = () => {
        setPreviewImage(img.src);
        setImageLoading(false);
      };
      img.onerror = () => {
        setPreviewImage(null);
        setImageLoading(false);
      };
    }
  }, [employee]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        message.error('Please select an image file (JPEG, PNG)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('Image size must be less than 2MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setPreviewImage(null);
  };

  return (
    <div className="image-section">
      <div className="image-upload">
        <div className="image-preview">
          {imageLoading ? (
            <div className="placeholder">
              <Spin size="large" />
            </div>
          ) : previewImage ? (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="preview-img" 
              onError={() => setPreviewImage(null)}
            />
          ) : (
            <div className="placeholder">
              <UserOutlined className="icon" />
            </div>
          )}
        </div>
        <label className="upload-label">
          <span className="upload-btn">
            {loading ? 'Uploading...' : 'Upload Photo'}
          </span>
          <input
            type="file"
            className="hidden-input"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </label>
        {previewImage && (
          <button 
            type="button" 
            className="remove-image-btn"
            onClick={removeImage}
            disabled={loading}
          >
            Remove Image
          </button>
        )}
        <small className="image-hint">JPG or PNG, max 2MB</small>
      </div>
    </div>
  );
};

export default EmployeeImageUpload;