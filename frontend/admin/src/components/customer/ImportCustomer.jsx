import React, { useState } from 'react';
import { Modal, Button, Form, message, Upload, Card, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const ImportCustomer = ({ visible, onCancel, onImport }) => {
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
      // console.log(sheet);
      
      const data = XLSX.utils.sheet_to_json(sheet);      
      const formattedData = data.map((item) => {
          return {
            name: item['Customer Name']?.trim(),  
            contact_name: item['Contact Name']?.trim(),
            phone: item['Phone']?.trim(),
            code: item['Code']?.trim(),
            address: item['Address']?.trim(),
            group: item['Group']?.trim()
          };
      });
      // console.log(formattedData);
      // console.log(formattedData);
      // return;
      onImport(formattedData);
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = () => {
    setLoading(true);
    handleFileUpload();
  };

  return (
    <Modal
      title="👤 Import Customers"
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
              Import Customers
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  );
};

export default ImportCustomer;
