import { Button, message } from "antd";
import "./font.css";
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
          onClick={() => setSelectedProducts([])}
          disabled={selectedProducts.length === 0}
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          loading={loading}
          disabled={selectedProducts.length === 0}
        >
          Save Inventory
        </Button>
      </div>
    );
  };

export default ActionButtons;