import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiUser,
  FiChevronDown,
  FiPercent,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiPower,
} from "react-icons/fi";
import {
  ShopOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  PoweroffOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  PauseOutlined,
  EditOutlined,
  MenuOutlined,
  LockOutlined,
  StopOutlined,
  CloseCircleOutlined,
  UnlockOutlined,
  DollarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Tooltip,
  Drawer,
  message,
  Button,
  Input,
  Modal,
  Alert,
  Table,
  Badge,
  Spin,
  Select,
  Space,
  Form,
  Radio,
} from "antd";
import Cookies from "js-cookie";
import "./AddPos.css";
import { motion, AnimatePresence } from "framer-motion";
import { useProductTerm } from "../../hooks/UserProductTerm";
import { useUser } from "../../hooks/UserUser";
import OpenShiftModal from "../../components/pos/shift/OpenShift";
import CloseShiftModal from "../../components/pos/shift/CloseShift";
import ViewShiftModal from "../../components/pos/shift/ViewShift";
import { useStock } from "../../hooks/UseStock";
import { useSale } from "../../hooks/UseSale";
import InvoiceTemplate from "./InvoiceTemplate";
import ReactDOM from "react-dom/client";
import dayjs from "dayjs";
import ProductSearchModal from "../../components/pos/add/ProductSearchModal";
const { Option } = Select;

const paymentOptions = [
  { name: "Cash", icon: <DollarOutlined /> },
  { name: "ABA", icon: <BankOutlined /> },
  { name: "AC", icon: <WalletOutlined /> },
  { name: "Bakong", icon: <BankOutlined /> },
];

