import React from "react";
import { Modal, Form, Input, Button } from "antd";

const BrandModal = ({ isModalVisible, setIsModalVisible, currentBrand, handleSave }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={currentBrand ? "Edit Brand" : "Add Brand"}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        autoComplete="off"
        initialValues={currentBrand}
      >
        <Form.Item
          label="Brand Name"
          name="name"
          rules={[{ required: true, message: "Please input brand name!" }]}
        >
          <Input 
            placeholder="Brand Name" 
            style={{ height: "45px", fontSize: "16px" }}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input brand description!" }]}
        >
          <Input 
            placeholder="Brand Description" 
            style={{ height: "45px", fontSize: "16px" }}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            style={{ height: "45px", fontSize: "16px" }}
          >
            {currentBrand ? "Update Brand" : "Add Brand"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BrandModal;
