import React, { useState, useEffect } from "react";
import "./MainLayoutStyle.css";
import { PieChartOutlined, FileTextOutlined, UserOutlined, BoxPlotOutlined, ShoppingCartOutlined, ShoppingOutlined, DollarCircleOutlined, StockOutlined, NotificationOutlined, BarChartOutlined, SettingFilled, AppstoreOutlined, TagsOutlined, UnorderedListOutlined, TeamOutlined, EnvironmentOutlined, HomeOutlined, ProjectOutlined, BarcodeOutlined, ReloadOutlined, AlertOutlined, MessageOutlined, LineChartOutlined, FileSearchOutlined, ContainerOutlined, MoreOutlined, GiftOutlined, SyncOutlined, SwapOutlined, ShopOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { 
  Layout, 
  Menu, 
  Avatar, 
  Select, 
  Dropdown, 
  Button, 
  message,
  Tooltip 
} from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Spinner from '../spinner/Spinner';
import { useProfileStore } from '@/stores/ProfileStore';
import { useAuth } from '@/hooks/UseAuth';
import Cookies from 'js-cookie';
import { usePolicy } from '../../hooks/usePolicy';
import logo from '../../assets/logo/DD_Home_Logo 2.jpg';
import NotificationPopover from './Notification'; 
import { useNotifications } from "../../hooks/UseNotification";
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
    getItem("Sale Return", "/sale-return", <AppstoreOutlined />),
  ]),

  getItem("Customers", "customers", <UserOutlined />, [
    getItem("Customer", "/customer", <UserOutlined />),
    getItem("Customer Group", "/customer-group", <UserOutlined />),
  ]),

  getItem("Inventories", "inventory", <BoxPlotOutlined />, [
    getItem("Products", "/product", <AppstoreOutlined />),
    getItem("Product Issues", "product-issues", <ShoppingOutlined />),
    getItem("Categories", "/category", <TagsOutlined />),
    getItem("Units", "/unit", <UnorderedListOutlined />),
    getItem("UOM Conversion", "/uom-conversion", <SyncOutlined  />),
    getItem("Suppliers", "/supplier", <TeamOutlined />),
    getItem("Brand", "/brand", <BarcodeOutlined />),
    getItem("Product Group", "/product-group", <ProjectOutlined />),
    getItem("Group Suppliers", "/supplier-group", <ContainerOutlined />),
    getItem("Shelf", "/shelf", <TagsOutlined />),
    getItem("Warehouse", "/warehouse", <HomeOutlined />),
    getItem("Regional", "/regional", <EnvironmentOutlined />),
    getItem("Company", "/company", <TeamOutlined />),
    getItem("Promotion", "/promotion", <GiftOutlined />),
  ]),

  getItem("Purchases", "purchase", <ShoppingOutlined />, [
    getItem("Purchase", "/purchase", <ShoppingOutlined />),
    getItem("Add Purchase", "/purchase/add", <AppstoreOutlined />),
  ]),

  getItem("Reports", "reports", <BarChartOutlined />, [
    getItem("Stock Report", "/stock", <StockOutlined />),
    getItem("Low Best Product Report", "/reports/low-best-reports", <LineChartOutlined />),
    getItem("Sale Report", "/reports/sale", <ShoppingCartOutlined />),
    getItem("Purchase Report", "/reports/purchase/list", <ShoppingOutlined />),
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuth();
  const { isAuthenticated, user } = useProfileStore();
  const [permission, setPermission] = useState([]);
  const [items, setItems] = useState([]);
  const {handleAdjustmentNotifications} = useNotifications();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);

  const handlePOSAdd = () => {
    navigate("/pos/add");
  };

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

  const fetchNotification = async() =>{
    let result = await handleAdjustmentNotifications(token);
    if (result.success) {
      setNotifications(result.notifications);
    }

  }

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

  // Notification handlers
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    message.success("All notifications marked as read");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      handleRolePermissionData();
      fetchNotification();
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (permission.length > 0) {
      renderMenuLeft();
    }
  }, [permission]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

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

  const hasPOSPermission = permission.some(
    (p) => p.name === "POS.create"
  );
  

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {loading && <Spinner />}

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{position: "sticky",top: 0,height: "100vh",overflowY: "auto",background: "#001529",}}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80px", marginBottom: 10 }}>
          <Logo />
        </div>

        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} onClick={handleMenuClick} items={items} className="custom-menu"/>
      </Sider>

      <Layout>
        <Header style={{ background: '#001529', boxShadow: "0 4px 6px rgba(0, 231, 85, 0.1)", display: "flex", alignItems: "center", height: "80px", justifyContent: "space-between", }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {hasPOSPermission && (
            <Tooltip title="POS">
              <div 
                onClick={handlePOSAdd}
                style={{display: 'flex',alignItems: 'center',justifyContent: 'center',height: '30px',width: '30px',cursor: 'pointer',background:'green',borderRadius:"50%",padding:"20px"}}>
                <ShopOutlined style={{ color: 'white', fontSize: '20px' }} />
              </div>
            </Tooltip>
            )}

            <NotificationPopover
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />

            <Dropdown 
              menu={{ items: profileMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div style={{  display: "flex",  alignItems: "center",  gap: 8,  cursor: "pointer", padding: "8px 12px", borderRadius: "8px", transition: "background-color 0.3s",}}>
                <Avatar
                  style={{ width: "40px", height: "40px" }}
                  src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  onClick={handleAvatarClick}
                />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" 
                }}>
                  <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "bold", lineHeight: 1.5, color: "#fff" }}>{user?.name || 'User'}</h1>
                  <p style={{ margin: 0, fontSize: "12px", lineHeight: 1, color: "#888" }}>
                    {user?.role || 'role'}
                  </p>
                </div>
                <Button type="text" icon={<MoreOutlined />} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "0 16px" }}>
          <div style={{ minHeight: "82vh", marginTop: 15,}}>
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center",padding: "16px 50px",backgroundColor: "#f0f2f5"}}>
          DD Home {new Date().getFullYear()} 
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;