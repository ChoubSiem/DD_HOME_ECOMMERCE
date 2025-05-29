import { useState, useCallback } from 'react';
import { message } from 'antd';

export const useProductForm = (id, isEdit) => {
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [productData, setProductData] = useState(null);
  const token = localStorage.getItem("token");

  const generateRandomCode = useCallback((form) => {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ code: result });
  }, []);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  return {
    loading,
    setLoading,
    imageList,
    setImageList,
    productData,
    setProductData,
    generateRandomCode,
    beforeUpload,
    token
  };
};