import React, { useState } from 'react';
import { Upload, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const ImageUploader = ({ imageList, setImageList }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList }) => {
    const updatedList = fileList.map(file => {
      if (file.originFileObj && !file.preview) {
        file.preview = URL.createObjectURL(file.originFileObj);
      }
      return file;
    });
    setImageList(updatedList);
  };

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={imageList}
        onChange={handleChange}
        onPreview={handlePreview}
        beforeUpload={() => false}
        multiple
        accept="image/*"
      >
        {imageList.length >= 8 ? null : uploadButton}
      </Upload>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImageUploader;