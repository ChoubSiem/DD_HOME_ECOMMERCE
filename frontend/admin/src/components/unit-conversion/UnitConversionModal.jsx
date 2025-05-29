import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Select, Divider } from "antd";

const { Option } = Select;

const UnitConversionModal = ({
  isModalVisible,
  setIsModalVisible,
  currentConversion,
  handleSave,
  availableUnits = []
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentConversion) {
      form.setFieldsValue({
        ...currentConversion,
        from_unit: currentConversion.from_unit?.name,
        to_unit: currentConversion.to_unit?.name,
      });
    } else {
      form.resetFields();
    }
  }, [currentConversion, form]);

  const onFinish = (values) => {
    const fromUnitObj = availableUnits.find(unit => unit.name === values.from_unit);
    const toUnitObj = availableUnits.find(unit => unit.name === values.to_unit);

    const payload = {
      ...values,
      from_unit: fromUnitObj?.id || null,
      to_unit: toUnitObj?.id || null,
    };

    handleSave(payload);
  };

  return (
    <Modal
      title={currentConversion ? "Edit Conversion" : "Add Conversion"}
      open={isModalVisible}
      onCancel={() => {
        form.resetFields();
        setIsModalVisible(false);
      }}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            label="From Unit"
            name="from_unit"
            rules={[{ required: true, message: "Please select from unit!" }]}
            style={{ flex: 1 }}
          >
            <Select
              showSearch
              placeholder="Select source unit"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              style={{ height: "45px", fontSize: "16px" }}
            >
              {availableUnits.map(unit => (
                <Option key={unit.id} value={unit.name}>
                  {unit.name} ({unit.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Operator"
            name="operator"
            style={{ width: '120px' }}
            initialValue="="
          >
            <Select style={{ height: "45px", fontSize: "16px" }}>
              <Option value="=">= (Equals)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="To Unit"
            name="to_unit"
            rules={[{ required: true, message: "Please select to unit!" }]}
            style={{ flex: 1 }}
          >
            <Select
              showSearch
              placeholder="Select target unit"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              style={{ height: "45px", fontSize: "16px" }}
            >
              {availableUnits.map(unit => (
                <Option key={unit.id} value={unit.name}>
                  {unit.name} ({unit.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Conversion Ratio"
          name="conversion_rate"
          rules={[
            { required: true, message: "Please input conversion ratio!" },
            {
              pattern: /^[0-9]*\.?[0-9]+$/,
              message: "Please enter a valid positive number"
            },
            {
              validator: (_, value) =>
                value > 0 ? Promise.resolve() : Promise.reject('Ratio must be greater than 0')
            }
          ]}
          extra="Example: Enter '10' for '10 from units = 1 to unit'"
        >
          <Input
            type="number"
            placeholder="Enter conversion ratio"
            style={{ height: "45px", fontSize: "16px" }}
            step="any"
            min="0.0001"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter any description for this adjustment..."
            style={{ borderRadius: "6px" }}
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ height: "45px", fontSize: "16px" }}
          >
            {currentConversion ? "Update Conversion Rule" : "Create Conversion Rule"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UnitConversionModal;
