import React from "react";
import { Modal, Form, Input, Button } from "antd";

const RoleModal = ({ isModalVisible, setIsModalVisible, currentRole, handleSave }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={currentRole ? "Edit Role" : "Add Role"}
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
        initialValues={currentRole}
      >
        <Form.Item
          label=" Role Name"
          name="name"
          rules={[{ required: true, message: "Please input  Role name!" }]}
        >
          <Input 
            placeholder=" Role Name" 
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
            {currentRole ? "Update  Role" : "Add  Role"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
