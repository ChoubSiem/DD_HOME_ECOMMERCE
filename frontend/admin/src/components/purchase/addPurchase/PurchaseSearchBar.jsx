import { AutoComplete } from "antd";
import React from "react";

const PurchaseSearchBar = ({ 
  products, 
  searchTerm, 
  handleSearchChange, 
  handleProductSelect 
}) => {
  return (
    <div className="search-bar">
      <AutoComplete
        className="search-product"
        options={products
          .filter((product) => {
            const term = searchTerm.toLowerCase();
            return (
              product.name?.toLowerCase().includes(term) ||
              product.code?.toLowerCase().includes(term)
            );
          })
          .map((product) => ({
            value: product.name,
            label: `${product.name} (${product.code})`, 
          }))}
        placeholder="Search for products (name or code)..."
        value={searchTerm}
        onChange={handleSearchChange}
        onSelect={handleProductSelect}
        style={{ width: "100%", height: '40px', borderRadius: 0 }}
        dropdownStyle={{ borderRadius: 0 }}
      />
    </div>
  );
};

export default PurchaseSearchBar;