import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  InputNumber,
  Select,
  Input,
  Spin,
} from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
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
  const [purchase, setPurchase] = useState([]);
  const [reference, setReference] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [payment, setPayment] = useState(null); 
  const [editingKey, setEditingKey] = useState('');
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));
  const warehouseId = user.warehouse_id;
  const { handleSuppliers } = useUser();
  const userData = JSON.parse(Cookies.get("user"));
  const { handleCreatePurchase } = useStock();
  const navigate = useNavigate();

  useEffect(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
    setPurchase(userData);
    fetchProducts();
    handleSupplierData();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token, userData.warehouse_id);
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

  const handleSupplierData = async () => {
    let result = await handleSuppliers(token);
    if (result.success) {
      setSuppliers(result.suppliers);
    }
  }

  const handleSearchChange = (value) => {
  setSearchTerm(value);
};

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
    console.log(selectedProduct);
    

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: 1,
      price: selectedProduct.cost,
      unit: selectedProduct.unit_name,
      total: selectedProduct.cost * 1,
    };
    
    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the purchase list.`);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { 
        ...product, 
        quantity: value, 
        total: value * product.price 
      } : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handlePriceChange = (key, value) => {
    const updatedProducts = selectedProducts.map((product) =>
      product.key === key ? { 
        ...product, 
        price: value,
        total: value * product.quantity 
      } : product
    );
    setSelectedProducts(updatedProducts);
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

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    setEditingKey(record.key);
  };

  const cancelEdit = () => {
    setEditingKey('');
  };

  const saveEdit = (key) => {
    setEditingKey('');
  };

  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.total,
    0
  );

  const columns = [
    {
      title: "No",
      dataIndex: "No",
      key: "No",
      width: 50,
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      width: 100,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Select
            value={record.unit}
            style={{ width: '100%' }}
            onChange={(value) => handleUnitChange(record.key, value)}
          />
        ) : (
          <span>{record.unit}</span>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
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
      dataIndex: "price",
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
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (_, record) => <span style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>${record.total?.toFixed(2)}</span>,
    },
    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              onClick={() => saveEdit(record.key)}
              icon={<SaveOutlined />}
              size="small"
            />
            <Button
              onClick={cancelEdit}
              icon={<CloseOutlined />}
              size="small"
            />
          </Space>
        ) : (
          <Space>
            <Button
              onClick={() => edit(record)}
              icon={<EditOutlined />}
              size="small"
            />
            <Popconfirm
              title="Are you sure to delete this product?"
              onConfirm={() => handleRemoveProduct(record.key)}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Space>
        );
      },
    }
  ];

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    if (!payment) {
      message.error("Please select a payment method");
      return;
    }

    setLoading(true);
    const purchaseData = {
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reference: reference,
      purchaser: purchase.id,
      supplier_id : selectedSupplier,
      warehouse_id: null,
      note: note || null,
      payment_type: payment.type,
      total: totalAmount,
      next_date: payment.date || null,
      credit_amount: payment.amount || null,
      items: selectedProducts.map(product => ({
        product_id: product.productId,
        qty: product.quantity,
        price: product.price,
        unit_code: product.unit || null
      }))
    };    

    // console.log(purchaseData);
    // return ;
    

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
          purchase={purchase}
          onPaymentSubmit={setPayment} 
          selectSupplier = {setSelectedSupplier}
        />
        
        <PurchaseSearchBar
          products={products}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange} 
          handleProductSelect={handleProductSelect}
        />
        
        <Table
          bordered
          dataSource={selectedProducts}
          columns={columns}
          pagination={false}
          rowClassName="editable-row"
          style={{ marginBottom: '20px' }}
        />
        
        <div className="total-amount" style={{ marginBottom: '20px', textAlign: 'right',marginRight:"13%" }}>
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

export default AddPurchase;