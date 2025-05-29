import React from "react";
import { Modal, Form, Input, Button } from "antd";

const ProductGroupModal = ({ isModalVisible, setIsModalVisible, currentProductGroup, handleSave }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={currentProductGroup ? "Edit Product Group" : "Add Product Group"}
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
        initialValues={currentProductGroup}
      >
        <Form.Item
          label="Group Name"
          name="name"
          rules={[{ required: true, message: "Please input group name!" }]}
        >
          <Input 
            placeholder="Group Name" 
            style={{ height: "45px", fontSize: "16px" }}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input group description!" }]}
        >
          <Input 
            placeholder="Group Description" 
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
            {currentProductGroup ? "Update Product Group" : "Add Product Group"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductGroupModal;
