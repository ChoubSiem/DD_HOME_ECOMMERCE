import React, { useState, useEffect } from "react";
import { Card, message, Form, Empty,Spin  } from "antd";
import dayjs from 'dayjs';
import { useProductTerm } from "../../hooks/UserProductTerm";
import AdjustmentDetailsCard from "../../components/sale/editSale/SaleDetailCard";
import ProductSearchBar from "../../components/sale/editSale/ProductSearchBar";
import ProductsTable from "../../components/sale/editSale/ProductTable";
import NoteSection from "../../components/sale/editSale/NoteSection";
import ActionButtons from "../../components/sale/editSale/ActionButton";
import { useCompany } from "../../hooks/UseCompnay";
import { useUser } from "../../hooks/UserUser";
import Cookies from "js-cookie";
import { useSale } from "../../hooks/UseSale";
import { useNavigate, useParams } from "react-router-dom";
const EditSale = () => {
const { handleProducts } = useProductTerm();
  const now = dayjs();
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const { handleGetOneInventorySale, handleUpdateSaleInventory } = useSale();
  const { handleCustomers, handleGetOneCustomer } = useUser();
  const [fromWarehouseId, setFromWarehouseId] = useState(null);
  const [toWarehouseId, setToWarehouseId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [rawTotal, setRawTotal] = useState(0);
  const [date, setDate] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState({
    value: 0,
    type: 'amount',
  });
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [saleData, setSaleData] = useState(null);
  

  const handleCreditDetailsChange = (amount, date) => {
    setCreditAmount(amount);
    setNextPaymentDate(date);
  };

  const handleInvoiceDiscountChange = (value, type) => {    
    setInvoiceDiscount(value);
  };

  const handleCustomerData = async() => {
    const result = await handleCustomers(token);
    if (result.success) {
      setCustomers(result.customers);
    }
  }

 useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      setAdjuster(userData);
      await handleWarehouseData();
      await fetchSaleData();
      await handleCustomerData();
    };
    loadData();
  }, []);

  useEffect(() => {
    // if (!isLocalStorageLoaded) return;

    const saveData = {
      selectedProducts,
      note,
      reference,
      fromWarehouseId,
      toWarehouseId,
      paymentMethod,
      invoiceDiscount,
      creditAmount,
      nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString() : null,
      amount,
      // customerId,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`editSale_${id}`, JSON.stringify(saveData));
  }, [
    selectedProducts,
    note,
    reference,
    fromWarehouseId,
    toWarehouseId,
    paymentMethod,
    invoiceDiscount,
    creditAmount,
    nextPaymentDate,
    amount,
    // customerId,
    id,
    // isLocalStorageLoaded
  ]);


  const fetchSaleData = async () => {
    setLoading(true);
    try {
      const result = await handleGetOneInventorySale(id, token);
      if (result.success) {        
        setSaleData(result.sale);
        setDate(result.sale.date);
        setReference(result.sale.reference ?? '');
        setNote(result.sale.note);
        if (result.sale.from_warehouse_id) {
          
          setFromWarehouseId(result.sale.from_warehouse_id);
        }
        setToWarehouseId(result.sale.to_warehouse_id);
        setPaymentMethod(result.sale.payment_method);
        setInvoiceDiscount({
          value: result.sale.discount || 0,
          type: result.sale.discount_type || 'amount'
        });
        setCreditAmount(result.sale.next_payment_amount || 0);
        setNextPaymentDate(result.sale.next_payment_date ? dayjs(result.sale.next_payment_date) : null);
        setAmount(result.sale.amount || 0);
        setRawTotal(result.sale.total || 0);
        setSelectedCustomer(result.sale.customer_id || null);
        
        const formattedProducts = result.sale.items.map(item => {
          const matchedProduct = products.find(p => p.id == item.product_id);
          console.log(item);
          
          
                ;
          return {
            key: item.id,
            productId: item.product_id,
            productCode: matchedProduct?.code || `P-${item.product_id}`,
            productName: matchedProduct?.name || item.product?.name || '',
            price: item.price || 0,
            quantity: item.qty || 1,
            stock: matchedProduct?.stock || item.product?.stock || 0,
            discountAmount: item.discount || 0,
            discountPercent: 0,
            unit: item.unit || null,
            cost: item.cost || 0
          };
        });

        setSelectedProducts(formattedProducts);

        if (result.sale.customer_id) {
          const customerResult = await handleGetOneCustomer(result.sale.customer_id, token);
          if (customerResult.success) {
            setCustomer(customerResult.customer);
            localStorage.setItem('customer_type', customerResult.customer.customer_group.name);
          }
        }
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("Failed to load sale data");
    } finally {
      setLoading(false);
    }
  };
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await handleProducts(token,userData.warehouse_id);
      if (result) {
        setProducts(result.products);
      } else {
        message.error("Failed to load products: No data received");
      }
    } catch (error) {
      message.error("Failed to load products");
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
  const handleItemDiscountChange = (key, value, type) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        return {
          ...item,
          discountAmount: type === 'amount' ? value : item.discountAmount,
          discountPercent: type === 'percent' ? value : item.discountPercent
        };
      }
      return item;
    }));
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

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productCode: selectedProduct.code || `P-${selectedProduct.id}`,
      productName: selectedProduct.name,
      price: selectedProduct.sale_price || selectedProduct.price || 0,
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

    setSelectedProducts(prev => prev.map(item => {
      if (item.key === key) {
        if (numericValue <= 0) {
          message.error('Quantity must be greater than 0!');
          return item;
        }

        return {
          ...item,
          quantity: numericValue,
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
    
    const updateData = {
      id: id,
      date: saleData.date || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      reference: reference,
      sale_person: adjuster.id,
      warehouse_id: values.warehouse_id || saleData.warehouse_id,
      from_warehouse_id: fromWarehouseId == 'company' ? null : fromWarehouseId,
      to_warehouse_id: toWarehouseId || saleData.to_warehouse_id,
      note: note || saleData.note,
      payment_method: paymentMethod??'cash',
      discount: invoiceDiscount.value || 0,
      discount_type: invoiceDiscount.type || 'amount',
      credit_amount: creditAmount || 0,
      sale_type: 'sale_inventory',
      amount: amount,
      paid: amount,
      total: amount || 0,
      amount_paid: amount,
      customer_id: selectedCustomer,
      next_payment_date: nextPaymentDate ? dayjs(nextPaymentDate).format('YYYY-MM-DD') : null,
      items: selectedProducts.map(product => ({
        id: product.key, 
        product_id: product.productId,
        quantity: product.quantity,
        unit: product.unit || null,
        price: product.price || 0,
        cost: product.cost || 0,
        discount: product.discountAmount || 0,
      }))
    };

    console.log(updateData);
    // return;
    

    try {
      const result = await handleUpdateSaleInventory(id,updateData, token);      
      if (result.success) {
        message.success('Sale updated successfully!');
        navigate("/sale");
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Error occurred while updating');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(`editSale_${id}`);
    fetchSaleData();
    message.success('Form reset to original sale data');
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

console.log('amountInEdit' + amount);

return (
    <Spin spinning={loading}>
      <div className="add-purchase-container">
        <Card style={{ border: 'none', borderBottom: '1px solid #52c41a', borderRadius: 0, marginBottom: '50px' }}>
          <div className="header">
            <h2 style={{ color: "#52c41a" }}>Edit Sale</h2>
            <p>Update sale details and products</p>
          </div>
        </Card>

        <AdjustmentDetailsCard 
          reference={reference}
          warehouses={warehouses}
          setReference={setReference}
          salesperson={adjuster}
          customers={customers}
          customer={customer}
          setFilteredProducts={setFilteredProducts}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onFromWarehouseChange={setFromWarehouseId}
          onToWarehouseChange={setToWarehouseId}
          defaultFromWarehouse={saleData?.from_warehouse_id ?? null}
          defaultToWarehouse={saleData?.to_warehouse_id}
          date={date}
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
          units={units}
          handleQuantityChange={handleQuantityChange}
          handleUnitChange={handleUnitChange}
          handleRemoveProduct={handleRemoveProduct}
          handleItemDiscountChange={handleItemDiscountChange}
          onCreditDetailsChange={handleCreditDetailsChange}
          creditAmount={creditAmount}
          nextPaymentDate={nextPaymentDate}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onInvoiceDiscountChange={handleInvoiceDiscountChange}
          onAmountChange={setAmount}
          onTotalChange={setRawTotal}
        />
        
        <NoteSection note={note} setNote={setNote} />

        <ActionButtons
          form={form}
          loading={loading}
          onSubmit={handleSubmit}
          onReset={() => {
            fetchSaleData(); // Reset to original data
          }}
          selectedProducts={selectedProducts}
          isEditMode={true}
        />
      </div>
    </Spin>
  );
};

export default EditSale;