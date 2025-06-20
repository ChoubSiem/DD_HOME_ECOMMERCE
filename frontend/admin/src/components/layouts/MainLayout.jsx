import React, { useState, useEffect } from "react";
import "./MainLayoutStyle.css";
import {
  PieChartOutlined,
  FileTextOutlined,
  UserOutlined,
  BoxPlotOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  StockOutlined,
  NotificationOutlined,
  BarChartOutlined,
  SettingFilled,
  AppstoreOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ProjectOutlined,
  BarcodeOutlined,
  ReloadOutlined,
  AlertOutlined,
  MessageOutlined,
  LineChartOutlined,
  FileSearchOutlined,
  ContainerOutlined,
  BellOutlined ,
  MoreOutlined,
  CheckCircleOutlined ,
  WarningOutlined ,
  GiftOutlined ,
  SyncOutlined ,
  SwapOutlined ,
  ShopOutlined  ,
  ClockCircleOutlined 
  
} from "@ant-design/icons";
import { 
  Layout, 
  Menu, 
  Badge, 
  Avatar, 
  Select, 
  Dropdown, 
  Button, 
  Popover, 
  List, 
  Divider,
  message ,
  Tooltip 
} from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Spinner from '../spinner/Spinner';
import { useProfileStore } from '@/stores/ProfileStore';
import { useAuth } from '@/hooks/UseAuth';
import Cookies from 'js-cookie';
import { usePolicy } from '../../hooks/usePolicy';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';

const { Header, Content, Footer, Sider } = Layout;

const Logo = () => (
  <img
    src={logo}
    alt="Logo"
    style={{ width: '70px', height: '70px' }}
  />
);

function getItem(label, key, icon, children = null) {  
  return {
    key,
    icon: React.isValidElement(icon) ? icon : null,
    children,
    label,
  };
}

const itemMenuLeftTmp = [
  getItem("Dashboard", "/", <PieChartOutlined />),

  getItem("Sales", "pos-sales", <ShoppingCartOutlined />, [
    getItem("POS Sale", "/pos", <ShopOutlined />),
    getItem("Sale Inventory", "/sale", <ShoppingCartOutlined  />),
    getItem("Add Pos Sales", "/pos/add", <AppstoreOutlined />),
  ]),

  getItem("Customers", "customers", <UserOutlined />, [
    getItem("Customer", "/customer", <UserOutlined />),
    getItem("Customer Group", "/customer-group", <UserOutlined />),
  ]),

  getItem("Inventories", "inventory", <BoxPlotOutlined />, [
    getItem("Products", "/product", <AppstoreOutlined />),
    getItem("Categories", "/category", <TagsOutlined />),
    getItem("Units", "/unit", <UnorderedListOutlined />),
    getItem("UOM Conversion", "/uom-conversion", <SyncOutlined  />),
    getItem("Suppliers", "/supplier", <TeamOutlined />),
    getItem("Brand", "/brand", <BarcodeOutlined />),
    getItem("Product Group", "/product-group", <ProjectOutlined />),
    getItem("Group Suppliers", "/supplier-group", <ContainerOutlined />),
    getItem("Warehouse", "/warehouse", <HomeOutlined />),
    getItem("Regional", "/regional", <EnvironmentOutlined />),
    getItem("Company", "/company", <TeamOutlined />),
    getItem("Promotion", "/promotion", <GiftOutlined />),

  ]),

  getItem("Purchases", "purchase", <ShoppingOutlined />, [
    getItem("Purchase", "/purchase", <ShoppingOutlined />),
    getItem("Add Purchase", "/purchase/add", <AppstoreOutlined />),
  ]),

  getItem("Sale Returns", "sale-returns", <ShoppingCartOutlined />, [
    getItem("Add Sale Return", "/sale-return/add", <AppstoreOutlined />),
    getItem("Sale Returns", "/sale-return", <ShoppingCartOutlined />),
  ]),

  getItem("Reports", "reports", <BarChartOutlined />, [
    // getItem("Product Report", "/reports/product", <AppstoreOutlined />),
    getItem("Stock Report", "/reports/stock", <StockOutlined />),
    getItem("Low Best Product Report", "/reports/low-best-reports", <LineChartOutlined />),
    getItem("Sale Report", "/reports/sale", <ShoppingCartOutlined />),
    getItem("Purchase Report", "/reports/purchase/list", <ShoppingOutlined />),
    // getItem("Adjustment Report", "/reports/adjustment", <ReloadOutlined />),
    getItem("Supplier Report", "/reports/supplier", <TeamOutlined />),
    getItem("Sale Return Report", "/reports/sale-return", <ShoppingCartOutlined />),
    getItem("Shift Report", "/reports/shift", <ClockCircleOutlined  />),
    getItem("Payment Reports", "/accounting/payment", <DollarCircleOutlined />),
  ]),

  getItem("Accounting", "accounting", <DollarCircleOutlined />, [
    getItem("Expense Reports", "/accounting/expense", <FileSearchOutlined />),
    getItem("Profit and Loss Reports", "/accounting/revenue", <LineChartOutlined />),
    getItem("Tax Reports", "/accounting/tax", <FileTextOutlined />),
    getItem("Income Statement Report", "/accounting/income-statement", <LineChartOutlined />),
    getItem("Balance Sheet Report", "/accounting/balance-sheet", <LineChartOutlined />),
  ]),

  getItem("Adjustment and Transfer", "stocks", <StockOutlined />, [
    getItem("Stock Adjustment", "/adjustment", <ReloadOutlined />),
    getItem("UOM Transfer", "/transfer/uom", <StockOutlined />),
    getItem("Stock Transfer", "/transfer/stock", <SwapOutlined />),
  ]),

  getItem("Notifications", "notifications", <NotificationOutlined />, [
    getItem("Stock Alert", "/stock-alert", <AlertOutlined />),
    getItem("Request Alert", "/request-alert", <MessageOutlined />),
  ]),

  getItem("Policy", "/policy", <FileTextOutlined />, [
    getItem("Role", "/role", <UserOutlined />),
    getItem("Permission", "/permission", <FileTextOutlined />),
    getItem("Employee", "/employee", <TeamOutlined />),
  ]),

  getItem("POS Settings", "/setting", <SettingFilled />),
];

