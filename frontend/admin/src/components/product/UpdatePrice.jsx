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
      setLoading(true);
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
  
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
  
      const formattedData = data.map((item, index) => {        
        const name = item['Product Name'];
        const code = item['Product Code'];
        const category_name = item['Category'] ?? null;
        const cost = item['Cost'] ;
        const price = item['Price'];
        const retail_price = item['Retail Price'] ;
        const dealer_price = item['Dealer Price'] ;
        const depot_price = item['Depot Price'];
        const vip_price = item['VIP Price'];
        const alert_qty = item['Alert Quantity'];
        const unit_name = item['Unit'] ;
        const barcode =  "";
  
        const isOnlyNameAndCode = !category_name && !cost && !price && !alert_qty && !unit_code;
        const is_draft = isOnlyNameAndCode;
  
        return {
          name,
          code,
          category_name,
          cost,
          price,
          alert_qty,
          unit_name,
          is_draft,
          barcode,
          retail_price,
          dealer_price,
          depot_price,
          vip_price
        };
      });    
      
      onImport(formattedData);
    };
    setLoading(false);
    reader.readAsBinaryString(file);
  };
  

  const handleSubmit = () => {
    setLoading(true);
    handleFileUpload();
    setLoading(false);
  };

  return (
    <Modal
        title="📦 Import Products"
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
          Import Products
        </Button>
      </Form.Item>
    </Form>
  </Card>
</Modal>
  );
};

export default ImportProduct;
