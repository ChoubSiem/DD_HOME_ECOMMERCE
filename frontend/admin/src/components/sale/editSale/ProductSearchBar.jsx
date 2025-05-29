import { AutoComplete } from "antd";
import React from "react";

const ProductSearchBar = ({ 
  products, 
  searchTerm, 
  handleSearchChange, 
  handleProductSelect,
  customer,  
}) => {
  if (!customer) {
    return (
      <div className="search-bar">
        <div style={{ padding: '10px', color: 'red' }}>
          Please select a customer first.
        </div>
      </div>
    );
  }
  const getPriceByCustomerGroup = (product, customer) => {
    const groupName = customer?.customer_group?.name?.toLowerCase();

    switch (groupName) {
      case 'vip':
        return product.vip_price ?? product.price;
      case 'wholesale':
        return product.wholesale_price ?? product.price;
      case 'dealer':
        return product.dealer_price ?? product.price;
      case 'retail':
      default:
        return product.retail_price ?? product.price;
    }
  };

  return (
    <div className="search-bar">
      <AutoComplete
        className="search-product"
        options={products
          .filter((product) => {
            const searchTermLower = searchTerm.toLowerCase();
            const productName = product.name?.toLowerCase() || '';
            const productCode = String(product.code || '');

            return (
              productName.includes(searchTermLower) ||
              productCode.includes(searchTerm)
            );
          })
          .map((product) => ({
            label: (
              <div>
                <strong>{product.name}</strong> ({product.code}){" "}
                <span style={{ color: 'green', marginLeft: 8 }}>
                  Stock: {product.stock}
                </span>
                <span style={{ color: 'blue', marginLeft: 12 }}>
                  Price: {getPriceByCustomerGroup(product, customer)}
                </span>
              </div>
            ),
            value: String(product.name),
          }))}
        placeholder="Search for products..."
        value={searchTerm}
        onChange={handleSearchChange}
        onSelect={handleProductSelect}
        style={{ width: "100%", height: '40px', borderRadius: 0 }}
        dropdownStyle={{ borderRadius: 0 }}
        popupClassName="no-radius-dropdown"
      />
    </div>
  );
};

export default ProductSearchBar;