const MainLayout = () => {
  const { handleRolePermission } = usePolicy();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [collapsed, setCollapsed] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuth();
  const { isAuthenticated, user } = useProfileStore();
  const [permission, setPermission] = useState([]);
  const [items, setItems] = useState([]);
  
  const handlePOSAdd = () =>{
    navigate("/pos/add");
  }
  const handleRolePermissionData = async () => {
    try {
      const userCookie = Cookies.get('user'); 
      const user = userCookie ? JSON.parse(userCookie) : {}; 
      const roleId = user.role_id;    
      
      if (roleId) {
        const data = await handleRolePermission(roleId);                        
        if (data) {
          setPermission(data.rolePermissions || []);
        }      
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const renderMenuLeft = () => {
    let menuLeft = [];
    
    itemMenuLeftTmp.forEach((item) => {      
      const hasPermission = permission.some(perm => 
        `/${perm.web_route_key}` === item.key
      );
      
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          permission.some(perm => `/${perm.web_route_key}` === child.key)
        );
        
        if (filteredChildren.length > 0) {
          menuLeft.push({
            ...item,
            children: filteredChildren
          });
        }
      } 
      else if (hasPermission) {
        menuLeft.push(item);
      }
    });
    
    setItems(menuLeft);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      handleRolePermissionData();
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (permission.length > 0) {
      renderMenuLeft();
    }
  }, [permission]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New order received",
      description: "Order #1234 has been placed",
      time: "2 minutes ago",
      read: false,
      type: "order",
    },
    {
      id: 2,
      title: "Payment processed",
      description: "Payment for order #1234 has been completed",
      time: "10 minutes ago",
      read: false,
      type: "payment",
    },
    {
      id: 3,
      title: "Low stock alert",
      description: "Product 'Laptop Pro X' is running low (only 5 left)",
      time: "1 hour ago",
      read: true,
      type: "stock",
    },
    {
      id: 4,
      title: "New message",
      description: "You have a new message from John Doe",
      time: "3 hours ago",
      read: true,
      type: "message",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLanguageChange = (value) => {
    setCurrentLanguage(value);
    message.success(`Language changed to ${value.toUpperCase()}`);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    message.success("All notifications marked as read");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order": return <ShoppingCartOutlined  style={{ color: "#52c41a" }} />;
      case "payment": return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
      case "stock": return <WarningOutlined style={{ color: "#faad14" }} />;
      case "message": return <MessageOutlined style={{ color: "#722ed1" }} />;
      default: return <BellOutlined />;
    }
  };

  const notificationContent = (
    <div style={{ width: 350 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "12px 16px", 
        borderBottom: "1px solid #f0f0f0" 
      }}>
        <h4 style={{ margin: 0, fontWeight: 500 }}>Notifications ({unreadCount} new)</h4>
        <Button type="link" size="small" onClick={markAllAsRead}>Mark all as read</Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor: !item.read ? "#f6ffed" : "transparent",
              borderBottom: "1px solid #f0f0f0",
            }}
            onClick={() => markAsRead(item.id)}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(item.type)}
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: !item.read ? 500 : 400 }}>{item.title}</span>
                  <span style={{ fontSize: 12, color: "#888" }}>{item.time}</span>
                </div>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />
      <Divider style={{ margin: 0 }} />
      <div style={{ textAlign: "center", padding: "8px" }}>
        <Button type="link" onClick={() => navigate("/notifications")}>View all notifications</Button>
      </div>
    </div>
  );

  const handleAvatarClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/profile");
      setLoading(false);
    }, 500); 
  };  

  const profileMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      danger: true,
      onClick: handleLogout
    }
  ];

  const selectedKeys = [location.pathname];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {loading && <Spinner />}

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          background: "#001529",
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "80px", 
          marginBottom: 10 
        }}>
          <Logo />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={items}
          className="custom-menu"
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#001529', 
          boxShadow: "0 4px 6px rgba(0, 231, 85, 0.1)", 
          display: "flex", 
          alignItems: "center", 
          height: "80px", 
          justifyContent: "space-between", 
          padding: "0 24px" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>

          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Tooltip title="POS">
              <div 
                onClick={handlePOSAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100px',
                  width: '100px',
                  cursor: 'pointer',
                }}
              >
                <ShopOutlined style={{ color: 'white', fontSize: '30px' }} />
              </div>
            </Tooltip>

          
            {/* <Select
              value={currentLanguage}
              onChange={handleLanguageChange}
              style={{ width: 120, textAlign: "left",borderRadius:0 }}
              options={[
                { value: "en", label: "English" },
                { value: "kh", label: "Khmer" },
                { value: "ch", label: "China" },
              ]}
            /> */}

            <Popover
              content={notificationContent}
              trigger="click"
              open={notificationVisible}
              onOpenChange={setNotificationVisible}
              placement="bottomRight"
            >
              <Badge count={unreadCount} style={{ backgroundColor: "#52c41a" }}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: "30px", color: "#fff" }} />}
                  style={{ padding: "4px" }}
                />
              </Badge>
            </Popover>

            <Dropdown 
              menu={{ items: profileMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "8px",
                transition: "background-color 0.3s",
                ":hover": {
                  backgroundColor: "#f5f5f335"
                }
              }}>
                <Avatar
                  style={{ width: "40px", height: "40px" }}
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  onClick={handleAvatarClick}
                />
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center", 
                  alignItems: "flex-start" 
                }}>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: "16px", 
                    fontWeight: "bold", 
                    lineHeight: 1.5, 
                    color: "#fff" 
                  }}>
                    {user?.name || 'User'}
                  </h1>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "12px", 
                    lineHeight: 1, 
                    color: "#888" 
                  }}>
                    {user?.role || 'role'}
                  </p>
                </div>
                <Button type="text" icon={<MoreOutlined />} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "0 16px" }}>
          <div style={{ 
            // padding: 24, 
            minHeight: "82vh", 
            marginTop: 15, 
            // background: 'white',
            // borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
          }}>
            <Outlet />
          </div>
        </Content>

        <Footer style={{ 
          textAlign: "center",
          padding: "16px 50px",
          backgroundColor: "#f0f2f5"
        }}>
          DD Home {new Date().getFullYear()} 
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;