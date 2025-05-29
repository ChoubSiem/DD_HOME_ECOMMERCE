export const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.role_id) {
      errors.role_id = 'Role is required';
    }
  
    return errors;
  };