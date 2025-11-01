import { AutoComplete } from "antd";
import React from "react";

const ProductSearchBar = ({
  products,
  searchTerm,
  handleSearchChange,
  handleProductSelect,
}) => {
  return (
    <div className="search-bar">
      <AutoComplete
        className="search-product"
        options={products
          .filter(
            (product) =>
              product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.code?.toLowerCase().includes(searchTerm.toLowerCase())
          )

          .map((product) => ({
            value: product.name,
            label: `${product.name} (${product.code})`,
          }))}
        placeholder="Search for products..."
        value={searchTerm}
        onChange={handleSearchChange}
        onSelect={handleProductSelect}
        style={{ width: "100%", height: "40px", borderRadius: 0 }}
        dropdownStyle={{ borderRadius: 0 }}
        popupClassName="no-radius-dropdown"
      />
    </div>
  );
};

export default ProductSearchBar;
