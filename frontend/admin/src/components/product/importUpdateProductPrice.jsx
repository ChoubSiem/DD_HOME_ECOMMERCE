import React, { useState } from 'react';
import { Modal, Button, Form, message,Upload,Card,Divider  } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const ImportProduct = ({ visible, onCancel, onImport }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info) => {
    const selectedFile = info.file; 
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(selectedFile);
        message.success(`${selectedFile.name} file selected`);
      } else {
        setFile(null);
        message.error('Please upload a valid Excel file (.xlsx or .xls)');
      }
    }
  };
  
  

  const handleFileUpload = () => {
    if (!file) {
      message.error('Please upload an Excel file.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
  
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
  
      const formattedData = data.map((item) => {
        const code = item['Product Code'] ? item['Product Code'].toString().toUpperCase() : '';
        const price = item['Price'] ?? null;
        const retail_price = item['Retail Price'] ?? null;
        const dealer_price = item['Dealer Price'] ?? null;
        const depot_price = item['Depot Price'] ?? null;
        const vip_price = item['VIP Price'] ?? null;
        return {
          code,
          price,
          retail_price,
          dealer_price,
          depot_price,
          vip_price
        };
      });
  
      onImport(formattedData);
    };
  
    reader.readAsBinaryString(file);
  };
  

  const handleSubmit = () => {
    setLoading(true);
    handleFileUpload();
    setLoading(false);
  };

  return (
    <Modal
        title="Update Product Price"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
    >
  <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <Form layout="vertical">
      <Form.Item label="Select Excel File">
        <Upload
          beforeUpload={() => false}
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          maxCount={1}
          style={{ width: '100%' }}
        >
          <Button block icon={<UploadOutlined />}>
            Click to Upload
          </Button>
        </Upload>
      </Form.Item>

      <Divider />

      <Form.Item>
        <Button
          block
          type="primary"
          icon={<UploadOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Import Product Price
        </Button>
      </Form.Item>
    </Form>
  </Card>
</Modal>
  );
};

export default ImportProduct;
