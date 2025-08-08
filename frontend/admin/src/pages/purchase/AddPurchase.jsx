import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  InputNumber,
  Select,
  Spin,
} from "antd";
import { SaveOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PurchaseDetailCard from "../../components/purchase/addPurchase/PurchaseDetailCard";
import NoteSection from "../../components/purchase/addPurchase/NoteSection";
import PurchaseSearchBar from "../../components/purchase/addPurchase/PurchaseSearchBar";
import ActionButtons from "../../components/purchase/addPurchase/ActionButton";
import { useProductTerm } from "../../hooks/UserProductTerm";
import { useUser } from "../../hooks/UserUser";
import Cookies from "js-cookie";
import dayjs from 'dayjs';
import { useStock } from "../../hooks/UseStock";
import { useNavigate } from "react-router-dom";

const AddPurchase = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { handleProducts } = useProductTerm();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reference, setReference] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [payment, setPayment] = useState(null); 
  const [editingKey, setEditingKey] = useState('');
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));
  const { handleSuppliers } = useUser();
  const userData = JSON.parse(Cookies.get("user"));
  const { handleCreatePurchase } = useStock();
  const navigate = useNavigate();

  // Load initial data only once
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load saved products if they exist
        const savedProducts = localStorage.getItem("selectedProducts");
        if (savedProducts) {
          setSelectedProducts(JSON.parse(savedProducts));
        }
        
        // Fetch products and suppliers in parallel
        const [productsResult, suppliersResult] = await Promise.all([
          handleProducts(token, userData.warehouse_id),
          handleSuppliers(token)
        ]);
        
        if (productsResult) {
          setProducts(productsResult.products);
        }
        if (suppliersResult?.success) {
          setSuppliers(suppliersResult.suppliers);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        message.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Cleanup function
    return () => {
      // Cancel any pending requests if component unmounts
    };
  }, []);

  // Debounce localStorage writes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedProducts]);

  const handleProductSelect = useCallback((value) => {
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
    
    setSelectedProducts(prev => [
      ...prev,
      {
        key: Date.now(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        quantity: 1,
        price: selectedProduct.cost,
        unit_code: selectedProduct.unit_code,
        unit_name: selectedProduct.unit_name,
        total: selectedProduct.cost * 1,
      }
    ]);
    
    message.success(`${selectedProduct.name} has been added to the purchase list.`);
    setSearchTerm("");
  }, [products, selectedProducts]);

  const handleQuantityChange = useCallback((key, value) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.key === key ? { 
          ...product, 
          quantity: value, 
          total: value * product.price 
        } : product
      )
    );
  }, []);

  const handlePriceChange = useCallback((key, value) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.key === key ? { 
          ...product, 
          price: value,
          total: value * product.quantity 
        } : product
      )
    );
  }, []);

  const handleUnitChange = useCallback((key, value) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.key === key ? { ...product, unit: value } : product
      )
    );
  }, []);

  const handleRemoveProduct = useCallback((key) => {
    setSelectedProducts(prev => prev.filter((p) => p.key !== key));
  }, []);

  const isEditing = useCallback((record) => record.key === editingKey, [editingKey]);

  const edit = useCallback((record) => {
    setEditingKey(record.key);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey('');
  }, []);

  const saveEdit = useCallback((key) => {
    setEditingKey('');
  }, []);

  // Memoize the total amount calculation
  const totalAmount = useMemo(() => 
    selectedProducts.reduce((sum, product) => sum + product.total, 0),
    [selectedProducts]
  );

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    {
      title: "No",
      key: "No",
      width: 50,
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Code",
      dataIndex: "productCode",
      key: "code",
      width: 100,
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      width: 100,
    },
    {
      title: "Unit",
      key: "unit",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Select
            value={record.unit_name}
            style={{ width: '100%' }}
            onChange={(value) => handleUnitChange(record.key, value)}
          />
        ) : (
          <span>{record.unit_name}</span>
        );
      },
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <InputNumber
            value={record.quantity}
            onChange={(value) => handleQuantityChange(record.key, value)}
            style={{ width: '100%' }}
            disabled={!editable}
          />
        );
      },
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <InputNumber
            value={record.price}
            onChange={(value) => handlePriceChange(record.key, value)}
            style={{ width: '100%' }}
            disabled={!editable}
          />
        );
      },
    },
    {
      title: "Total",
      key: "total",
      width: 120,
      render: (_, record) => (
        <span style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
          ${record.total?.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button onClick={() => saveEdit(record.key)} icon={<SaveOutlined />} size="small" />
            <Button onClick={cancelEdit} icon={<CloseOutlined />} size="small" />
          </Space>
        ) : (
          <Space>
            <Button onClick={() => edit(record)} icon={<EditOutlined />} size="small" />
            <Popconfirm
              title="Are you sure to delete this product?"
              onConfirm={() => handleRemoveProduct(record.key)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        );
      },
    }
  ], [isEditing, handleUnitChange, handleQuantityChange, handlePriceChange, saveEdit, cancelEdit, edit, handleRemoveProduct]);

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    if (!payment) {
      message.error("Please select a payment method");
      return;
    }
    if (!selectedSupplier) {
      message.error("Please select supplier");
      return;
    }

    setLoading(true);
    const purchaseData = {
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reference: reference,
      purchaser: userData.id,
      supplier_id: selectedSupplier,
      warehouse_id: userData.warehouse_id,
      note: note || null,
      payments: payment.payments,
      total: totalAmount,
      next_date: payment.date || null,
      credit_amount: payment.amount || null,
      items: selectedProducts.map(product => ({
        product_id: product.productId,
        qty: product.quantity,
        price: product.price,
        unit_code: product.unit_code || null
      }))
    };    
    
    try {
      const result = await handleCreatePurchase(purchaseData, token);
      if (result.success) {
        message.success('Purchase created successfully!');
        setSelectedProducts([]);
        setPayment(null);
        localStorage.removeItem("selectedProducts");
        navigate("/purchase");
      } else {
        message.error(result.error || 'Failed to create purchase');
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred while creating the purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="add-purchase-container">
        <Card style={{ border: 'none', borderBottom: '1px solid #52c41a', borderRadius: 0, marginBottom: '20px' }}>
          <div className="header">
            <h1 style={{ color: "#52c41a" }}>Add New Purchase</h1>
            <p>Select products and add them to the purchase list</p>
          </div>
        </Card>

        <PurchaseDetailCard 
          reference={reference} 
          setReference={setReference}
          suppliers={suppliers}
          purchase={userData}
          onPaymentSubmit={setPayment} 
          selectSupplier={setSelectedSupplier}
          total={totalAmount}
        />
        
        <PurchaseSearchBar
          products={products}
          searchTerm={searchTerm}
          handleSearchChange={setSearchTerm} 
          handleProductSelect={handleProductSelect}
        />
        
        <Table
          bordered
          dataSource={selectedProducts}
          columns={columns}
          pagination={false}
          rowClassName="editable-row"
          style={{ marginBottom: '20px' }}
          rowKey="key"
        />
        
        <div className="total-amount" style={{ marginBottom: '20px', textAlign: 'right', marginRight: "13%" }}>
          <strong style={{ fontSize: '16px' }}>Total Amount: ${totalAmount.toFixed(2)}</strong>
        </div>
        
        <NoteSection note={note} setNote={setNote} />
        
        <ActionButtons 
          setSelectedProducts={setSelectedProducts}
          handleSubmit={handleSubmit}
          loading={loading}
          selectedProducts={selectedProducts}
        />
      </div>
    </Spin>
  );
};

export default React.memo(AddPurchase);