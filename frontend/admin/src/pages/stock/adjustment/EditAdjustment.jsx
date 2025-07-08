import React, { useState, useEffect } from "react";
import { Card, message, Form } from "antd";
import dayjs from 'dayjs';
import { useProductTerm } from "../../../hooks/UserProductTerm";
import AdjustmentDetailsCard from "../../../components/adjustment/addAdjustment/AdjustmentDetailCard";
import ProductSearchBar from "../../../components/adjustment/addAdjustment/ProductSearchBar";
import ProductsTable from "../../../components/adjustment/editAdjustment/ProductTable";
import NoteSection from "../../../components/adjustment/addAdjustment/NoteSection";
import ActionButtons from "../../../components/adjustment/addAdjustment/ActionButton";
import "./AddAdjustment.css";
import Cookies from "js-cookie";
import { useStock } from "../../../hooks/UseStock";
import { useNavigate, useParams } from "react-router-dom";

const EditAdjustment = () => {
  const { handleProducts } = useProductTerm();
  const { handleUpdateAdjustment, handleShowAdjustment } = useStock();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [reference, setReference] = useState('');
  const [adjuster, setAdjuster] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user") || "{}");

  useEffect(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
    fetchAdjustmentData();
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const fetchAdjustmentData = async () => {
    setLoading(true);
    try {
      const adjustment = await handleShowAdjustment(id, token);
      if (adjustment.success) {
        setInitialData(adjustment.adjustment.items);
        setReference(adjustment.reference);
        setNote(adjustment.adjustment.note);
        setAdjuster(adjustment.adjuster || userData);
        const convertedProducts = ((adjustment?.adjustment?.items) || []).map((item, index) => ({
          key: `${Date.now()}-${index}`,
          id:item.id || null,
          productId: item?.product_id || '',
          productName: item?.product_name || 'Unknown Product',
          qoh: item?.current_stock || item?.product?.stock || 0,
          quantity: item?.product_qty || 0,
          adjustmentType: item?.adjustment_type || 'subtract',
          unit: item?.unit || item?.product?.unit_code || '',
          newQoh: item?.adjustment_type === 'add'
            ? (item?.current_stock || 0) + (item?.product_qty || 0)
            : (item?.current_stock || 0) - (item?.product_qty || 0)
        }));

        const savedProducts = JSON.parse(localStorage.getItem("selectedProducts") || "[]");
        const mergedProducts = [
          ...convertedProducts, 
          ...savedProducts.filter(
            (savedProduct) =>
              !convertedProducts.some((apiProduct) => apiProduct.productId === savedProduct.productId)
          ),
        ];

        setSelectedProducts(mergedProducts);
        localStorage.setItem("selectedProducts", JSON.stringify(mergedProducts)); 
      }
    } catch (error) {
      console.error("Error loading adjustment:", error);
      message.error("Failed to load adjustment data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token);
      if (result) {
        setProducts(result.products || []);
      } else {
        message.error("Failed to load products: No data received");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      message.error("Failed to load products");
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
      qoh: selectedProduct.stock || 0,
      quantity: 1,
      adjustmentType: "subtract",
      unit: selectedProduct.unit_code || '',
      newQoh: (selectedProduct.stock || 0) - 1
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the list.`);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    setSelectedProducts((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const quantity = Number(value) || 0;
          const newQoh =
            item.adjustmentType === "add"
              ? (Number(item.qoh) || 0) + quantity
              : (Number(item.qoh) || 0) - quantity;
          return {
            ...item,
            quantity,
            newQoh: Math.max(newQoh, 0),
          };
        }
        return item;
      })
    );
  };

  const handleAdjustmentTypeChange = (key, value) => {
    setSelectedProducts((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const newQoh =
            value === "add"
              ? (Number(item.qoh) || 0) + (Number(item.quantity) || 0)
              : (Number(item.qoh) || 0) - (Number(item.quantity) || 0);

          return {
            ...item,
            adjustmentType: value,
            newQoh: Math.max(newQoh, 0),
          };
        }
        return item;
      })
    );
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
    setSelectedProducts((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const newQoh = Number(value) || 0;
          const quantity =
            adjustmentType === "add"
              ? newQoh - (Number(qoh) || 0)
              : (Number(qoh) || 0) - newQoh;

          return {
            ...item,
            newQoh,
            quantity: Math.max(quantity, 0),
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      message.warning("Please add at least one product");
      return;
    }
  
    setLoading(true);
    const adjustmentData = {
      date: initialData?.date || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      reference: reference !== null && reference !== undefined ? String(reference) : null,
      adjuster: adjuster?.id || userData?.id || null,
      warehouse_id: initialData?.warehouse_id || null,
      note: note || null,
      items: selectedProducts.map((product) => ({
        id: product.id || null,
        product_id: product.productId,
        quantity: Number(product.quantity) || 0,
        adjustment_type: product.adjustmentType || 'subtract',
        unit: product.unit || null
      })),
    };  
    try {
      const result = await handleUpdateAdjustment(id,adjustmentData, token);
      if (result?.success) {
        message.success("Adjustment updated successfully!");
        localStorage.removeItem("selectedProducts");
        navigate("/adjustment");
      } else {
        message.error(result?.error || "Failed to update adjustment");
      }
    } catch (error) {
      console.error("Error updating adjustment:", error);
      message.error("An error occurred while updating the adjustment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("selectedProducts"); 
    navigate("/adjustment");
  };
  return (
    <div className="add-purchase-container">
      <Card
        style={{
          border: "none",
          borderBottom: "1px solid #52c41a",
          borderRadius: 0,
          marginBottom: "50px",
        }}
      >
        <div className="header">
          <h2 style={{ color: "#52c41a" }}>Edit Adjustment</h2>
            <p>Modify products and their quantities</p>
          </div>
        </Card>

        <AdjustmentDetailsCard
          reference={reference}
          setReference={setReference}
          adjuster={adjuster}
          form={form}
          date={initialData?.date}
          isEditMode={true}
        />

        <ProductSearchBar
          products={products}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          handleProductSelect={handleProductSelect}
          loading={loading}
          isEditMode={true}
        />

        <ProductsTable
          selectedProducts={selectedProducts}
          handleQuantityChange={handleQuantityChange}
          handleAdjustmentTypeChange={handleAdjustmentTypeChange}
          handleUnitChange={handleUnitChange}
          handleRemoveProduct={handleRemoveProduct}
          handleNewQohChange={handleNewQohChange}
          isEditMode={true}
        />

        <NoteSection note={note} setNote={setNote} />

        <ActionButtons
          setSelectedProducts={setSelectedProducts}
          handleSubmit={handleSubmit}
          loading={loading}
          selectedProducts={selectedProducts}
          isEditMode={true}
          handleCancel={handleCancel}
        />
      </div>
    );
};

export default EditAdjustment;