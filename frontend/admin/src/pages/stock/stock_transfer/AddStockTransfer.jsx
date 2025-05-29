import React, { useState, useEffect } from "react";
import { Card, message, Form } from "antd";
import dayjs from 'dayjs';
import { useProductTerm } from "../../../hooks/UserProductTerm";
import AdjustmentDetailsCard from "../../../components/stock_transfer/addStock/AdjustmentDetailCard";
import ProductSearchBar from "../../../components/stock_transfer/addStock/ProductSearchBar";
import ProductsTable from "../../../components/stock_transfer/addStock/ProductTable";
import NoteSection from "../../../components/stock_transfer/addStock/NoteSection";
import ActionButtons from "../../../components/stock_transfer/addStock/ActionButton";
import { useCompany } from "../../../hooks/UseCompnay";
import Cookies from "js-cookie";
import { useStock } from "../../../hooks/UseStock";
import { useNavigate } from "react-router-dom";

const AddAdjustment = () => {
  const { handleProducts } = useProductTerm();
  const now = dayjs();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [note, setNote] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [reference, setReference] = useState('');
  const [adjuster, setAdjuster] = useState([]);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user"));
  const { handleWarehouse } = useCompany();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const { handleCreateStockTransfer } = useStock();
  const [fromWarehouseId, setFromWarehouseId] = useState(null);
  const [toWarehouseId, setToWarehouseId] = useState(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
    setAdjuster(userData);
    handleWarehouseData();
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token);
      if (result) {
        setProducts(result.products);
      } else {
        message.error("Failed to load product: No data received");
      }
    } catch (error) {
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseData = async () => {
    let result = await handleWarehouse(token);
    if (result.success) {
      setWarehouses(result.warehouses);
    }
  }

  const handleSearchChange = (value) => setSearchTerm(value);
  
  const handleProductSelect = (value) => {
    const selectedProduct = products.find((product) => product.name === value);

    if (!selectedProduct) {
      message.error("Product not found.");
      return;
    }

    console.log(selectedProduct);

    if (Number(selectedProduct.stock) <= 0) {
      message.error(`${selectedProduct.name} is out of stock and cannot be added!`);
      return;
    }

    const isAlreadyAdded = selectedProducts.some(
      (p) => p.productId === selectedProduct.id
    );

    if (isAlreadyAdded) {
      message.warning(`${selectedProduct.name} is already added.`);
      return;
    }

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      qoh: selectedProduct.stock,
      quantity: 1,
      adjustmentType: "subtract",
      unit: selectedProduct.unit_code,
      newQoh: Number(selectedProduct.stock) - 1 // Initial new QOH
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the list.`);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    const numericValue = Number(value);
    
    // Validate if value is a positive number
    if (isNaN(numericValue)) {
      message.error('Quantity must be a valid number');
      return;
    }

    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        if (numericValue <= 0) {
          message.error('Quantity must be greater than 0!');
          return item;
        }

        if (item.adjustmentType === 'subtract') {
          if (numericValue > (Number(item.qoh) || 0)) {
            message.error('Cannot subtract more than available quantity!');
            return item;
          }
          if ((Number(item.qoh) || 0) <= 0) {
            message.error('Cannot subtract - product is out of stock!');
            return item;
          }
        }

        const newQoh = item.adjustmentType === 'add'
          ? (Number(item.qoh) || 0) + numericValue
          : (Number(item.qoh) || 0) - numericValue;

        return {
          ...item,
          quantity: numericValue,
          newQoh: Math.max(newQoh, 0)
        };
      }
      return item;
    }));
  };

  const handleAdjustmentTypeChange = (key, value) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        if (value === 'subtract' && (Number(item.qoh) || 0) <= 0) {
          message.error('Cannot subtract - product is out of stock!');
          return item;
        }

        const newQoh = value === 'add'
          ? (Number(item.qoh) || 0) + (Number(item.quantity) || 0)
          : (Number(item.qoh) || 0) - (Number(item.quantity) || 0);
        
        return {
          ...item,
          adjustmentType: value,
          newQoh: Math.max(newQoh, 0)
        };
      }
      return item;
    }));
  };

  const handleUnitChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { ...product, unit: value } : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (key) => {
    const updatedProducts = selectedProducts.filter((p) => p.key !== key);
    setSelectedProducts(updatedProducts);
  };

  const handleNewQohChange = (key, value, qoh, adjustmentType) => {
    const numericValue = Number(value);
    
    if (isNaN(numericValue)) {
      message.error('New quantity must be a valid number');
      return;
    }

    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        if (numericValue < 0) {
          message.error('New quantity cannot be negative!');
          return item;
        }

        const quantity = adjustmentType === 'add'
          ? numericValue - (Number(qoh) || 0)
          : (Number(qoh) || 0) - numericValue;

        if (quantity <= 0) {
          message.error('Resulting adjustment quantity must be greater than 0!');
          return item;
        }

        return {
          ...item,
          newQoh: numericValue,
          quantity: Math.max(quantity, 0)
        };
      }
      return item;
    }));
  };
  const onWarehouseChange = ({ from_warehouse_id, to_warehouse_id }) => {
    setFromWarehouseId(from_warehouse_id);
    setToWarehouseId(to_warehouse_id);
  };
  

  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error('Please add at least one product before submitting');
      return;
    }    
    setLoading(true);    
    const adjustmentData = {
      date: values.date || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      reference_no: reference,
      transfer_user: adjuster.id,
      warehouse_id: values.warehouse_id ?? null, 
      from_warehouse_id: fromWarehouseId == 'company'? null:fromWarehouseId,
      to_warehouse_id: toWarehouseId ?? null,
      note: note ?? null,
      items: selectedProducts.map(product => ({
        product_id: product.productId,
        quantity: product.quantity,
        unit: product.unit ?? null
      }))
    };
    

    try {
      const result = await handleCreateStockTransfer(adjustmentData, token);
      console.log(result);
      
      if (result.success) {
        message.success('Adjustment created successfully!');
        form.resetFields();
        setSelectedProducts([]);
        localStorage.removeItem("selectedProducts");
        navigate("/transfer/stock");
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.log(error);
      
      message.error(error.response.data.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-purchase-container">
      <Card style={{ border: 'none', borderBottom: '1px solid #52c41a', borderRadius: 0, marginBottom: '50px' }}>
        <div className="header">
          <h2 style={{ color: "#52c41a" }}>Add Stock Transfer</h2>
          <p>Select products and manage their quantities</p>
        </div>
      </Card>

      <AdjustmentDetailsCard 
        reference={reference} 
        warehouses={warehouses}
        setReference={setReference}
        adjuster={adjuster}
        setFilteredProducts={setFilteredProducts}
        onFromWarehouseChange={setFromWarehouseId}
        onToWarehouseChange={setToWarehouseId}
      />

        <ProductSearchBar
        products={products}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleProductSelect={handleProductSelect}
        onWarehouseChange={onWarehouseChange}
      />


      <ProductsTable
        selectedProducts={selectedProducts}
        units={units}
        handleQuantityChange={handleQuantityChange}
        handleAdjustmentTypeChange={handleAdjustmentTypeChange}
        handleUnitChange={handleUnitChange}
        handleRemoveProduct={handleRemoveProduct}
        handleNewQohChange={handleNewQohChange}
      />

      <NoteSection note={note} setNote={setNote} />

      <ActionButtons 
        setSelectedProducts={setSelectedProducts}
        handleSubmit={handleSubmit}
        loading={loading}
        selectedProducts={selectedProducts}
      />
    </div>
  );
};

export default AddAdjustment;