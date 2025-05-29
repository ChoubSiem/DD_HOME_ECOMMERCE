import React, { useState, useEffect } from "react";
import { Card,message,Form   } from "antd";
import dayjs from 'dayjs';
import { useProductTerm } from "../../../hooks/UserProductTerm";
import AdjustmentDetailsCard from "../../../components/adjustment/addAdjustment/AdjustmentDetailCard";
import ProductSearchBar from "../../../components/adjustment/addAdjustment/ProductSearchBar";
import ProductsTable from "../../../components/adjustment/addAdjustment/ProductTable";
import NoteSection from "../../../components/adjustment/addAdjustment/NoteSection";
import ActionButtons from "../../../components/adjustment/addAdjustment/ActionButton";
import "./AddAdjustment.css";
import Cookies from "js-cookie";
import { useStock } from "../../../hooks/UseStock";
import {useNavigate} from "react-router-dom"


const AddAdjustment = () => {
  const { handleProducts } = useProductTerm();
  const now = dayjs();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [reference, setReference] = useState('');
  const [adjuster, setAdjuster] = useState([]);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user"));
  
  const {handleCreateAdjustment} = useStock();
  useEffect(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
    setAdjuster(userData);
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token,userData.warehouse_id);
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

  const handleSearchChange = (value) => setSearchTerm(value);
  
  const handleProductSelect = (value) => {
    const selectedProduct = products.find((product) => product.name === value);

    if (!selectedProduct) {
      message.error("Product not found.");
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
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the list.`);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        const quantity = Number(value) || 0;
        const newQoh = item.adjustmentType === 'add'
          ? (Number(item.qoh) || 0) + quantity
          : (Number(item.qoh) || 0) - quantity;
        return {
          ...item,
          quantity,
          newQoh: Math.max(newQoh, 0) 
        };
      }
      return item;
    }));
  };

  const handleAdjustmentTypeChange = (key, value) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        const newQoh = value === 'add'
          ? (Number(item.qoh) || 0) + (Number(item.quantity) || 0)
          : (Number(item.qoh) || 0) - (Number(item.quantity) || 0);
        
        return {
          ...item,
          adjustmentType: value,
          newQoh: Math.max(newQoh) 
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
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        const newQoh = Number(value) || 0;
        const quantity = adjustmentType === 'add'
          ? newQoh - (Number(qoh) || 0)
          : (Number(qoh) || 0) - newQoh;
        
        return {
          ...item,
          newQoh,
          quantity: Math.max(quantity) 
        };
      }
      return item;
    }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);    
    const adjustmentData = {
      date: values.date || dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reference: reference,
      adjuster: adjuster.id,
      warehouse_id: userData.warehouse_id??null,
      note: note??null,
      items: selectedProducts.map(product => ({
        product_id: product.productId,
        quantity: product.quantity,
        adjustment_type: product.adjustmentType,
        unit: product.unit??null
      }))
    };
    console.log(adjustmentData);
    

    try {
      const result = await handleCreateAdjustment(adjustmentData, token);
      if (result.success) {
        message.success('Adjustment created successfully!');
        form.resetFields();
        console.log(adjustmentData);
        
        setSelectedProducts([]);
        localStorage.removeItem("selectedProducts");
        navigate("/adjustment");
      } else {
        message.error(result.error || 'Failed to create adjustment');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-purchase-container">
      
      <Card style={{border:'none',borderBottom:'1px solid #52c41a',borderRadius:0,marginBottom:'50px'}}>
        <div className="header">
          <h2 style={{ color: "#52c41a" }}>Add Adjustment</h2>
          <p>Select products and manage their quantities</p>
        </div>
      </Card>

      <AdjustmentDetailsCard 
        reference={reference} 
        setReference={setReference}
        adjuster={adjuster}
      />

      <ProductSearchBar
        products={products}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleProductSelect={handleProductSelect}
      />

      <ProductsTable
        selectedProducts={selectedProducts}
        units={units}
        handleQuantityChange={handleQuantityChange}
        handleAdjustmentTypeChange={handleAdjustmentTypeChange}
        handleUnitChange={handleUnitChange}
        handleRemoveProduct={handleRemoveProduct}
        handleNewQohChange={(key, value, qoh, adjustmentType) => 
          handleNewQohChange(key, value, qoh, adjustmentType)
        }

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