import React from "react";
import { Modal, Form, Input, Button } from "antd";

const CategoryModal = ({ isModalVisible, setIsModalVisible, currentCategory, handleSave }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={currentCategory ? "Edit Category" : "Add Category"}
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
        initialValues={currentCategory}
      >
        <Form.Item
          label="Category Name"
          name="name"
          rules={[{ required: true, message: "Please input category name!" }]}
        >
          <Input size="large" placeholder="Category Name" style={{height:48}}/>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input category description!" }]}
        >
          <Input.TextArea size="large" rows={3} placeholder="Category Description" />
        </Form.Item>

        <Form.Item>
          <Button block size="large" type="primary" htmlType="submit" style={{height:48}} >
            {currentCategory ? "Update Category" : "Add Category"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
