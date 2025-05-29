import { Button } from "antd";
import React from "react";

const ActionButtons = ({ 
  setSelectedProducts, 
  onSubmit,
  loading,
  selectedProducts 
}) => {
  return (
    <div className="actions" style={{ marginTop: "20px" }}>
      <Button
        type="primary"
        onClick={onSubmit}
        style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        loading={loading}
        disabled={(selectedProducts || []).length === 0}
      >
        Save Inventory
      </Button>
      <Button 
        onClick={() => setSelectedProducts([])}
        disabled={(selectedProducts || []).length === 0}
      >
        Reset
      </Button>
    </div>
  );
};

export default ActionButtons;
