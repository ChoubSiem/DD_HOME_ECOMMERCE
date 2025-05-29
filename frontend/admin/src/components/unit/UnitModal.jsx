import React from "react";
import { Modal, Form, Input, Button } from "antd";

const UnitModal = ({ isModalVisible, setIsModalVisible, currentUnit, handleSave }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={currentUnit ? "Edit Unit" : "Add Unit"}
      open={isModalVisible}
      onCancel={() => {
        form.resetFields();
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
        initialValues={currentUnit}
      >
        <Form.Item
          label="Unit Name"
          name="name"
          rules={[{ required: true, message: "Please input unit name!" }]}
        >
          <Input 
            placeholder="Unit Name" 
            style={{ height: "45px", fontSize: "16px" }}
          />
        </Form.Item>

        <Form.Item
          label="Unit Code"
          name="code"
          rules={[{ required: true, message: "Please input unit code!" }]}
        >
          <Input 
            placeholder="Unit Code" 
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
            {currentUnit ? "Update Unit" : "Add Unit"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UnitModal;