function PosAdd() {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [paidAmount, setPaidAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const { handleProducts, handleCategories } = useProductTerm();
  const { handleSuspandCreate, handleSuspendDelete, handleGetSuspends } =
    useStock();
  const {
    handleGetOneOpenShift,
    handleGetOneProcessingShift,
    handlePosSaleCreate,
  } = useSale();
  const {
    handleCustomerQuickCreate,
    handleCustomers,
    handleGetCustomerGroup,
    handleEmployee,
  } = useUser();
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCloseShiftModal, setIsCloseShiftModal] = useState(false);
  const productsPerPage = 10;
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const printRef = useRef();
  const formatNumber = (num, decimals = 3) => {
    return parseFloat(num.toFixed(decimals)).toString();
  };

  const [selectedCustomer, setSelectedCustomer] = useState(() => {
    const savedCustomer = localStorage.getItem("posSelectedCustomer");
    try {
      return savedCustomer ? JSON.parse(savedCustomer) : null;
    } catch (error) {
      return null;
    }
  });
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [salepersons, setSalePersons] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [customerGroup, setCustomerGroup] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [priceType, setPriceType] = useState("retail_price");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerJob, setNewCustomerJob] = useState("");
  const [customers, setCustomers] = useState([]);
  const [change_due, setChange_due] = useState(0);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("posCartItems");
    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });
  const [payments, setPayments] = useState(() => {
    const savedPayments = localStorage.getItem("posPayments");
    try {
      return savedPayments ? JSON.parse(savedPayments) : [];
    } catch (error) {
      return [];
    }
  });
  const [isPaymentHistoryModalVisible, setIsPaymentHistoryModalVisible] =
    useState(false);
  const [shiftData, setShiftData] = useState(null);
  const [viewShiftVisible, setViewShiftVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [shiftAmount, setShiftAmount] = useState("");
  const [showShiftForm, setShowShiftForm] = useState(false);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(Cookies.get("user") || "{}");
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(
    Cookies.get("is_open_shift") === "true"
  );
  const [isViewShiftVisible, setIsViewShiftVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductSearchModalVisible, setIsProductSearchModalVisible] =
    useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([
    { id: 1, name: "Standard Delivery", price: 5.99, estimated: "2-3 days" },
    { id: 2, name: "Express Delivery", price: 9.99, estimated: "1 day" },
    { id: 3, name: "In-Store Pickup", price: 0, estimated: "Ready in 1 hour" },
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [cartDiscount, setCartDiscount] = useState(() => {
    try {
      const saved = localStorage.getItem("posCartDiscount");
      const parsed = saved ? JSON.parse(saved) : 0;
      return typeof parsed === "number" && parsed >= 0 ? parsed : 0;
    } catch (err) {
      return 0;
    }
  });
  const [cartDiscountType, setCartDiscountType] = useState(() => {
    try {
      const saved = localStorage.getItem("posCartDiscountType");
      const parsed = saved ? JSON.parse(saved) : "amount";
      return ["amount", "percent"].includes(parsed) ? parsed : "amount";
    } catch (err) {
      return "amount";
    }
  });
  const handleRemovePayment = (index) => {
    Modal.confirm({
      title: "Remove Payment",
      content: "Are you sure you want to remove this payment?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        setPayments((prev) => {
          const updatedPayments = prev.filter((_, i) => i !== index);
          localStorage.setItem("posPayments", JSON.stringify(updatedPayments));
          message.success("Payment removed successfully");
          return updatedPayments;
        });
      },
    });
  };
  const [nextPaymentDate, setNextPaymentDate] = useState(() => {
    const savedDate = localStorage.getItem("posNextPaymentDate");
    try {
      return savedDate ? JSON.parse(savedDate) : null;
    } catch (error) {
      return null;
    }
  });
  const [nextPaymentAmount, setNextPaymentAmount] = useState(() => {
    const savedAmount = localStorage.getItem("posNextPaymentAmount");
    try {
      const parsedAmount = savedAmount ? JSON.parse(savedAmount) : 0;
      return typeof parsedAmount === "number" && parsedAmount >= 0
        ? parsedAmount
        : 0;
    } catch (error) {
      return 0;
    }
  });
  const [priceDifferences, setPriceDifferences] = useState({});
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [shouldFetchProducts, setShouldFetchProducts] = useState(
    !localStorage.getItem("posProducts")
  );
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("posProducts");
    try {
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch (error) {
      return [];
    }
  });
  const [suspendedOrders, setSuspendedOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("suspendedOrders")) || [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSuspendedOrdersModalVisible, setIsSuspendedOrdersModalVisible] =
    useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [shiftId, setShiftId] = useState(() => {
    return Cookies.get("shift_id") || Cookies.get("shift-id") || undefined;
  });
  const EXCHANGE_RATE = 4050;

  const handleKeyDown = (e, currency) => {
    if (e.key === "Enter") {
      let amount = parseFloat(inputAmount) || 0;
      if (amount <= 0) {
        message.warning("Please enter a valid payment amount");
        return;
      }
      // Round KHR amounts to the nearest 100
      if (currency === "KHR") {
        amount = roundToNearest100(amount);
      }
      const usdAmount = currency === "KHR" ? amount / EXCHANGE_RATE : amount;
      const newPayment = {
        method: selectedPaymentMethod,
        amount: usdAmount,
        currency,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };
      setPayments((prev) => {
        const updatedPayments = [...prev, newPayment];
        localStorage.setItem("posPayments", JSON.stringify(updatedPayments));
        return updatedPayments;
      });
      setInputAmount("");
      setActiveCurrency(currency);
      message.success(
        `Added ${currency === "USD" ? "$" : "៛"}${
          currency === "USD" ? amount.toFixed(2) : amount.toFixed(0)
        } payment via ${selectedPaymentMethod}`
      );
    }
  };

  const roundToNearest10 = (amount) => {
    return Math.floor(amount / 10) * 10;
  };

  const handleFocus = (currency) => {
    if (!selectedCustomer) {
      message.warning("Please select customer");
      return;
    }
    setActiveCurrency(currency);
    if (!inputAmount) {
      if (currency === "KHR") {
        const khrAmount = roundToNearest100(total * EXCHANGE_RATE);
        setInputAmount(khrAmount.toFixed(0));
      } else {
        setInputAmount(total.toFixed(2));
      }
    } else {
      const parsedAmount = parseFloat(inputAmount) || 0;
      if (currency === "KHR" && activeCurrency === "USD") {
        const khrAmount = roundToNearest100(parsedAmount * EXCHANGE_RATE);
        setInputAmount(khrAmount.toFixed(0));
      } else if (currency === "USD" && activeCurrency === "KHR") {
        setInputAmount((parsedAmount / EXCHANGE_RATE).toFixed(2));
      }
    }
  };
  const EditItemModal = ({ visible, onCancel, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [discountType, setDiscountType] = useState(
      initialValues?.discountType || "amount"
    );
    const [price, setPrice] = useState(initialValues?.current_price || 0);
    const [discount, setDiscount] = useState(initialValues?.discount || 0);

    useEffect(() => {
      if (visible) {
        form.setFieldsValue({
          price: initialValues?.current_price || 0,
          discount: initialValues?.discount || 0,
          discountType: initialValues?.discountType || "amount",
          quantity: initialValues?.quantity || 1,
        });
        setDiscountType(initialValues?.discountType || "amount");
        setPrice(initialValues?.current_price || 0);
        setDiscount(initialValues?.discount || 0);
      }
    }, [visible, initialValues]);

    const handleDiscountTypeChange = (e) => {
      setDiscountType(e.target.value);
      form.setFieldsValue({ discount: 0 });
      setDiscount(0);
    };

    const calculateDiscountedPrice = () => {
      if (discountType === "percentage") {
        return price * (1 - discount / 100);
      } else if (discountType === "amount") {
        return Math.max(0, price - discount);
      }
      return price;
    };

    const handleSubmit = () => {
      form.validateFields().then((values) => {
        onSubmit({
          ...values,
          finalPrice: calculateDiscountedPrice(),
        });
      });
    };

    return (
      <Modal
        title="Edit Item"
        visible={visible}
        onCancel={onCancel}
        onOk={handleSubmit}
        okText="Save Changes"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Product Name">
            <Input value={initialValues?.name} disabled />
          </Form.Item>
          <Form.Item
            label="Selling Price"
            name="price"
            rules={[{ required: true, message: "Please enter selling price" }]}
          >
            <Input
              prefix="$"
              type="number"
              min="0"
              step="0.01"
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            />
          </Form.Item>
          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <Input type="number" min="1" />
          </Form.Item>
          <Form.Item label="Discount Type" name="discountType">
            <Radio.Group
              onChange={handleDiscountTypeChange}
              value={discountType}
            >
              <Radio value="amount">Amount ($)</Radio>
              <Radio value="percentage">Percentage (%)</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              discountType === "percentage"
                ? "Discount Percentage"
                : "Discount Amount"
            }
            name="discount"
            rules={[
              { required: true, message: "Please enter discount" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (discountType === "percentage") {
                    if (value >= 0 && value <= 100) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Discount must be between 0-100%")
                    );
                  } else {
                    if (value >= 0 && value <= getFieldValue("price")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        `Discount cannot exceed $${getFieldValue("price")}`
                      )
                    );
                  }
                },
              }),
            ]}
          >
            <Input
              prefix={discountType === "percentage" ? "%" : "$"}
              type="number"
              min="0"
              max={discountType === "percentage" ? 100 : undefined}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </Form.Item>
          <Form.Item label="Final Price">
            <Input
              value={`$${calculateDiscountedPrice().toFixed(2)}`}
              disabled
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const handleSalespersonChange = (selectedId) => {
    const selectedPerson = salepersons.find(
      (person) => person.id === selectedId
    );
    setSelectedSalesperson(selectedPerson);
  };

  const handleChange = (value) => {
    setSelectedPayment(value);
  };

  const handleChangePrice = () => {};

  const handleConfirm = (selectedItems) => {
    setSelectedProducts(selectedItems);
    setModalVisible(false);
  };

  const getPriceTypeFromCustomerGroup = (group) => {
    const normalizedGroup = group?.toLowerCase().replace(/[^a-z]/g, "");

    switch (normalizedGroup) {
      case "vipcustomer":
        return "vip_price";
      case "depotcustomer":
        return "depot_price";
      case "dealercustomer":
        return "dealer_price";
      case "walkincustomer":
        return "retail_price";
      default:
        return "retail_price";
    }
  };

  const getCurrentProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const filteredCustomers =
    customers?.filter(
      (customer) =>
        customer?.username
          ?.toLowerCase()
          .includes(searchCustomerTerm.toLowerCase()) ||
        (customer?.phone &&
          customer.phone
            .toLowerCase()
            .includes(searchCustomerTerm.toLowerCase()))
    ) || [];

  const filteredProducts = products.filter((product) => {
    const name = product.name?.toLowerCase() || "";
    const code = product.code?.toLowerCase() || "";
    const matchesSearch =
      name.includes(searchProductTerm.toLowerCase()) ||
      code.includes(searchProductTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.current_price * item.quantity,
    0
  );
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

  const calculatedCartDiscount =
    cartDiscountType === "percent"
      ? (subtotal - itemDiscountTotal) * (cartDiscount / 100)
      : cartDiscount;
  const tax = subtotal * 0;
  const deliveryFee = selectedDelivery?.price || 0;
  const total =
    subtotal - itemDiscountTotal - calculatedCartDiscount + tax + deliveryFee;
  const totalPaidAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  useEffect(() => {
    const fetchShiftData = async () => {
      if (!userData?.warehouse_id || !token) {
        return;
      }

      try {
        const result = await handleGetOneProcessingShift(
          userData.warehouse_id,
          token
        );
        if (result?.success && result.shift) {
          Cookies.set("shift_id", result.shift.id);
          Cookies.set("is_open_shift", true);
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
    getCustomerGroup();

    fetchShiftData();
  }, [userData?.warehouse_id, token]);

  useEffect(() => {
    localStorage.setItem("posCartItems", JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setCartDiscount(0);
      setCartDiscountType("amount");
      localStorage.setItem("posCartDiscount", JSON.stringify(0));
      localStorage.setItem("posCartDiscountType", JSON.stringify("amount"));
    }
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("posCartDiscount", JSON.stringify(cartDiscount));
    localStorage.setItem(
      "posCartDiscountType",
      JSON.stringify(cartDiscountType)
    );
  }, [cartDiscount, cartDiscountType]);

  useEffect(() => {
    localStorage.setItem(
      "posSelectedCustomer",
      JSON.stringify(selectedCustomer)
    );
    if (selectedCustomer) {
      const newPriceType = getPriceTypeFromCustomerGroup(
        selectedCustomer.group_name
      );
      setPriceType(newPriceType);
      message.info(
        `${newPriceType.replace("_price", "").toUpperCase()} pricing applied`
      );
    } else {
      setPriceType("retail_price");
    }
  }, [selectedCustomer]);

  useEffect(() => {
    localStorage.setItem("posNextPaymentDate", JSON.stringify(nextPaymentDate));
  }, [nextPaymentDate]);

  useEffect(() => {
    localStorage.setItem(
      "posNextPaymentAmount",
      JSON.stringify(nextPaymentAmount)
    );
  }, [nextPaymentAmount]);

  useEffect(() => {
    localStorage.setItem("posPayments", JSON.stringify(payments));
    setPaidAmount(totalPaidAmount);
  }, [payments, totalPaidAmount]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await handleCustomerData();
      await handleEmployeeData();
    };

    fetchInitialData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchCustomerTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shouldFetchProducts]);

  useEffect(() => {
    const disableEsc = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", disableEsc);

    return () => {
      window.removeEventListener("keydown", disableEsc);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchProductTerm, selectedCategory]);

  const handleEmployeeData = async () => {
    let result = await handleEmployee(token);
    if (result.success) {
      setSalePersons(result.employees);
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
      const result = await handleGetSuspends(
        userData.warehouse_id,
        shiftId,
        token
      );
      if (result?.success) {
        const orders = result.suspands || [];
        localStorage.setItem("suspendedOrders", JSON.stringify(orders));
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

      let result = await handleGetOneOpenShift(
        shiftId,
        userData.warehouse_id,
        token
      );

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

  const addToCart = (product) => {
    if (!isShiftOpen) {
      message.warning("Please open a shift before adding products");
      return;
    }

    let price =
      parseFloat(product[priceType]) || parseFloat(product.current_price) || 0;
    if (isNaN(price) || price < 0) {
      price = 0;
      message.warning(
        `Price missing for ${product.name || "product"}. Set to $0.00.`
      );
    }

    const currentPrice = price;
    const originalPrice = parseFloat(product.currentPrice) || currentPrice;

    if (currentPrice !== originalPrice) {
      setPriceDifferences((prev) => ({
        ...prev,
        [product.id]: {
          original: originalPrice,
          current: currentPrice,
          difference: (currentPrice - originalPrice).toFixed(2),
        },
      }));
      setShowPriceWarning(true);
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                original_price: originalPrice,
                current_price: currentPrice,
              }
            : item
        );
      }

      let discount = parseFloat(product.discount) || 0;
      if (isNaN(discount) || discount < 0 || discount > 100) {
        discount = 0;
      }

      return [
        ...prev,
        {
          ...product,
          price: currentPrice,
          current_price: currentPrice,
          original_price: originalPrice,
          quantity: 1,
          unit: product.unit_code || "pcs",
          discount: discount,
          discountType: "amount",
          price_type: priceType,
        },
      ];
    });
    message.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== productId);
      if (updatedItems.length === 0) {
        // Clear payment-related data if cart becomes empty
        setPayments([]);
        setInputAmount("");
        setNextPaymentDate(null);
        setNextPaymentAmount(0);
        setIsPaymentModalVisible(false);
        localStorage.removeItem("posPayments");
        localStorage.removeItem("posNextPaymentDate");
        localStorage.removeItem("posNextPaymentAmount");
      }
      return updatedItems;
    });
    message.success("Item removed from cart");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems((prev) => {
        const updatedItems = prev.filter((item) => item.id !== productId);
        if (updatedItems.length === 0) {
          // Clear payment-related data if cart becomes empty
          setPayments([]);
          setInputAmount("");
          setNextPaymentDate(null);
          setNextPaymentAmount(0);
          setIsPaymentModalVisible(false);
          localStorage.removeItem("posPayments");
          localStorage.removeItem("posNextPaymentDate");
          localStorage.removeItem("posNextPaymentAmount");
        }
        return updatedItems;
      });
      message.success("Item removed from cart");
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartDiscount(0);
    setCartDiscountType("amount");
    setSelectedCustomer(null);
    setPriceType("retail_price");
    setNextPaymentDate(null);
    setNextPaymentAmount(0);
    setPayments([]);
    localStorage.removeItem("posCartItems");
    localStorage.removeItem("posCartDiscount");
    localStorage.removeItem("posCartDiscountType");
    localStorage.removeItem("posSelectedCustomer");
    localStorage.removeItem("posNextPaymentDate");
    localStorage.removeItem("posNextPaymentAmount");
    localStorage.removeItem("posPayments");
    message.success("Cart cleared successfully");
  };

  const handleSelect = (customer) => {
    setIsUpdatingPrices(true);
    setSelectedCustomer(customer);
    setIsOpen(false);
    setSearchCustomerTerm("");

    const updatedItems = changePriceByCustomerType(
      customer.group_name || "walkin"
    );
    localStorage.setItem("posCartItems", JSON.stringify(updatedItems));
    setCartItems(updatedItems);
    setIsUpdatingPrices(false);
  };

  const changePriceByCustomerType = (customerGroup) => {
    let cartItems = localStorage.getItem("posCartItems");

    if (cartItems) {
      try {
        let items = JSON.parse(cartItems);
        items = items.map((item) => {
          let price;
          const group = customerGroup ? customerGroup.toLowerCase() : "walkin";
          switch (group) {
            case "dealer customer":
              price = item.dealer_price || item.price;
              break;
            case "vip customer":
              price = item.vip_price || item.price;
              break;
            case "walkin":
            default:
              price = item.retail_price || item.price;
          }
          return {
            ...item,
            current_price: price,
            originalPrice: price,
            original_price: price,
            priceType: group,
          };
        });
        localStorage.setItem("posCartItems", JSON.stringify(items));
        return items;
      } catch (error) {
        console.error("Error processing cart items:", error);
        return [];
      }
    }

    return [];
  };

  const getCustomerGroup = async () => {
    const customerGroup = await handleGetCustomerGroup(token);
    if (customerGroup) {
      setGroupOptions(customerGroup.groups);
    }
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
        customer_group: customerGroup,
        job: newCustomerJob.trim(),
      };

      let result = await handleCustomerQuickCreate(newCustomer, token);
      if (result?.success) {
        message.success("Customer added successfully");
        setCustomers((prev) => [...prev, result.customer]);
        setSelectedCustomer(result.customer);
        setIsModalVisible(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
        setNewCustomerJob("");
      } else {
        message.error(result?.message || "Failed to add customer");
      }
    } catch (error) {
      message.error("Error adding customer");
    }
  };

  const handleOpenShift = (amount, newShiftId) => {
    if (!amount) {
      message.warning("Please enter starting amount");
      return;
    }

    setShiftId(newShiftId);
    setShiftOpen(true);
    setShowShiftForm(false);
  };

  const handleCloseShift = async () => {
    setIsCloseShiftModal(true);
  };

  const handleRefreshStock = async () => {
    setShouldFetchProducts(true);
  };

  const suspendOrder = async () => {
    if (!isShiftOpen) {
      message.warning("Please open a shift to suspend an order");
      return;
    }
    if (cartItems.length === 0) {
      message.warning("Cart is empty. Add items to suspend an order");
      return;
    }
    if (!selectedCustomer) {
      message.warning("Please select a customer to suspend the order");
      return;
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.current_price * item.quantity,
      0
    );

    const itemDiscountTotal = cartItems.reduce((sum, item) => {
      const { current_price, quantity, discount = 0, discountType } = item;

      let discountValue = 0;

      if (discountType === "percentage") {
        discountValue = current_price * quantity * (discount / 100);
      } else if (discountType === "amount") {
        discountValue = discount * quantity;
      }

      return sum + discountValue;
    }, 0);

    const calculatedCartDiscount =
      cartDiscountType === "percent"
        ? (subtotal - itemDiscountTotal) * (cartDiscount / 100)
        : cartDiscount;
    const tax = subtotal * 0;
    const deliveryFee = selectedDelivery?.price || 0;
    const total =
      subtotal - itemDiscountTotal - calculatedCartDiscount + tax + deliveryFee;

    const newSuspendedOrder = {
      customer_id: selectedCustomer.id,
      price_type: priceType,
      items: cartItems.map((item) => ({
        product_id: item.id,
        price: item.current_price,
        quantity: item.quantity,
        discount: item.discount || 0,
        discount_type: item.discountType || "amount",
        total:
          item.current_price * item.quantity * (1 - (item.discount || 0) / 100),
      })),
      subtotal,
      total_discount: itemDiscountTotal + calculatedCartDiscount,
      discount_type: cartDiscountType,
      discount: cartDiscount,
      tax,
      total,
      open_shift_id: shiftId,
    };

    try {
      const response = await handleSuspandCreate(
        newSuspendedOrder,
        userData.warehouse_id,
        token
      );
      if (response?.success) {
        setCartItems([]);
        setSelectedCustomer(null);
        setPriceType("retail_price");
        setSelectedDelivery(null);
        setCartDiscount(0);
        setCartDiscountType("amount");
        setNextPaymentDate(null);
        setNextPaymentAmount(0);
        setPayments([]);

        await fetchSuspendedOrders();
        message.success("Order suspended successfully");
      } else {
        throw new Error(response?.message || "Failed to suspend order");
      }
    } catch (error) {
      message.error(error.message || "Failed to suspend order");
    }
  };

  const loadSuspendedOrder = async (orderId) => {
    try {
      const suspendedOrders = JSON.parse(
        localStorage.getItem("suspendedOrders") || "[]"
      );
      const order = suspendedOrders.find((o) => o.id === orderId);

      if (!order) {
        message.error("Order not found");
        return;
      }

      Modal.confirm({
        title: "Load Suspended Order",
        content: "This will replace your current cart. Continue?",
        okText: "Yes, Load Order",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            const customer = customers.find((c) => c.id === order.customer_id);
            if (customer) {
              setSelectedCustomer(customer);
            } else {
              message.warning(
                "Original customer not found, please select a new one"
              );
            }

            setPriceType(order.price_type || "retail_price");

            const items = order.items.map((item) => {
              return {
                // ...product,
                id: item.product_id,
                name: item?.product?.name || `Product ${item.product_id}`,
                price: item.price,
                current_price: item.price,
                original_price: item.price,
                quantity: item.quantity,
                discount: item.discount || 0,
                discountType: item.discount_type || "amount",
                unit: item.product?.unit_code || "pcs",
                price_type: order.price_type,
              };
            });

            setCartItems(items);
            setCartDiscount(order.discount_value || 0);
            setCartDiscountType(order.discount_type || "amount");

            if (order.delivery_option) {
              const delivery = deliveryOptions.find(
                (d) => d.id === order.delivery_option
              );
              setSelectedDelivery(delivery || null);
            }
            const updatedSuspendedOrders = suspendedOrders.filter(
              (o) => o.id !== orderId
            );
            localStorage.setItem(
              "suspendedOrders",
              JSON.stringify(updatedSuspendedOrders)
            );
            await handleSuspendDelete(orderId, token);
            message.success("Suspended order loaded into cart");
            setIsSuspendedOrdersModalVisible(false);
          } catch (error) {
            message.error("Failed to load order details");
          }
        },
      });
    } catch (error) {
      message.error("Failed to load order");
    }
  };
  function roundToNearest100(amount) {
    return Math.round(amount / 100) * 100;
  }

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
    if (totalPaidAmount <= 0) {
      message.warning("Please add payment!");
      return;
    }
    handleRefreshStock();
    handleCreatePosSaleData();
  };

  const handlePaymentSuccess = (totalPaid) => {
    if (totalPaid < total) {
      const remainingBalance = total - totalPaid;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      const formattedNextDate = nextDate.toISOString().split("T")[0];
      setNextPaymentAmount(remainingBalance);
      setNextPaymentDate(formattedNextDate);
      message.warning(
        `Partial payment received. Remaining $${remainingBalance.toFixed(
          2
        )} due on ${formattedNextDate}`
      );
    } else {
      setNextPaymentAmount(0);
      setNextPaymentDate(null);
      localStorage.removeItem("posNextPaymentDate");
      localStorage.removeItem("posNextPaymentAmount");
    }
    setCartItems([]);
    setSelectedCustomer(null);
    setPriceType("retail_price");
    setSelectedDelivery(null);
    setCartDiscount(0);
    setCartDiscountType("amount");
    setPayments([]);
    localStorage.removeItem("posCartItems");
    localStorage.removeItem("posCartDiscount");
    localStorage.removeItem("posCartDiscountType");
    localStorage.removeItem("posSelectedCustomer");
    localStorage.removeItem("posNextPaymentDate");
    localStorage.removeItem("posNextPaymentAmount");
    localStorage.removeItem("posPayments");
    setIsPaymentModalVisible(false);
    message.success("Payment processed successfully");
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = (values) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== editingItem.id) return item;
        const originalPrice = Number(values.price);
        let finalPrice = originalPrice;

        if (values.discountType === "amount") {
          finalPrice = originalPrice - (Number(values.discount) || 0);
        } else if (values.discountType === "percent") {
          finalPrice =
            originalPrice * (1 - (Number(values.discount) || 0) / 100);
        }

        return {
          ...item,
          current_price: parseFloat(Number(values.price).toFixed(2)),
          quantity: values.quantity,
          discount: values.discount || 0,
          discountType: values.discountType || "amount",
          original_price: editingItem.original_price,
        };
      })
    );

    setIsEditModalVisible(false);
    message.success("Item updated successfully");
  };

  const handleApplyDiscount = (discount, type) => {
    setCartDiscount(discount);
    setCartDiscountType(type);
    setIsDiscountModalVisible(false);
    message.success(
      `Cart discount applied: ${
        type === "percent" ? `${discount}%` : `$${discount}`
      }`
    );
  };

  const handleCreatePosSaleData = async () => {
    if (!selectedCustomer) {
      message.warning("Please select a customer before processing payment");
      return;
    }

    if (cartItems.length === 0) {
      message.warning("Please add items to cart first");
      return;
    }

    if (payments.length === 0 && total > 0) {
      message.warning("Please add payment method before processing");
      return;
    }

    // Validate payment amount
    if (totalPaidAmount < total) {
      message.error(
        `Payment amount ($${totalPaidAmount.toFixed(
          2
        )}) is less than total ($${total.toFixed(
          2
        )}). Please pay at least the full amount.`
      );
      return;
    }

    try {
      const paymentData = {
        customer_id: selectedCustomer.id,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        warehouse_id: userData.warehouse_id,
        shift_id: shiftId,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.current_price,
          cost: item.cost,
          discount: item.discount || 0,
          discount_type: item.discountType || "amount",
          total:
            item.current_price *
            item.quantity *
            (1 - (item.discount || 0) / 100),
        })),
        subtotal,
        total_discount: itemDiscountTotal + calculatedCartDiscount,
        discount_type: cartDiscountType,
        inv_discount: cartDiscount,
        tax,
        delivery_fee: selectedDelivery?.price || 0,
        total,
        amount_paid: total, // Cap amount_paid at total, even if totalPaidAmount is higher
        change_due: 0, // No change is returned
        payments: payments.map((payment) => ({
          ...payment,
          amount: Math.min(
            payment.amount,
            total -
              payments
                .slice(0, payments.indexOf(payment))
                .reduce((sum, p) => sum + p.amount, 0)
          ),
        })), // Cap payments to not exceed total
        sale_type: "POS",
        amount: total,
        sale_person: selectedSalesperson?.id ?? null,
      };
      // console.log(paymentData);
      // return;

      const response = await handlePosSaleCreate(paymentData, token);

      if (response.success) {
        message.success("Sale completed successfully!");
        const printData = {
          sale: {
            ...response.sale,
            reference: response.sale?.reference || `POS-${Date.now()}`,
            subtotal,
            discount: itemDiscountTotal + calculatedCartDiscount,
            tax,
            delivery_fee: selectedDelivery?.price || 0,
            total,
            amount_paid: total, // Reflect only the total as paid
            change_due: totalPaidAmount > total ? totalPaidAmount - total : 0,
            change_due_khr:
              totalPaidAmount > total
                ? roundToNearest100((totalPaidAmount - total) * EXCHANGE_RATE)
                : 0, // Add rounded KHR change
            user: userData,
          },
          payment_method: payments.map((payment) => ({
            ...payment,
            amount: Math.min(
              payment.amount,
              total -
                payments
                  .slice(0, payments.indexOf(payment))
                  .reduce((sum, p) => sum + p.amount, 0)
            ),
            amount_khr:
              payment.currency === "KHR"
                ? roundToNearest100(payment.amount * EXCHANGE_RATE)
                : null, // Add rounded KHR amount for KHR payments
          })),
          customer: selectedCustomer,
          items: cartItems,
        };
        setCartItems([]);
        setSelectedCustomer(null);
        setPriceType("retail_price");
        setSelectedDelivery(null);
        setCartDiscount(0);
        setCartDiscountType("amount");
        setNextPaymentDate(null);
        setNextPaymentAmount(0);
        setPayments([]);
        setSelectedPaymentMethod("Cash");

        localStorage.removeItem("posCartItems");
        localStorage.removeItem("posCartDiscount");
        localStorage.removeItem("posCartDiscountType");
        localStorage.removeItem("posSelectedCustomer");
        localStorage.removeItem("posNextPaymentDate");
        localStorage.removeItem("posNextPaymentAmount");
        localStorage.removeItem("posPayments");

        printInvoice(printData);
      } else {
        throw new Error(response.message || "Sale failed");
      }
    } catch (error) {
      message.error(
        error.message || "Failed to complete sale. Please try again."
      );
    }
  };

  const printInvoice = (printData) => {
    const receiptContainer = document.createElement("div");
    document.body.appendChild(receiptContainer);

    const root = ReactDOM.createRoot(receiptContainer);
    root.render(
      <InvoiceTemplate
        sale={printData.sale}
        customer={printData.customer}
        items={printData.items}
        payment_method={printData.payment_method}
      />
    );

    setTimeout(() => {
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

      const printWindow = window.open("", "_blank", "width=300,height=500");
      printWindow.document.open();
      printWindow.document.write(receiptHtml);
      printWindow.document.close();

      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();

          document.body.removeChild(receiptContainer);
        }, 500);
      };
    }, 500);
  };

  const SuspendedOrdersTable = ({ className, onOrderLoaded }) => {
    const suspendedOrders = JSON.parse(
      localStorage.getItem("suspendedOrders") || "[]"
    );

    const columns = [
      {
        title: "Customer",
        key: "customer",
        render: (_, record) => {
          const customer = customers.find((c) => c.id === record.customer_id);
          return customer ? customer.username : "N/A";
        },
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (total) => `$${parseFloat(total).toFixed(2)}`,
      },
      {
        title: "Date",
        key: "date",
        render: (_, record) => new Date(record.created_at).toLocaleString(),
      },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditItem(record);
                }}
                style={{ color: "#1890ff" }}
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSuspendDelete(record.id, token);
                }}
              />
            </Tooltip>
            <Tooltip title="Load Order">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  loadSuspendedOrder(record.id);
                }}
                size="small"
              />
            </Tooltip>
          </Space>
        ),
      },
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
          style: { cursor: "pointer", borderRadius: "0" },
        })}
        rowClassName={() => "clickable-row"}
      />
    );
  };

  const PriceWarningModal = () => (
    <Modal
      title="Price Changes Detected"
      open={showPriceWarning}
      onCancel={() => setShowPriceWarning(false)}
      footer={[
        <Button
          key="ok"
          type="primary"
          onClick={() => setShowPriceWarning(false)}
        >
          OK
        </Button>,
      ]}
    >
      <Alert
        message="Some product prices have changed since they were added to cart"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Table
        dataSource={Object.keys(priceDifferences).map((key) => ({
          productId: key,
          productName: products.find((p) => p.id === key)?.name || "Unknown",
          ...priceDifferences[key],
        }))}
        columns={[
          { title: "Product", dataIndex: "productName", key: "productName" },
          {
            title: "Original Price",
            dataIndex: "original",
            key: "original",
            render: (val) => `$${val}`,
          },
          {
            title: "Current Price",
            dataIndex: "current",
            key: "current",
            render: (val) => `$${val}`,
          },
          {
            title: "Difference",
            key: "difference",
            render: (_, record) => (
              <span style={{ color: record.difference > 0 ? "red" : "green" }}>
                {record.difference > 0 ? "+" : ""}
                {record.difference}
              </span>
            ),
          },
        ]}
        size="small"
        pagination={false}
      />
    </Modal>
  );

  const AddDiscountModal = ({
    subtotal,
    initialDiscount,
    initialDiscountType,
    onSubmit,
    onCancel,
    itemId,
  }) => {
    const [discount, setDiscount] = useState(initialDiscount);
    const [discountType, setDiscountType] = useState(initialDiscountType);
    const [error, setError] = useState("");
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
      setInputValue(initialDiscount.toString());
    }, []);

    useEffect(() => {
      setDiscount(0);
      setInputValue("0");
    }, [discountType]);

    const handleSubmit = () => {
      const numericValue = parseFloat(inputValue);
      const roundedDiscount = parseFloat(numericValue.toFixed(2));
      const maxDiscount = discountType === "percent" ? 100 : subtotal;

      if (roundedDiscount < 0) {
        setError("Discount cannot be negative");
        return;
      }

      if (roundedDiscount > maxDiscount) {
        setError(
          `Discount cannot exceed ${
            discountType === "percent" ? "100%" : `$${subtotal.toFixed(2)}`
          }`
        );
        return;
      }

      // ✅ Update localStorage
      try {
        const cart = JSON.parse(localStorage.getItem("posCartItems")) || [];
        const updatedCart = cart.map((item) =>
          item.id === itemId
            ? { ...item, discount: roundedDiscount, discountType }
            : item
        );
        localStorage.setItem("posCartItems", JSON.stringify(updatedCart));
      } catch (e) {
        console.error("Failed to update discount in localStorage", e);
      }

      setError("");
      onSubmit(roundedDiscount, discountType);
    };

    const formatDisplayValue = (value) => {
      return discountType === "percent" ? `${value}%` : `$${value.toFixed(2)}`;
    };

    const handleDiscountChange = (e) => {
      const value = e.target.value;
      setInputValue(value);

      if (value === "") {
        setDiscount(0);
      } else if (/^\d*\.?\d*$/.test(value)) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          setDiscount(numericValue);
        }
      }
    };

    return (
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label>Discount Type</label>
          <Select
            value={discountType}
            onChange={(value) => {
              setDiscountType(value);
              setDiscount(0);
              setInputValue("0");
            }}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <Select.Option value="amount">Amount ($)</Select.Option>
            <Select.Option value="percent">Percentage (%)</Select.Option>
          </Select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Discount Value</label>
          <Input
            type="text"
            value={inputValue}
            onChange={handleDiscountChange}
            placeholder={
              discountType === "percent" ? "0-100%" : `0-${subtotal.toFixed(2)}`
            }
            style={{ marginTop: "8px" }}
            addonAfter={discountType === "percent" ? "%" : "$"}
          />
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginTop: "8px" }}
            />
          )}
          {!error && discount > 0 && (
            <div style={{ marginTop: "8px", color: "#52c41a" }}>
              Applying {formatDisplayValue(discount)} discount
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Apply
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#52c41a",
          padding: "0px 40px",
        }}
      >
        <Tooltip title="Back">
          <ArrowLeftOutlined
            onClick={handleBack}
            style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
          />
        </Tooltip>
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
              <div style={{ display: "flex", gap: "8px" }}>
                <Tooltip title="View Suspended Orders">
                  <Badge count={suspendedOrders.length} offset={[-2, 2]}>
                    <Button
                      icon={<PauseOutlined />}
                      type="primary"
                      shape="circle"
                      size="large"
                      style={{
                        background: "#1890ff",
                        borderColor: "#1890ff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => setIsSuspendedOrdersModalVisible(true)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
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
                      background: "#1890ff",
                      borderColor: "#1890ff",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setViewShiftVisible(true)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                </Tooltip>
                <Tooltip title="Close Shift">
                  <Button
                    icon={<FiPower />}
                    type="default"
                    shape="circle"
                    size="large"
                    style={{
                      background: "#fff",
                      borderColor: "#ff4d4f",
                      color: "#ff4d4f",
                      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleCloseShift}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(255, 77, 79, 0.6)";
                      e.currentTarget.style.backgroundColor = "#ff4d4f";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "#d9363e";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(255, 77, 79, 0.3)";
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.color = "#ff4d4f";
                      e.currentTarget.style.borderColor = "#ff4d4f";
                    }}
                  />
                </Tooltip>
              </div>
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
              onClick={() => {
                setIsProductSearchModalVisible(true);
              }}
            >
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchProductTerm}
                onChange={(e) => setSearchProductTerm(e.target.value)}
                className="search-input"
                readOnly
              />
            </motion.div>

            <div className="customer-select" ref={dropdownRef}>
              <div
                className="select-trigger"
                onClick={() => {
                  setIsOpen(!isOpen);
                  setSearchCustomerTerm("");
                }}
              >
                <div className="customer-avatar">
                  <FiUser />
                </div>
                <span className="customer-name">
                  {selectedCustomer ? (
                    <>
                      {selectedCustomer.username}
                      <span className="group-name">
                        {" "}
                        ({selectedCustomer?.group_name})
                      </span>
                    </>
                  ) : (
                    "Select Customer"
                  )}
                </span>

                <div>
                  <FiChevronDown
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="dropdown-menu">
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
                        onClick={() => setSearchCustomerTerm("")}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>

                  <div className="options-list">
                    {filteredCustomers.length > 0 ? (
                      <>
                        {(searchCustomerTerm
                          ? filteredCustomers
                          : filteredCustomers.slice(0, 10)
                        ).map((customer) => (
                          <div
                            key={customer.id}
                            className={`option ${
                              selectedCustomer?.id === customer.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleSelect(customer)}
                          >
                            <div className="customer-info">
                              <div className="username">
                                {customer.username} ({customer.group_name})
                              </div>
                              {customer.phone && (
                                <div className="phone">{customer.phone}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="no-results">
                        {searchCustomerTerm
                          ? "No matching customers"
                          : "No customers available"}
                      </div>
                    )}
                  </div>

                  <div
                    className="add-option"
                    onClick={() => {
                      setIsModalVisible(true);
                      setIsOpen(false);
                    }}
                  >
                    <FiPlus className="add-icon" />
                    <span>Add New Customer</span>
                  </div>
                </div>
              )}
            </div>
            <Select
              onChange={handleSalespersonChange}
              value={selectedSalesperson?.id}
              style={{ width: 200 }}
              showSearch={false}
              placeholder="Select salesperson"
              className="saleperson-select"
            >
              {salepersons.map((person) => (
                <Option key={person.id} value={person.id}>
                  {person.username}
                </Option>
              ))}
            </Select>
          </div>

          <div className="products-container">
            {cartItems.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  background: "#DEDDDE",
                  padding: "40px 20px",
                  height: "100%",
                }}
              >
                <div
                  className="empty-icon"
                  style={{
                    margin: "0 auto 20px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                  }}
                >
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 style={{ marginBottom: "10px" }}>No Items found</h3>
                </div>
              </div>
            ) : (
              <table
                className="cart-table"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>
                      Price
                    </th>
                    <th style={{ padding: "12px", textAlign: "right" }}>
                      Discount
                    </th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Qty
                    </th>
                    <th style={{ padding: "12px", textAlign: "right" }}>
                      Total Price
                    </th>
                    <th style={{ padding: "12px", textAlign: "center" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    // Calculate per-item total price
                    const itemTotalPrice =
                      item.discountType === "percentage"
                        ? item.original_price *
                          item.quantity *
                          (1 - (item.discount || 0) / 100)
                        : (item.original_price - (item.discount || 0)) *
                          item.quantity;

                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "12px" }}>
                          {item.name} ({item.code})
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          ${Number(item.current_price || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {item.discountType === "percentage"
                            ? `${Number(item.discount || 0).toFixed(2)}%`
                            : `$${Number(item.discount || 0).toFixed(2)}`}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              style={{ padding: "2px 8px", marginRight: "8px" }}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              style={{ padding: "2px 8px", marginLeft: "8px" }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          ${Number(itemTotalPrice || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditItem(item)}
                            style={{ marginRight: 8 }}
                          />
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(item.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="cart-panel">
          <div className="cart-header">
            <div className="payment-method-selector">
              <Select
                defaultValue="Cash"
                value={selectedPaymentMethod}
                onChange={(value) => {
                  setSelectedPaymentMethod(value);
                }}
                className="tall-no-radius-select"
                style={{ width: "100%" }}
              >
                {paymentOptions.map((method) => (
                  <Option
                    key={method.name}
                    value={method.name}
                    label={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {method.icon}
                        {method.name}
                      </div>
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {method.icon}
                      {method.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="cart-summary">
            <div className="currency-display">
              <div className="currency-input-row">
                <Input
                  value={activeCurrency === "USD" ? inputAmount : ""}
                  onChange={(e) => {
                    setInputAmount(e.target.value);
                    setActiveCurrency("USD");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "USD")}
                  onClick={() => handleFocus("USD")}
                  addonBefore="USD"
                  className="currency-input"
                  type="number"
                  min="0"
                  step="0.01"
                  onWheel={(e) => e.target.blur()}
                />
              </div>
              <div className="currency-input-row">
                <Input
                  value={activeCurrency === "KHR" ? inputAmount : ""}
                  onChange={(e) => {
                    setInputAmount(e.target.value);
                    setActiveCurrency("KHR");
                  }}
                  onFocus={() => handleFocus("KHR")}
                  onKeyDown={(e) => handleKeyDown(e, "KHR")}
                  addonBefore="KHR"
                  className="currency-input"
                  type="number"
                  min="0"
                  step="1000"
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Sub Total</span>
                <span>${formatNumber(subtotal, 3)}</span>
              </div>
              <div className="summary-row">
                <span>Item Discounts</span>
                <span>${formatNumber(itemDiscountTotal, 3)}</span>
              </div>
              <div className="summary-row">
                <span>Cart Discount</span>
                <span>${formatNumber(calculatedCartDiscount, 3)}</span>
              </div>
              <div className="summary-row">
                <span>Total</span>
                <span>${total.toFixed(3)}</span>
              </div>
              <div className="summary-row">
                <span>Paid Amount</span>
                <span>${formatNumber(totalPaidAmount, 3)}</span>
              </div>
              {total - totalPaidAmount > 0 && (
                <div className="summary-row">
                  <span>Balance</span>
                  <span>${formatNumber(total - totalPaidAmount, 3)}</span>
                </div>
              )}
              {totalPaidAmount > total && (
                <>
                  <div className="summary-row">
                    <span>Change</span>
                    <span>${formatNumber(totalPaidAmount - total, 3)}</span>
                  </div>
                  <div className="summary-row">
                    <span></span>
                    <span>
                      ៛
                      {roundToNearest100(
                        (totalPaidAmount - total) * EXCHANGE_RATE
                      ).toFixed(0)}
                    </span>
                  </div>
                </>
              )}
              {payments.length > 0 && (
                <div className="summary-row">
                  <Button
                    size="small"
                    onClick={() => setIsPaymentHistoryModalVisible(true)}
                  >
                    View Payments
                  </Button>
                </div>
              )}
            </div>

            <div className="cart-actions">
              <div className="checkout-buttons">
                <button
                  className="discount-button"
                  onClick={() => setIsDiscountModalVisible(true)}
                >
                  % Cart Dis
                </button>
                <button
                  className="suspend-button"
                  disabled={cartItems.length === 0}
                  onClick={suspendOrder}
                >
                  Suspend
                </button>
              </div>

              <div className="checkout-buttons">
                <button
                  className="checkout-button"
                  disabled={cartItems.length === 0 || total <= 0}
                  onClick={() => {
                    if (!selectedCustomer) {
                      message.warning(
                        "Please select a customer before processing payment"
                      );
                      return;
                    }
                    handleProceedToPayment();
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isModalVisible && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ width: "100%", maxWidth: "100%" }}
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
                  <div className="form-group">
                    <label>Customer Group</label>
                    <select
                      value={customerGroup}
                      onChange={(e) => setCustomerGroup(e.target.value)}
                    >
                      <option value="">Select group</option>
                      {groupOptions.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Job</label>
                    <input
                      type="text"
                      placeholder="Enter Job"
                      value={newCustomerJob}
                      onChange={(e) => setNewCustomerJob(e.target.value)}
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

        <Modal
          title="Payment History"
          open={isPaymentHistoryModalVisible}
          onCancel={() => setIsPaymentHistoryModalVisible(false)}
          footer={null}
          centered
        >
          <Table
            dataSource={payments.map((payment, index) => ({
              ...payment,
              key: index,
            }))}
            columns={[
              {
                title: "Method",
                dataIndex: "method",
                key: "method",
              },
              {
                title: "Amount",
                key: "amount",
                render: (_, record) =>
                  record.currency === "USD"
                    ? `$${record.amount.toFixed(2)}`
                    : `៛${roundToNearest100(
                        record.amount * EXCHANGE_RATE
                      ).toFixed(0)} ($${record.amount.toFixed(2)})`,
              },
              {
                title: "Date",
                dataIndex: "date",
                key: "date",
                render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, record, index) => (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePayment(index)}
                  />
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </Modal>

        <PriceWarningModal />

        <Modal
          title="Suspended Orders"
          open={isSuspendedOrdersModalVisible}
          onCancel={() => setIsSuspendedOrdersModalVisible(false)}
          footer={null}
          width="60%"
          centered
          styles={{
            mask: { background: "rgba(0, 0, 0, 0.6)" },
          }}
        >
          {suspendedOrders.length > 0 ? (
            <SuspendedOrdersTable
              className="no-radius-table"
              onOrderLoaded={() =>
                setSuspendedOrders(
                  JSON.parse(localStorage.getItem("suspendedOrders") || [])
                )
              }
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>No suspended orders found.</p>
            </div>
          )}
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
          onSubmit={handleSaveEdit}
          initialValues={{
            ...editingItem,
            price: editingItem?.price || 0,
            discount: editingItem?.discount || 0,
            discountType: editingItem?.discountType || "amount",
            quantity: editingItem?.quantity || 1,
          }}
        />

        <ProductSearchModal
          visible={isProductSearchModalVisible}
          onCancel={() => setIsProductSearchModalVisible(false)}
          onConfirm={(selectedItems) => {
            selectedItems.forEach((item) => addToCart(item));
            setIsProductSearchModalVisible(false);
          }}
          products={products}
          selectedProducts={selectedProducts}
          tempSelectedProducts={tempSelectedProducts}
          setTempSelectedProducts={setTempSelectedProducts}
          searchTerm={searchProductTerm}
          setSearchTerm={setSearchProductTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          isLoading={loading}
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

export default PosAdd;
