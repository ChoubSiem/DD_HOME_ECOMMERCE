import React from "react";
import { Modal, List, Typography } from "antd";

const AdjustmentModal = ({
  isModalVisible,
  currentProduct,
  setIsModalVisible,
}) => {
  // Data for the product details
  const data = [
    {
      label: "Product Name",
      value: currentProduct?.name || "N/A",
    },
    {
      label: "Category",
      value: currentProduct?.category || "N/A",
    },
    {
      label: "Barcode",
      value: currentProduct?.barcode || "N/A",
    },
    {
      label: "Old QOH",
      value: currentProduct?.oldQOH || "N/A",
    },
    {
      label: "New QOH",
      value: currentProduct?.newQOH || "N/A",
    },
    {
      label: "Quantity",
      value: currentProduct?.quantity || "N/A",
    },
  ];

  return (
    <Modal
      title="Product Adjustment Details"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={800}
    >
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text strong>{item.label}:</Typography.Text> {item.value}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default AdjustmentModal;
