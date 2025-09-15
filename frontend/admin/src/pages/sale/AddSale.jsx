import React, { useState, useEffect } from "react";
import { Card, message, Form } from "antd";
import dayjs from 'dayjs';
import { useProductTerm } from "../../hooks/UserProductTerm";
import SaleDetailCard from "../../components/sale/addSale/SaleDetailCard";
import ProductSearchBar from "../../components/sale/addSale/ProductSearchBar";
import ProductsTable from "../../components/sale/addSale/ProductTable";
import NoteSection from "../../components/sale/addSale/NoteSection";
import ActionButtons from "../../components/sale/addSale/ActionButton";
import { useCompany } from "../../hooks/UseCompnay";
import { useUser } from "../../hooks/UserUser";
import Cookies from "js-cookie";
import { useSale } from "../../hooks/UseSale";
import { useNavigate } from "react-router-dom";

const AddSale = () => {
  const { handleProducts } = useProductTerm();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [reference, setReference] = useState('');
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user"));
  const { handleWarehouse } = useCompany();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCustomer, setSelectedCustomer] = useState(0);
  const [amount, setAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const { handlePosSaleCreate } = useSale();
  const { handleCustomers, handleGetOneCustomer } = useUser();
  const [fromWarehouseId, setFromWarehouseId] = useState(null);
  const [toWarehouseId, setToWarehouseId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [rawTotal, setRawTotal] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState({
    value: 0,
    type: 'amount',
  });
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: 0 }]);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null); 

  const handleCreditDetailsChange = (amount, date) => {
    setCreditAmount(amount);
    setNextPaymentDate(date);
  };

  const handleInvoiceDiscountChange = (value, type) => {
    setInvoiceDiscount({
      value: value,
      type: type,
    });
  };

  const handleCustomerData = async () => {
    const result = await handleCustomers(token);
    if (result.success) {
      setCustomers(result.customers);
    }
  };

  useEffect(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
    handleWarehouseData();
    fetchProducts();
    handleCustomerData();
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

  const handleWarehouseData = async () => {
    let result = await handleWarehouse(token);
    if (result.success) {
      setWarehouses(result.warehouses);
    }
  };

  const handleSearchChange = (value) => setSearchTerm(value);

  const handlePriceChange = (key, value) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        return { ...item, price: value };
      }
      return item;
    }));
  };

  const handleItemDiscountChange = (key, value, type) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        value = value || 0;
        if (type === 'amount') {
          const discountPercent = item.price > 0 && item.quantity > 0
            ? (value / (item.price * item.quantity)) * 100
            : 0;
          return {
            ...item,
            discountAmount: parseFloat(value),
            discountPercent: parseFloat(discountPercent.toFixed(2))
          };
        } else {
          const discountAmount = (item.price * item.quantity * value) / 100;
          return {
            ...item,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            discountPercent: parseFloat(value)
          };
        }
      }
      return item;
    }));
  };

  const handleProductSelect = (value, option) => {
    const selectedProduct = products.find((p) => p.name === value);

    if (!selectedProduct) {
      message.error("Selected product not found.");
      return;
    }

    const isAlreadyAdded = selectedProducts.some(
      (p) => p.productId === selectedProduct.id
    );

    if (isAlreadyAdded) {
      message.warning(`${selectedProduct.name} is already added.`);
      return;
    }

    const customer_type = (localStorage.getItem('customer_type') || '').toLowerCase();
    let productPrice;

    if (!userData.warehouse_id) {
      productPrice = selectedProduct.price || 0;
    } else {
      productPrice = selectedProduct.retail_price;
    }

    switch (customer_type) {
      case 'vip':
        productPrice = selectedProduct.vip_price ?? productPrice;
        break;
      case 'wholesale':
        productPrice = selectedProduct.wholesale_price ?? productPrice;
        break;
      case 'dealer':
        productPrice = selectedProduct.dealer_price ?? productPrice;
        break;
      default:
        break;
    }

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productCode: selectedProduct.code || `P-${selectedProduct.id}`,
      productName: selectedProduct.name,
      price: productPrice,
      quantity: 1,
      stock: Number(selectedProduct.stock),
      discountAmount: 0,
      discountPercent: 0
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    message.success(`${selectedProduct.name} has been added to the sale.`);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      message.error('Quantity must be a valid number');
      return;
    }

    if (numericValue <= 0) {
      message.error('Quantity must be greater than 0!');
      return;
    }

    setSelectedProducts(prev => {
      const updatedProducts = prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            quantity: numericValue
          };
        }
        return item;
      });
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (key) => {
    const updatedProducts = selectedProducts.filter((p) => p.key !== key);
    setSelectedProducts(updatedProducts);
  };

  const onWarehouseChange = ({ from_warehouse_id, to_warehouse_id }) => {
    if (from_warehouse_id === to_warehouse_id && from_warehouse_id && to_warehouse_id) {
      message.warning('Source and destination warehouses cannot be the same');
      return;
    }
    setFromWarehouseId(from_warehouse_id);
    setToWarehouseId(to_warehouse_id);
  };

  const handleSubmit = async (values) => {
    if (!Array.isArray(selectedProducts)) {
      message.error('System error: Invalid product data');
      return;
    }

    if (selectedProducts.length === 0) {
      message.error('Please add at least one product before submitting');
      return;
    }

    setLoading(true);
    let warehouse_id = values.warehouse_id;
    let customer_id = null;
    
    if (userData.warehouse_id) {
      warehouse_id = userData.warehouse_id;
      customer_id = selectedCustomer;
    }
    
    if (!toWarehouseId && customer_id == 0) {
      message.error('Please select customer');
      return;
    }

    const firstNextDate = paymentMethods?.[0]?.nextPaymentDate;
    const creditMethod = paymentMethods.find(pm => pm.method === 'credit');
    const creditAmount = creditMethod ? creditMethod.amount : null;
    const amount_paid = paymentMethods.map(payment => payment.amount).reduce((sum, amount) => sum + amount, 0);
    
    const saleData = {
      date: values.date || dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reference: reference,
      sale_person: selectedSalesperson?.id??null, 
      warehouse_id: warehouse_id ?? null,
      from_warehouse_id: fromWarehouseId == 'company' ? null : fromWarehouseId,
      to_warehouse_id: toWarehouseId ?? null,
      note: note ?? null,
      payments: paymentMethods,
      inv_discount: invoiceDiscount.value ?? 0,
      discount_type: invoiceDiscount.type ?? 'amount',
      credit_amount: creditAmount != null ? (amount - creditAmount) : null,
      sale_type: 'sale_inventory',
      amount: rawTotal,
      paid: creditAmount,
      total: amount ?? 0,
      amount_paid: creditAmount ?? amount_paid,
      customer_id: customer_id,
      next_payment_date: firstNextDate != null ? dayjs(firstNextDate).format('YYYY-MM-DD') : null,
      items: selectedProducts.map(product => ({
        product_id: product.productId,
        quantity: product.quantity,
        unit: product.unit ?? null,
        price: product.price ?? 0,
        cost: product.cost ?? 0,
        discount: product.discountAmount ?? 0,
      }))
    };

    // console.log('Sale Data:', saleData);
    // return;

    try {
      const result = await handlePosSaleCreate(saleData, token);

      if (result.success) {
        message.success('Sale created successfully!');
        form.resetFields();
        setSelectedProducts([]);
        localStorage.removeItem("selectedProducts");
        navigate("/sale");
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error occurred while submitting');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const results = products.filter(product => {
      const productName = String(product.name || '').toLowerCase();
      const productCode = String(product.code || '');
      return (
        productName.includes(searchTermLower) ||
        productCode.includes(searchTerm)
      );
    });

    setFilteredProducts(results);
  }, [searchTerm, products]);

  useEffect(() => {
    handleGetOneCustomerData();
  }, [selectedCustomer]);

  const handleGetOneCustomerData = async () => {
    if (selectedCustomer !== 0) {
      try {
        let result = await handleGetOneCustomer(selectedCustomer, token);
        if (result.success) {
          localStorage.setItem('customer_type', result.customer.customer_group.name);
          setCustomer(result.customer);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    }
  };

  // Handle salesperson selection
  const handleSalespersonChange = (salesperson) => {
    setSelectedSalesperson(salesperson);
  };

  return (
    <div className="add-purchase-container">
      <Card style={{ border: 'none', borderBottom: '1px solid #52c41a', borderRadius: 0, marginBottom: '50px' }}>
        <div className="header">
          <h2 style={{ color: "#52c41a" }}>Add Sale</h2>
          <p>Select products and manage their quantities</p>
        </div>
      </Card>

      <SaleDetailCard
        reference={reference}
        warehouses={warehouses}
        setReference={setReference}
        salesperson={selectedSalesperson} 
        customers={customers}
        setFilteredProducts={setFilteredProducts}
        selectedCustomer={setSelectedCustomer}
        onFromWarehouseChange={setFromWarehouseId}
        onToWarehouseChange={setToWarehouseId}
        onSalespersonChange={handleSalespersonChange} 
      />

      <ProductSearchBar
        products={products}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleProductSelect={handleProductSelect}
        onWarehouseChange={onWarehouseChange}
        customer={customer}
      />

      <ProductsTable
        selectedProducts={selectedProducts}
        handlePriceChange={handlePriceChange}
        handleQuantityChange={handleQuantityChange}
        handleItemDiscountChange={handleItemDiscountChange}
        handleRemoveProduct={handleRemoveProduct}
        onCreditDetailsChange={handleCreditDetailsChange}
        creditAmount={creditAmount}
        nextPaymentDate={nextPaymentDate}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onInvoiceDiscountChange={handleInvoiceDiscountChange}
        onAmountChange={setAmount}
        onTotalChange={(value) => setRawTotal(value)}
        total={rawTotal}
        paymentMethods={paymentMethods}
        onPaymentMethodsChange={setPaymentMethods}
      />

      <NoteSection note={note} setNote={setNote} />

      <ActionButtons
        form={form}
        loading={loading}
        onSubmit={handleSubmit}
        onReset={() => {
          form.resetFields();
          setSelectedProducts([]);
          localStorage.removeItem("selectedProducts");
        }}
        selectedProducts={selectedProducts}
      />
    </div>
  );
};

export default AddSale;