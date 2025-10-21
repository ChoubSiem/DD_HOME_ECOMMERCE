import { Button, message, Popconfirm } from "antd";
import React  from "react";

const ActionButtons = ({ 
    setSelectedProducts, 
    handleSubmit,
    loading,
    selectedProducts 
  }) => {
  const handleReset = () => {
    setSelectedProducts([]);
    message.success("Selection has been reset.");
  };
    return (
      <div className="actions" style={{ marginTop: "20px" }}>
        <Popconfirm
          title="Are you sure you want to reset the selected products?"
          onConfirm={handleReset}
          okText="Yes"
          cancelText="No"
          disabled={selectedProducts.length === 0}
        >
          <Button
            size="large"
            disabled={selectedProducts.length === 0}
          >
            Reset
          </Button>
        </Popconfirm>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a",marginLeft: "20px"  }}
          loading={loading}
          disabled={selectedProducts.length === 0}
        >
          Save Inventory
        </Button>
      </div>
    );
  };

export default ActionButtons;