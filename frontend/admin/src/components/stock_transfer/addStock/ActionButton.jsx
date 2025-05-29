import { Button, message } from "antd";
import React  from "react";

const ActionButtons = ({ 
    setSelectedProducts, 
    handleSubmit,
    loading,
    selectedProducts 
  }) => {
    return (
      <div className="actions" style={{ marginTop: "20px" }}>
        <Button
          type="primary"
          onClick={handleSubmit}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          loading={loading}
          disabled={!Array.isArray(selectedProducts) || selectedProducts.length === 0}        >
          Save Inventory
        </Button>
        <Button 
          onClick={() => setSelectedProducts([])}
          disabled={!Array.isArray(selectedProducts) || selectedProducts.length === 0}        >
          Reset
        </Button>
      </div>
    );
  };

export default ActionButtons;