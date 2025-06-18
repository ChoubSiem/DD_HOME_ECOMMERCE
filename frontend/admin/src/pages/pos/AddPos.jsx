import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPlus, FiX, FiShoppingCart, FiUser, FiChevronDown, FiPercent, FiTag, FiChevronLeft, FiChevronRight, FiRefreshCw, FiPower } from "react-icons/fi";
import { ShopOutlined, ShoppingCartOutlined, CreditCardOutlined, PoweroffOutlined, PlusCircleOutlined, EyeOutlined, ArrowLeftOutlined, PauseOutlined, EditOutlined, MenuOutlined, LockOutlined, StopOutlined, CloseCircleOutlined, UnlockOutlined,DollarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  WalletOutlined, } from '@ant-design/icons';
const paymentOptions = [
  { name: "Cash", icon: <DollarOutlined /> },
  { name: "ABA", icon: <BankOutlined /> },
  { name: "AC", icon: <WalletOutlined /> },
  { name: "Bakong", icon: <BankOutlined /> },
  { name: "VISA", icon: <CreditCardOutlined /> },
  { name: "Mastercard", icon: <CreditCardOutlined /> },
];
import { Tooltip, Drawer, message, Button, Input, Modal, Alert, Table, Badge, Spin, Select } from 'antd';
import Cookies from "js-cookie";
import "./AddPos.css";
import { motion, AnimatePresence } from "framer-motion";
import EditItemModal from "../../components/pos/add/ModalEdit";
import { useProductTerm } from "../../hooks/UserProductTerm";  
import { useUser } from "../../hooks/UserUser";
import OpenShiftModal from '../../components/pos/shift/OpenShift';
import CloseShiftModal from '../../components/pos/shift/CloseShift';
import ViewShiftModal from '../../components/pos/shift/ViewShift';
import PaymentPos from "./PaymentPos";
import { useStock } from "../../hooks/UseStock";
import { useSale } from "../../hooks/UseSale";
import EditOpenShift from '../../components/pos/shift/EditOpenShift';
import InvoiceTemplate from "./InvoiceTemplate";
import ReactDOM from "react-dom/client";
function PosAdd() {
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCloseShiftModal, setIsCloseShiftModal] = useState(false);
  const productsPerPage = 10;
  const [selectedPayment, setSelectedPayment] = useState("Cash");
    const printRef = useRef();
    const [isPrintReady, setIsPrintReady] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    const savedCustomer = localStorage.getItem('posSelectedCustomer');
    try {
      return savedCustomer ? JSON.parse(savedCustomer) : null;
    } catch (error) {
      return null;
    }
  });

  const [priceType, setPriceType] = useState('retail_price'); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [customers, setCustomers] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('posCartItems');
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  const [editShiftVisible, setEditShiftVisible] = useState(false);
  const [shiftData, setShiftData] = useState(null);
  const [viewShiftVisible, setViewShiftVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleProducts, handleCategories } = useProductTerm();
  const { handleCustomerQuickCreate, handleCustomers } = useUser();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftAmount, setShiftAmount] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user") || "{}");
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(Cookies.get('is_open_shift') === 'true');
  const [isViewShiftVisible, setIsViewShiftVisible] = useState(false);
  const handleChange = (value) => {
    setSelectedPayment(value);
  };
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('posProducts');
    try {
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch (error) {
      return [];
    }
  });
  
  const [suspendedOrders, setSuspendedOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('suspendedOrders')) || [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState([]);
  const categoryScrollerRef = useRef(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSuspendedOrdersModalVisible, setIsSuspendedOrdersModalVisible] = useState(false);
  const { handleSuspandCreate, handleSuspendDelete, handleGetSuspends } = useStock();
  const { handleGetOneOpenShift,handleGetOneProcessingShift , handlePosSaleCreate } = useSale();
  const [shiftId, setShiftId] = useState(Cookies.get("shift_id"));
  const [activeCartTab, setActiveCartTab] = useState('items');
  
  const [deliveryOptions, setDeliveryOptions] = useState([
    { id: 1, name: 'Standard Delivery', price: 5.99, estimated: '2-3 days' },
    { id: 2, name: 'Express Delivery', price: 9.99, estimated: '1 day' },
    { id: 3, name: 'In-Store Pickup', price: 0, estimated: 'Ready in 1 hour' }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  
  const [cartDiscount, setCartDiscount] = useState(() => {
    try {
      const saved = localStorage.getItem('posCartDiscount');
      const parsed = saved ? JSON.parse(saved) : 0;
      return typeof parsed === 'number' && parsed >= 0 ? parsed : 0;
    } catch (err) {
      return 0;
    }
  });
    useEffect(() => {
    const fetchShiftData = async () => {
      if (!userData?.warehouse_id || !token) {
        return;
      }

      try {
        const result = await handleGetOneProcessingShift(userData.warehouse_id, token);
        if (result?.success && result.shift) {
          Cookies.set('shift_id',result.shift.id);
          Cookies.set('is_open_shift',true);
          setShiftData(result.data);
          setIsShiftOpen(true);
          setShiftModalVisible(false);
        } else {
          setShiftData(null);
          setIsShiftOpen(false);
          setShiftModalVisible(true); 
        }
      } catch (error) {
        message.error("Failed to load shift data");
        setShiftData(null);
        setIsShiftOpen(false);
        setShiftModalVisible(true);
      }
    };

  fetchShiftData();

}, [userData?.warehouse_id, token]);

  const [cartDiscountType, setCartDiscountType] = useState(() => {
    try {
      const saved = localStorage.getItem('posCartDiscountType');
      const parsed = saved ? JSON.parse(saved) : 'amount';
      return ['amount', 'percent'].includes(parsed) ? parsed : 'amount';
    } catch (err) {
      return 'amount';
    }
  });

  const [shouldFetchProducts, setShouldFetchProducts] = useState(!localStorage.getItem('posProducts'));
  
  const [nextPaymentDate, setNextPaymentDate] = useState(() => {
    const savedDate = localStorage.getItem('posNextPaymentDate');
    try {
      return savedDate ? JSON.parse(savedDate) : null;
    } catch (error) {
      return null;
    }
  });

  const [nextPaymentAmount, setNextPaymentAmount] = useState(() => {
    const savedAmount = localStorage.getItem('posNextPaymentAmount');
    try {
      const parsedAmount = savedAmount ? JSON.parse(savedAmount) : 0;
      return typeof parsedAmount === 'number' && parsedAmount >= 0 ? parsedAmount : 0;
    } catch (error) {
      return 0;
    }
  });

  const [priceDifferences, setPriceDifferences] = useState({});
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  // Helper function to map customer group to price type
  const getPriceTypeFromCustomerGroup = (group) => {
    switch (group?.toLowerCase()) {
      case 'vip':
        return 'vip_price';
      case 'depot':
        return 'depot_price';
      case 'dealer':
        return 'dealer_price';
      case 'walkin':
      default:
        return 'retail_price';
    }
  };

  // Helper functions
  const getCurrentProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const filteredCustomers = customers?.filter(customer =>
    customer?.username?.toLowerCase().includes(searchCustomerTerm.toLowerCase()) ||
    (customer?.phone && customer.phone.toLowerCase().includes(searchCustomerTerm.toLowerCase()))
  ) || [];

  const filteredProducts = products.filter(product => {
    const name = product.name?.toLowerCase() || '';
    const code = product.code?.toLowerCase() || ''; 
    const matchesSearch = name.includes(searchProductTerm.toLowerCase()) ||
                          code.includes(searchProductTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category_name === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemDiscountTotal = cartItems.reduce((sum, item) => {
    const { price, quantity, discount = 0, discountType } = item;

    let discountValue = 0;

    if (discountType === "percentage") {
      discountValue = price * quantity * (discount / 100);
    } else if (discountType === "amount") {
      discountValue = discount * quantity;
    }

    return sum + discountValue;
  }, 0);

  const calculatedCartDiscount = cartDiscountType === 'percent'
    ? (subtotal - itemDiscountTotal) * (cartDiscount / 100)
    : cartDiscount;
  const tax = subtotal * 0;
  const deliveryFee = selectedDelivery?.price || 0;
  const total = subtotal - itemDiscountTotal - calculatedCartDiscount + tax + deliveryFee;

  // Effects
  useEffect(() => {
    const fetchShiftData = async () => {
      if (isShiftOpen && shiftId) {
        await handleGetOneOpenShiftData();
      }
    };
    
    fetchShiftData();
    
    if (!isShiftOpen) {
      setShiftModalVisible(true);
    }
  }, [isShiftOpen, shiftId]);

  useEffect(() => {
    localStorage.setItem('posCartItems', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setCartDiscount(0);
      setCartDiscountType('amount');
      localStorage.setItem('posCartDiscount', JSON.stringify(0));
      localStorage.setItem('posCartDiscountType', JSON.stringify('amount'));
    }
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('posCartDiscount', JSON.stringify(cartDiscount));
    localStorage.setItem('posCartDiscountType', JSON.stringify(cartDiscountType));
  }, [cartDiscount, cartDiscountType]);

  useEffect(() => {
    localStorage.setItem('posSelectedCustomer', JSON.stringify(selectedCustomer));
    if (selectedCustomer) {
      const newPriceType = getPriceTypeFromCustomerGroup(selectedCustomer.group_name);
      setPriceType(newPriceType);
      message.info(`${newPriceType.replace('_price', '').toUpperCase()} pricing applied`);
    } else {
      setPriceType('retail_price');
    }
  }, [selectedCustomer]);

  useEffect(() => {
    localStorage.setItem('posNextPaymentDate', JSON.stringify(nextPaymentDate));
  }, [nextPaymentDate]);

  useEffect(() => {
    localStorage.setItem('posNextPaymentAmount', JSON.stringify(nextPaymentAmount));
  }, [nextPaymentAmount]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (shouldFetchProducts) {
        await handleProductsData();
      }
      await handleCategoriesData();
      await handleCustomerData();
    };
    
    fetchInitialData();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchCustomerTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shouldFetchProducts]);

  useEffect(() => {
    const disableEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  
    window.addEventListener('keydown', disableEsc);
  
    return () => {
      window.removeEventListener('keydown', disableEsc);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchProductTerm, selectedCategory]);

  // Data fetching functions
  const handleProductsData = async () => {
    setLoading(true);
    try {
      let result = await handleProducts(token, userData.warehouse_id);
      if (result?.success) {
        setProducts(result.products || []);
        localStorage.setItem('posProducts', JSON.stringify(result.products || []));
        setShouldFetchProducts(false);
      } else {
        message.error("Failed to load products");
      }
    } catch (error) {
      message.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesData = async () => {
    setLoading(true);
    try {
      let result = await handleCategories(token, userData.warehouse_id);
      if (result?.success) {
        setCategories(result.categories || []);
      } else {
        message.error("Failed to load categories");
      }
    } catch (error) {
      message.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerData = async () => {
    setLoading(true);
    try {
      let result = await handleCustomers(token);
      if (result?.success) {
        setCustomers(result.customers || []);
      } else {
        setCustomers([]);
        message.error("Failed to load customers");
      }
    } catch (error) {
      setCustomers([]);
      message.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuspendedOrders = async () => {
    try {
      const result = await handleGetSuspends(userData.warehouse_id, shiftId, token);
      if (result?.success) {
        const orders = result.suspands || [];
        localStorage.setItem('suspendedOrders', JSON.stringify(orders));
        setSuspendedOrders(orders);
        return orders;
      } else {
        message.error(result?.message || "Failed to fetch suspended orders");
        return [];
      }
    } catch (error) {
      message.error("Failed to load suspended orders");
      return [];
    }
  };

  const handleGetOneOpenShiftData = async () => {
    try {
      if (!shiftId) {
        return;
      }
      
      if (!userData?.warehouse_id || !token) {
        return;
      }
      
      let result = await handleGetOneOpenShift(shiftId, userData.warehouse_id, token);
      
      if (result?.success) {
        return result.data;
      } else {
        message.error(result?.message || "Failed to load shift data");
      }
    } catch (error) {
      message.error("Failed to load shift data");
      throw error;
    }
  };

  // Cart functions
  const addToCart = (product) => {
    if (!isShiftOpen) {
      message.warning("Please open a shift before adding products");
      return;
    }
    if (!selectedCustomer) {
      message.warning("Please select a customer before adding products");
      return;
  }

  // Validate price
  let price = parseFloat(product[priceType]) || parseFloat(product.retail_price) || 0;
  if (isNaN(price) || price < 0) {
    price = 0;
    message.warning(`Price missing for ${product.name || 'product'}. Set to $0.00.`);
  }

  const currentPrice = price;
  const originalPrice = parseFloat(product.original_price) || currentPrice;

  // Price difference warning
  if (currentPrice !== originalPrice) {
    setPriceDifferences(prev => ({
      ...prev,
      [product.id]: {
        original: originalPrice,
        current: currentPrice,
        difference: (currentPrice - originalPrice).toFixed(2)
      }
    }));
    setShowPriceWarning(true);
  }

  setCartItems(prev => {
    const existingItem = prev.find(item => item.id === product.id);
    if (existingItem) {
      console.log(existingItem);
      
      return prev.map(item =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              original_price: originalPrice,
              current_price: currentPrice,
              // discountType:it
            }
          : item
      );
    }

    // Validate discount
    let discount = parseFloat(product.discount) || 0;
    if (isNaN(discount) || discount < 0 || discount > 100) {
      discount = 0;
    }

    console.log(discount);
    

    return [
      ...prev,
      {
        ...product,
        price: currentPrice,
        original_price: originalPrice,
        current_price: currentPrice,
        quantity: 1,
        unit: product.unit_code || 'pcs',
        discount: discount,
        price_type: priceType
      }
    ];
  });
  message.success(`${product.name} added to cart`);
};

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    message.success("Item removed from cart");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartDiscount(0);
    setCartDiscountType('amount');
    setSelectedCustomer(null);
    setPriceType('retail_price');
    setNextPaymentDate(null);
    setNextPaymentAmount(0);
    localStorage.removeItem('posCartItems');
    localStorage.removeItem('posCartDiscount');
    localStorage.removeItem('posCartDiscountType');
    localStorage.removeItem('posSelectedCustomer');
    localStorage.removeItem('posNextPaymentDate');
    localStorage.removeItem('posNextPaymentAmount');
    message.success("Cart cleared successfully");
  };

  // Customer functions
  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsOpen(false);
    setSearchCustomerTerm('');
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      message.warning("Please enter customer name");
      return;
    }
    try {
      const newCustomer = { 
        username: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        customer_group: 'walkin' 
      };
  
      let result = await handleCustomerQuickCreate(newCustomer, token);
      
      if (result?.success) {
        message.success("Customer added successfully");
        setCustomers(prev => [...prev, result.customer]);
        setSelectedCustomer(result.customer);
        setIsModalVisible(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
      } else {
        message.error(result?.message || "Failed to add customer");
      }
    } catch (error) {
      message.error("Error adding customer");
    }
  };  

  // Shift functions
  const handleOpenShift = (amount, newShiftId) => {
    if (!amount) {
      message.warning('Please enter starting amount');
      return;
    }
    
    setShiftId(newShiftId);
    setShiftOpen(true);
    setShowShiftForm(false);
  };

  const handleCloseShift = async () => {

    setIsCloseShiftModal(true);
    // try {
    //   if (!shiftId) {
    //     message.error('No active shift to close');
    //     return;
    //   }

    //   const response = await handleCloseShiftCreate();

    //   if (response.data.success) {
    //     ['is_openshift', 'shift_amount', 'shift_id'].forEach(name => Cookies.remove(name, { path: '/' }));
        
    //     localStorage.removeItem('posProducts');
    //     localStorage.removeItem('posCartItems');
    //     localStorage.removeItem('posCartDiscount');
    //     localStorage.removeItem('posCartDiscountType');
    //     localStorage.removeItem('posSelectedCustomer');
    //     localStorage.removeItem('posNextPaymentDate');
    //     localStorage.removeItem('posNextPaymentAmount');
        
    //     setShiftId(null);
    //     setShiftOpen(false);
    //     setShiftAmount('');
    //     setShiftData(null);
        
    //     message.success(response.data.message || 'Shift closed successfully');
    //   } else {
    //     throw new Error(response.data.message || 'Failed to close shift');
    //   }
    // } catch (error) {
    //   message.error(error.message || 'Failed to close shift');
    // }
  };

  const handleRefreshStock = async () => {
    setShouldFetchProducts(true);
    await handleProductsData();
    message.success("Stock refreshed successfully");
  };

  // Order functions
  const suspendOrder = async () => {
    if (!isShiftOpen) {
      message.warning("Please open a shift to suspend an order");
      return;
    }
    if (cartItems.length === 0) {
      message.warning('Cart is empty. Add items to suspend an order');
      return;
    }
    if (!selectedCustomer) {
      message.warning('Please select a customer to suspend the order');
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);


    const itemDiscountTotal = cartItems.reduce((sum, item) => {
      const { price, quantity, discount = 0, discountType } = item;

      let discountValue = 0;

      if (discountType === "percentage") {
        discountValue = price * quantity * (discount / 100);
      } else if (discountType === "amount") {
        discountValue = discount; 
      }

      return sum + discountValue;
    }, 0);


    console.log('total' + itemDiscountTotal);
    
    const calculatedCartDiscount = cartDiscountType === 'percent'
      ? (subtotal - itemDiscountTotal) * (cartDiscount / 100)
      : cartDiscount;
    const tax = subtotal * 0;
    const deliveryFee = selectedDelivery?.price || 0;
    const total = subtotal - itemDiscountTotal - calculatedCartDiscount + tax + deliveryFee;
    
    const newSuspendedOrder = {
      customer_id: selectedCustomer.id,
      price_type: priceType,
      items: cartItems.map(item => ({
        product_id: item.id,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        total: item.price * item.quantity * (1 - (item.discount || 0)) / 100,
      })),
      subtotal,
      discount: itemDiscountTotal + calculatedCartDiscount,
      discount_type: cartDiscountType,
      discount_value: cartDiscount,
      tax,
      delivery_fee: selectedDelivery?.price || 0,
      delivery_option: selectedDelivery?.id || null,
      total,
      open_shift_id: shiftId,
    };

    try {
      const response = await handleSuspandCreate(newSuspendedOrder, userData.warehouse_id, token);
      if (response?.success) {
        setCartItems([]);
        setSelectedCustomer(null);
        setPriceType('retail_price');
        setSelectedDelivery(null);
        setCartDiscount(0);
        setCartDiscountType('amount');
        setNextPaymentDate(null);
        setNextPaymentAmount(0);
        
        await fetchSuspendedOrders();
        message.success('Order suspended successfully');
      } else {
        throw new Error(response?.message || "Failed to suspend order");
      }
    } catch (error) {
      message.error(error.message || 'Failed to suspend order');
    }
  };

  const loadSuspendedOrder = async (orderId) => {
    try {
      const suspendedOrders = JSON.parse(localStorage.getItem('suspendedOrders')) || [];
      const order = suspendedOrders.find(o => o.id === orderId);
      
      if (!order) {
        message.error("Order not found");
        return;
      }

      Modal.confirm({
        title: 'Load Suspended Order',
        content: 'This will replace your current cart. Continue?',
        okText: 'Yes, Load Order',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            const customer = customers.find(c => c.id === order.customer_id);
            if (customer) {
              setSelectedCustomer(customer);
            } else {
              message.warning("Original customer not found, please select a new one");
            }

            setPriceType(order.price_type || 'retail_price');
            
            const items = order.items.map(item => {
              const product = products.find(p => p.id === item.product_id) || {};
              return {
                ...product,
                id: item.product_id,
                name: product.name || `Product ${item.product_id}`,
                price: item.price,
                original_price: item.price,
                current_price: item.price,
                quantity: item.quantity,
                discount: item.discount || 0,
                unit: product.unit_code || 'pcs',
                price_type: order.price_type
              };
            });

            setCartItems(items);
            setCartDiscount(order.discount_value || 0);
            setCartDiscountType(order.discount_type || 'amount');
            
            if (order.delivery_option) {
              const delivery = deliveryOptions.find(d => d.id === order.delivery_option);
              setSelectedDelivery(delivery || null);
            }
            const updatedSuspendedOrders = suspendedOrders.filter(o => o.id !== orderId);
            localStorage.setItem('suspendedOrders', JSON.stringify(updatedSuspendedOrders));
            await handleSuspendDelete(orderId, token);
            message.success('Suspended order loaded into cart');
            setIsSuspendedOrdersModalVisible(false);
          } catch (error) {
            message.error("Failed to load order details");
          }
        }
      });
    } catch (error) {
      message.error("Failed to load order");
    }
  };

  // UI handlers
  const handleBack = () => {
    navigate("/pos");
  };

  const handleProceedToPayment = () => {
    if (!isShiftOpen) {
      message.warning("Please open a shift before processing payment");
      return;
    }
    if (cartItems.length === 0) {
      message.warning("Please add items to cart first");
      return;
    }
    handleCreatePosSaleData();
    
    // setIsPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (paidAmount) => {
    if (paidAmount < total) {
      const remainingBalance = total - paidAmount;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      const formattedNextDate = nextDate.toISOString().split('T')[0]; 
      setNextPaymentAmount(remainingBalance);
      setNextPaymentDate(formattedNextDate);
      message.warning(`Partial payment received. Remaining $${remainingBalance.toFixed(2)} due on ${formattedNextDate}`);
    } else {
      setNextPaymentAmount(0);
      setNextPaymentDate(null);
      localStorage.removeItem('posNextPaymentDate');
      localStorage.removeItem('posNextPaymentAmount');
    }
    setCartItems([]);
    setSelectedCustomer(null);
    setPriceType('retail_price');
    setSelectedDelivery(null);
    setCartDiscount(0);
    setCartDiscountType('amount');
    localStorage.removeItem('posCartItems');
    localStorage.removeItem('posCartDiscount');
    localStorage.removeItem('posCartDiscountType');
    localStorage.removeItem('posSelectedCustomer');
    setIsPaymentModalVisible(false);
    message.success("Payment processed successfully");
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (values) => {

    console.log(values);
    // console.log(values.originalPrice - values.finalPrice);
    // return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === editingItem.id ? { 
          ...item, 
          unit: values.unit,
          price: values.originalPrice,
          discount: values.discountType == 'percentage'? values.discount : (values.discountType == 'amount'?values.discountAmount:0),
          discount_amount: values.discountAmount || 0,
          discountType: values.discountType || 'amount',
        } : item
      )
      
    );
    
    console.log(cartItems);
    
    setIsEditModalVisible(false);
    message.success("Item updated successfully");
  };

  const handleApplyDiscount = (discount, type) => {
    setCartDiscount(discount);
    setCartDiscountType(type);
    setIsDiscountModalVisible(false);
    message.success(`Cart discount applied: ${type === 'percentage' ? `${discount}%` : `$${discount}`}`);
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleShiftView = () => {
    setViewShiftVisible(true);
  };

  const handleEditShift = () => {
    setEditShiftVisible(true);
  };

  const scrollCategories = (direction) => {
    if (categoryScrollerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoryScrollerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Component render
  const SuspendedOrdersTable = ({ className, onOrderLoaded }) => {
    const suspendedOrders = JSON.parse(localStorage.getItem('suspendedOrders') || '[]');

    const columns = [
      {
        title: 'Order ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Customer',
        key: 'customer',
        render: (_, record) => {
          const customer = customers.find(c => c.id === record.customer_id);
          return customer ? customer.username : 'N/A';
        }
      },
      {
        title: 'Price Type',
        dataIndex: 'price_type',
        key: 'price_type',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        render: (total) => `$${parseFloat(total).toFixed(2)}`,
      },
      {
        title: 'Date',
        key: 'date',
        render: (_, record) => new Date(record.created_at).toLocaleString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Button 
            type="primary" 
            onClick={(e) => {
              e.stopPropagation();
              loadSuspendedOrder(record.id);
            }}
          >
            Load Order
          </Button>
        ),
      }
    ];

    return (
      <Table
        className={className}
        columns={columns}
        dataSource={suspendedOrders}
        rowKey="id"
        pagination={false}
        scroll={{ y: 400 }}
        onRow={(record) => ({
          onClick: () => loadSuspendedOrder(record.id),
          style: { cursor: 'pointer', borderRadius: '0' }
        })}
        rowClassName={() => 'clickable-row'}
      />
    );
  };

  const PriceWarningModal = () => (
    <Modal
      title="Price Changes Detected"
      open={showPriceWarning}
      onCancel={() => setShowPriceWarning(false)}
      footer={[
        <Button key="ok" type="primary" onClick={() => setShowPriceWarning(false)}>
          OK
        </Button>
      ]}
    >
      <Alert
        message="Some product prices have changed since they were added to cart"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Table
        dataSource={Object.keys(priceDifferences).map(key => ({
          productId: key,
          productName: products.find(p => p.id === key)?.name || 'Unknown',
          ...priceDifferences[key]
        }))}
        columns={[
          { title: 'Product', dataIndex: 'productName', key: 'productName' },
          { title: 'Original Price', dataIndex: 'original', key: 'original', render: val => `$${val}` },
          { title: 'Current Price', dataIndex: 'current', key: 'current', render: val => `$${val}` },
          { 
            title: 'Difference', 
            key: 'difference',
            render: (_, record) => (
              <span style={{ color: record.difference > 0 ? 'red' : 'green' }}>
                {record.difference > 0 ? '+' : ''}{record.difference}
              </span>
            )
          }
        ]}
        size="small"
        pagination={false}
      />
    </Modal>
  );

const handleCreatePosSaleData = async () => {
  if (!selectedCustomer) {
    message.warning("Please select a customer before processing payment");
    return;
  }

  if (cartItems.length === 0) {
    message.warning("Please add items to cart first");
    return;
  }

  try {
    const paymentData = {
      customer_id: selectedCustomer.id,
      date: new Date().toISOString().split("T")[0],
      warehouse_id: userData.warehouse_id,
      shift_id: shiftId,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        discount: item.discount || 0,
        discount_type: item.discountType || 'percentage',
        total: item.price * item.quantity * (1 - (item.discount || 0) / 100)
      })),
      subtotal,
      discount: itemDiscountTotal + calculatedCartDiscount,
      discount_type: cartDiscountType,
      discount_value: cartDiscount,
      tax,
      delivery_fee: selectedDelivery?.price || 0,
      total,
      payment_method: selectedPayment,
      amount_paid: total,
      change_due: 0,
      currency: 'USD',
      sale_type: 'POS',
      amount: total
    };

    const response = await handlePosSaleCreate(paymentData, token);

    if (response.success) {
      message.success("Sale completed successfully!");

      // Prepare data for printing
      const printData = {
        sale: {
          ...response.sale,
          reference: response.sale?.reference || `POS-${Date.now()}`,
          subtotal,
          discount: itemDiscountTotal + calculatedCartDiscount,
          tax,
          delivery_fee: selectedDelivery?.price || 0,
          total,
          payment_method: selectedPayment,
          amount_paid: total,
          change_due: 0,
          user: userData
        },
        customer: selectedCustomer,
        items: cartItems
      };

      // Clear state
      setCartItems([]);
      setSelectedCustomer(null);
      setPriceType('retail_price');
      setSelectedDelivery(null);
      setCartDiscount(0);
      setCartDiscountType('amount');
      setNextPaymentDate(null);
      setNextPaymentAmount(0);

      localStorage.removeItem('posCartItems');
      localStorage.removeItem('posCartDiscount');
      localStorage.removeItem('posCartDiscountType');
      localStorage.removeItem('posSelectedCustomer');
      localStorage.removeItem('posNextPaymentDate');
      localStorage.removeItem('posNextPaymentAmount');

      // Auto-print the invoice
      printInvoice(printData);
    } else {
      throw new Error(response.message || 'Sale failed');
    }
  } catch (error) {
    message.error(error.message || 'Failed to complete sale. Please try again.');
    console.error('Sale error:', error);
  }
};
const printInvoice = (printData) => {
  // Create a hidden container for the receipt
  const receiptContainer = document.createElement('div');
  document.body.appendChild(receiptContainer);

  // Create a root and render the receipt
  const root = ReactDOM.createRoot(receiptContainer);
  root.render(
    <InvoiceTemplate 
      sale={printData.sale} 
      customer={printData.customer} 
      items={printData.items} 
    />
  );

  // Wait for rendering to complete
  setTimeout(() => {
    // Get the HTML content with thermal printer specific styles
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${printData.sale.reference}</title>
          <style>
            @page { size: 80mm; margin: 0; }
            body { 
              width: 80mm;
              margin: 0;
              padding: 3mm;
              font-family: monospace;
              font-size: 12px;
              -webkit-print-color-adjust: exact;
            }
            .receipt {
              width: 100%;
              word-wrap: break-word;
            }
            @media print {
              body { padding: 3mm; }
            }
          </style>
        </head>
        <body>
          ${receiptContainer.innerHTML}
        </body>
      </html>
    `;

    // Open a new window for printing
    const printWindow = window.open('', '_blank', 'width=300,height=500');
    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();

    // Print after content loads
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        // Clean up
        document.body.removeChild(receiptContainer);
      }, 500);
    };
  }, 500);
};



  return (
    <>
      <div
        style={{
          width: '100%',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#52c41a',
          padding: "0px 40px"
        }}
      >
        <Tooltip title="Back">
          <ArrowLeftOutlined onClick={handleBack} style={{ color: 'white', fontSize: '24px', cursor: 'pointer' }} />
        </Tooltip>

        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: "right" }}>
          <Tooltip title="Refresh Stock">
            <Button
              icon={<FiRefreshCw />}
              type="primary"
              shape="circle"
              size="large"
              style={{
                background: '#1890ff',
                borderColor: '#1890ff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
              }}
              onClick={handleRefreshStock}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Tooltip>
        </div>
        <div style={{ display: "flex", gap: "20px", padding: "10px" }}>
          {!isShiftOpen ? (
            <div>
              <Button 
                type="primary"
                icon={<UnlockOutlined style={{ fontSize: "20px" }} />}
                onClick={() => setShiftModalVisible(true)}
                shape="circle"
              />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Tooltip title="View Suspended Orders">
                  <Badge count={suspendedOrders.length} offset={[-2, 2]}>
                    <Button
                      icon={<PauseOutlined />}
                      type="primary"
                      shape="circle"
                      size="large"
                      style={{
                        background: '#1890ff',
                        borderColor: '#1890ff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => setIsSuspendedOrdersModalVisible(true)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </Badge>
                </Tooltip>
                <Tooltip title="View Shift">
                  <Button
                    icon={<EyeOutlined />}
                    type="primary"
                    shape="circle"
                    size="large"
                    style={{
                      background: '#1890ff',
                      borderColor: '#1890ff',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setViewShiftVisible(true)}  
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </Tooltip>

                {/* <Tooltip title="Edit Shift">
                  <Button
                    icon={<EditOutlined />}
                    type="default"
                    shape="circle"
                    size="large"
                    style={{
                      background: '#fff',
                      borderColor: '#d9d9d9',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={handleEditShift}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </Tooltip> */}
                <Tooltip title="Close Shift">
                  <Button
                    icon={<FiPower />}
                    type="default"
                    shape="circle"
                    size="large"
                    style={{
                      background: '#fff',
                      borderColor: '#ff4d4f',
                      color: '#ff4d4f',
                      boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={handleCloseShift}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 79, 0.6)';
                      e.currentTarget.style.backgroundColor = '#ff4d4f';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = '#d9363e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 77, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.color = '#ff4d4f';
                      e.currentTarget.style.borderColor = '#ff4d4f';
                    }}
                  />
                </Tooltip>
              </div>

              {/* <EditOpenShift
                open={editShiftVisible}
                onClose={() => setEditShiftVisible(false)}
                onSave={handleSaveEdit}
                shiftData={shiftData}
              /> */}
            </>
          )}

          
        </div>
      </div>
    
      <div className="pos-system">
        <div className="products-panel">
          <div className="control-bar">
            <motion.div 
              className="search-container"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchProductTerm}
                onChange={(e) => setSearchProductTerm(e.target.value)}
                className="search-input"
              />
            </motion.div>

            <div className="customer-select" ref={dropdownRef}>
              <motion.div 
                className="select-trigger"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsOpen(!isOpen);
                  setSearchProductTerm('');
                }}
              >
                <div className="customer-avatar">
                  <FiUser />
                </div>
                <span className="customer-name">
                  {selectedCustomer ? (
                    <>
                      {selectedCustomer.username}
                      <span className="group-name"> ({selectedCustomer?.group_name || 'WalkIn'})</span>                    </>
                  ) : (
                    "Select Customer"
                  )}
                </span>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="search-box">
                      <FiSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchCustomerTerm}
                        onChange={(e) => setSearchCustomerTerm(e.target.value)}
                        autoFocus
                      />
                      {searchCustomerTerm && (
                        <button 
                          className="clear-search"
                          onClick={() => setSearchCustomerTerm('')}
                        >
                          <FiX />
                        </button>
                      )}
                    </div>

                    <div className="options-list">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          
                          <motion.div
                            key={customer.id}
                            className={`option ${selectedCustomer?.id === customer.id ? 'selected' : ''}`}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                            onClick={() => handleSelect(customer)}
                          >
                            <div className="customer-info">
                              <div className="username">{customer.username}  ({customer.group_name})</div>
                              {customer.phone && (

                                <>
                                <div className="phone">{customer.phone}</div>
                                
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="no-results">
                          {searchCustomerTerm ? "No matching customers" : "No customers available"}
                        </div>
                      )}
                    </div>

                    <motion.div
                      className="add-option"
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                      onClick={() => {
                        setIsModalVisible(true);
                        setIsOpen(false);
                      }}
                    >
                      <FiPlus className="add-icon" />
                      <span>Add New Customer</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="categories-container" style={{ position: 'relative', padding: '8px 0' }}>
            <motion.button
              className="category-nav-btn"
              onClick={() => scrollCategories('left')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                left: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '50%',
                padding: '5px',
                zIndex: 1
              }}
            >
              <FiChevronLeft size={20} />
            </motion.button>

            <div 
              className="categories-scroller" 
              ref={categoryScrollerRef}
              style={{ 
                overflowX: 'auto', 
                whiteSpace: 'nowrap', 
                padding: '8px 30px',
                scrollbarWidth: 'none'
              }}
            >
              <motion.div
                className={`category-tag ${!selectedCategory ? "active" : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                style={{ display: 'inline-block', marginRight: '8px' }}
              >
                All Products
              </motion.div>
              {categories.map(category => (
                <motion.div
                  key={category.id}
                  className={`category-tag ${selectedCategory === category.name ? "active" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.name)}
                  style={{ display: 'inline-block', marginRight: '8px' }}
                >
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                </motion.div>
              ))}
            </div>

            <motion.button
              className="category-nav-btn"
              onClick={() => scrollCategories('right')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '50%',
                padding: '5px',
                zIndex: 1
              }}
            >
              <FiChevronRight size={20} />
            </motion.button>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading-products">
                <Spin size="large" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {getCurrentProducts().map(product => {
                  const isInCart = cartItems.some(item => item.id === product.id);
                  const price = product[priceType] || product.retail_price;
                  const discountedPrice = price * (1 - (product.discount || 0) / 100);
                  
                  return (
                    <motion.div
                      key={product.id}
                      className={`product-card ${isInCart ? "in-cart" : ""}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product)}
                      style={{ cursor: "pointer" }}
                    >
                      {isInCart && (
                        <motion.div 
                          className="in-cart-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <span>({cartItems.find(item => item.id === product.id)?.quantity || 1})</span>
                        </motion.div>
                      )}
                      
                      <div className="product-badges">
                        {product.discount> 0 && (
                          <div className="discount-badge">
                            <FiPercent size={12} />
                            <span>{product.discount}% OFF</span>
                          </div>
                        )}
                        <div className="stock-badge">
                          {product.stock} left
                        </div>
                      </div>
                      <div className="product-image">
                        {product.category === "Electronics" ? "💻" : 
                        product.category === "Clothing" ? "👕" : "🛒"}
                      </div>
                      <div className="product-details">
                        <div className="product-info" style={{display:"flex",justifyContent:"space-between"}}>
                          <h3 className="product-name">{product.name}</h3>
                          <p style={{fontSize:12}}>{product.code}</p>
                        </div>
                        <div className="product-pricing" >
                          <div style={{display:'flex',flexDirection:"column"}}>
                            <span className="retail-price" style={{fontSize:10}}>
                              OP ${product.retail_price.toFixed(2)}
                            </span>
                            <span className="current-price">
                              ${discountedPrice.toFixed(2)}
                            </span>
                          </div>
                          {product.discount > 0 && (
                            <span className="original-price">
                              ${price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <motion.div
                className="no-products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '700px',
                  minWidth: "1500px",
                  padding: '24px',
                  textAlign: 'center'
                }}
              >
                <div
                  className="no-products-icon"
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: '#8c8c8c',
                  }}
                >
                  🛒
                </div>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#595959',
                    margin: '0 0 16px 0',
                  }}
                >
                  No products found
                </p>
              </motion.div>
            )}
          </div>
          {filteredProducts.length > productsPerPage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1.5rem',
            }}>
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: currentPage === 1 ? '#ddd' : '#f0f0f0',
                  color: '#333',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  border: '1px solid #ccc'
                }}
              >
                <FiChevronLeft />
                Previous
              </Button>
              <span style={{ 
                fontSize: '14px', 
                color: '#fff',
                background: 'rgb(82, 196, 26)', 
                width: '200px', 
                display: 'inline-block', 
                textAlign: 'center',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                Page <strong>{currentPage}</strong> of <strong>{Math.ceil(filteredProducts.length / productsPerPage)}</strong>
              </span>
              <Button
                onClick={() =>
                  setCurrentPage(p =>
                    Math.min(Math.ceil(filteredProducts.length / productsPerPage), p + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(filteredProducts.length / productsPerPage)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: currentPage >= Math.ceil(filteredProducts.length / productsPerPage) ? '#ddd' : '#f0f0f0',
                  color: '#333',
                  cursor: currentPage >= Math.ceil(filteredProducts.length / productsPerPage) ? 'not-allowed' : 'pointer',
                  border: '1px solid #ccc'
                }}
              >
                Next
                <FiChevronRight />
              </Button>
            </div>
          )}
        </div>

        <div className="cart-panel">
          <div className="cart-header">
            <h2>Order Summary</h2>
            <div className="cart-tabs">
              <button 
                className={`cart-tab ${activeCartTab === 'items' ? 'active' : ''}`}
                onClick={() => setActiveCartTab('items')}
              >
                <FiShoppingCart />
                <span>Items ({cartItems.length})</span>
              </button>
              <button 
                className={`cart-tab ${activeCartTab === 'delivery' ? 'active' : ''}`}
                onClick={() => setActiveCartTab('delivery')}
              >
                <img
                  src="https://www.citypng.com/public/uploads/preview/fast-scooter-delivery-shipping-green-icon-transparent-png-701751695035mammal925qwavsg96sb.png"
                  alt="Delivery Icon"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                <span>Delivery</span>
              </button>
            </div>
          </div>

          <div className="cart-items-container">
            {activeCartTab === 'items' ? (
              cartItems.length > 0 ? (
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="item-image">
                        {item.category === "Electronics" ? "💻" : 
                        item.category === "Clothing" ? "👕" : "🛒"}
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <div className="item-pricing">
                          <span className="item-price">
                            ${(
                              item.discountType === "percentage"
                                ? item.price * (1 - (item.discount || 0) / 100)
                                : item.price - (item.discount || 0)
                            ).toFixed(2)}
                          </span>

                          {item.discount > 0 ? (
                            item.discountType === "percentage" ? (
                              <span className="item-discount">
                                Save ${(item.price * (item.discount || 0) / 100).toFixed(2)}
                              </span>
                            ) : (
                              <span className="item-discount">
                                Save ${item.discount.toFixed(2)}
                              </span>
                            )
                          ) : null}


                        </div>
                        <div className="item-quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity - 1);
                            }}
                          >
                            −
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                      >
                        <FiX />
                      </button>
                      <button  
                        style={{ marginTop: "50px" }}
                        className="edit-item-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}        
                      >
                        <EditOutlined />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  className="empty-cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiShoppingCart size={48} className="empty-cart-icon" />
                  <h3>Your cart is empty</h3>
                  <p>Add products to get started</p>
                </motion.div>
              )
            ) : (
              <div className="delivery-options">
                <h3>Select Delivery Method</h3>
                {deliveryOptions.map(option => (
                  <motion.div
                    key={option.id}
                    className={`delivery-option ${selectedDelivery?.id === option.id ? 'selected' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDelivery(option)}
                  >
                    <div className="delivery-info">
                      <h4>{option.name}</h4>
                      <div className="delivery-details">
                        <span className="delivery-price">
                          {option.price > 0 ? `$${option.price.toFixed(2)}` : 'FREE'}
                        </span>
                        <span className="delivery-time">{option.estimated}</span>
                      </div>
                    </div>
                    {selectedDelivery?.id === option.id && (
                      <div className="delivery-selected-icon">✓</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row discount">
              <span>Item Discounts</span>
              <span>-${itemDiscountTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row discount">
              <span>Cart Discount</span>
              <span>
                -{cartDiscountType === 'percent' ? `${cartDiscount}%` : `$${calculatedCartDiscount.toFixed(2)}`}
              </span>
            </div>
            {selectedDelivery && (
              <div className="summary-row delivery">
                <span>Delivery ({selectedDelivery.name})</span>
                <span>${selectedDelivery.price.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row tax">
              <span>Tax (0%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {nextPaymentAmount > 0 && nextPaymentDate && (
              <div className="summary-row next-payment">
                <span>Next Payment</span>
                <span>${nextPaymentAmount.toFixed(2)} due on {nextPaymentDate}</span>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between"}}>
              <motion.button
                className="apply-discount-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDiscountModalVisible(true)}
                style={{
                  background: "#52c41a",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <FiPercent />
                Cart Discount
              </motion.button>
                {/* <FiPercent />
                Select Payment
              </motion.button> */}

              <div style={{ maxWidth: 300,marginTop:12 }}>
                <Select
                  placeholder="Select payment method"
                  onChange={handleChange}
                  value={selectedPayment || undefined}
                  style={{
                    width: "100%",
                    maxWidth: 200,
                    minWidth: 200,
                  }}
                  size="large"
                  optionLabelProp="label"
                >
                  <Option value="Cash" label="Cash">
                    <DollarOutlined style={{ marginRight: 8 }} />
                    Cash
                  </Option>
                  <Option value="ABA" label="ABA">
                    <BankOutlined style={{ marginRight: 8 }} />
                    ABA
                  </Option>
                  <Option value="AC" label="AC">
                    <WalletOutlined style={{ marginRight: 8 }} />
                    AC
                  </Option>
                  <Option value="Bakong" label="Bakong">
                    <BankOutlined style={{ marginRight: 8 }} />
                    Bakong
                  </Option>
                  <Option value="VISA" label="VISA">
                    <CreditCardOutlined style={{ marginRight: 8 }} />
                    VISA
                  </Option>
                  <Option value="Mastercard" label="Mastercard">
                    <CreditCardOutlined style={{ marginRight: 8 }} />
                    Mastercard
                  </Option>
                </Select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              style={{ background: "red", width: "25%" }}
              className="checkout-btn"
              disabled={cartItems.length === 0}
              whileHover={cartItems.length > 0 ? { scale: 1.02 } : {}}
              whileTap={cartItems.length > 0 ? { scale: 0.98 } : {}}
              onClick={suspendOrder}
            >
              Suspend
            </motion.button>
            
            <motion.button
              className="checkout-btn"
              style={{ width: "65%" }}
              disabled={cartItems.length === 0}
              whileHover={cartItems.length > 0 ? { scale: 1.02 } : {}}
              whileTap={cartItems.length > 0 ? { scale: 0.98 } : {}}
              onClick={() => {
                if (!selectedCustomer) {
                  message.warning("Please select a customer before processing payment");
                  return;
                }
                handleProceedToPayment();
              }}
            >
              {selectedDelivery ? (
                <>
                  Pay ${total.toFixed(2)} ({selectedDelivery.name})
                </>
              ) : (
                `Checkout ($${total.toFixed(2)})`
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isModalVisible && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalVisible(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Add New Customer</h3>
                  <button
                    className="modal-close-btn"
                    onClick={() => setIsModalVisible(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => setIsModalVisible(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-btn"
                    onClick={handleAddCustomer}
                    disabled={!newCustomerName.trim()}
                  >
                    Save Customer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PriceWarningModal />

        <Modal
          title="Suspended Orders"
          open={isSuspendedOrdersModalVisible}
          onCancel={() => setIsSuspendedOrdersModalVisible(false)}
          footer={null}
          width="60%"
          centered
          styles={{
            mask: { background: 'rgba(0, 0, 0, 0.6)' },
          }}
        >
          {suspendedOrders.length > 0 ? (
            <SuspendedOrdersTable 
              className="no-radius-table" 
              onOrderLoaded={() => setSuspendedOrders(JSON.parse(localStorage.getItem('suspendedOrders') || []))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>No suspended orders found.</p>
            </div>
          )}
        </Modal>

        <Modal
          style={{ body:{height: 'auto', maxHeight: '80vh', overflowY: 'auto' }}}
          open={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          footer={null}
          width="80%"
          centered
          styles={{
            mask: { background: 'rgba(0, 0, 0, 0.6)' },
          }}
        >
          <PaymentPos
            order={{
              items: cartItems,
              customer: selectedCustomer,
              subtotal,
              discountTotal: itemDiscountTotal + calculatedCartDiscount,
              tax,
              delivery: selectedDelivery,
              total
            }}
            onClose={() => setIsPaymentModalVisible(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Modal>

        <Modal
          title="Apply Cart Discount"
          open={isDiscountModalVisible}
          onCancel={() => setIsDiscountModalVisible(false)}
          footer={null}
          centered
        >
          <AddDiscountModal
            subtotal={subtotal - itemDiscountTotal}
            initialDiscount={cartDiscount}
            initialDiscountType={cartDiscountType}
            onSubmit={handleApplyDiscount}
          />
        </Modal>

        <EditItemModal
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          onSubmit={(data) => {
            handleSaveEdit(data);
            setIsEditModalVisible(false);
          }}
          initialValues={{
            price: editingItem?.price || 0,
            discount: editingItem?.discount || 0,
            discountType: editingItem?.discountType || 'amount',
          }}
        />


        <OpenShiftModal
          visible={shiftModalVisible}
          onClose={() => setShiftModalVisible(false)}
          onShiftOpen={handleOpenShift}
        />

        <ViewShiftModal
          open={viewShiftVisible}
          onClose={() => setViewShiftVisible(false)}
          shiftId={shiftId}
          warehouseId={userData.warehouse_id}
          token={token}
        />

        <CloseShiftModal
          visible={isCloseShiftModal}
          onClose={() => setIsCloseShiftModal(false)}
          onConfirm={handleCloseShift}
          shiftId={shiftId}
          shiftData={shiftData}
        />
      </div>
    </>
  );
}

function AddDiscountModal({ subtotal, initialDiscount, initialDiscountType, onSubmit, onCancel }) {
  const [discount, setDiscount] = useState(initialDiscount);
  const [discountType, setDiscountType] = useState(initialDiscountType);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const maxDiscount = discountType === 'percent' ? 100 : subtotal;
    if (discount < 0) {
      setError('Discount cannot be negative');
      return;
    }
    if (discount > maxDiscount) {
      setError(`Discount cannot exceed ${discountType === 'percent' ? '100%' : `$${subtotal.toFixed(2)}`}`);
      return;
    }
    setError('');
    onSubmit(discount, discountType);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label>Discount Type</label>
        <Select
          value={discountType}
          onChange={setDiscountType}
          style={{ width: '100%', marginTop: '8px' }}
        >
          <Select.Option value="amount">Amount ($)</Select.Option>
          <Select.Option value="percent">Percentage (%)</Select.Option>
        </Select>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label>Discount Value</label>
        <Input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          placeholder={discountType === 'percent' ? 'Enter percentage' : 'Enter amount'}
          style={{ marginTop: '8px' }}
        />
        {error && <Alert message={error} type="error" showIcon style={{ marginTop: '8px' }} />}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>Apply</Button>
      </div>
    </div>


  );
}

export default PosAdd;