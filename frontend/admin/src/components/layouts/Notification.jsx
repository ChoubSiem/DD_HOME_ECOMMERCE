import React, { useState, useEffect } from "react";
import { Badge, Button, Popover, List, Divider, message, Spin } from "antd";
import {
  BellOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNotifications } from "../../hooks/UseNotification";
import { usePolicy } from "../../hooks/usePolicy";
import Cookies from "js-cookie";

dayjs.extend(relativeTime);

const NotificationPopover = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const navigate = useNavigate();
  const { handleUpdateAdjustmentNotifications } = useNotifications();
  const { handleRolePermission } = usePolicy();
  const token = localStorage.getItem("token");
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  // Fetch permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.role_id || !token) {
        console.warn("No user role_id or token found");
        return;
      }

    //   setPermissionLoading(true);
      try {
        const result = await handleRolePermission(user.role_id);
        if (result?.success) {
          setPermissions(result.rolePermissions || []);
        } else {
          message.error("Failed to fetch permissions");
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        message.error("Failed to load permissions");
      } finally {
        setPermissionLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.role_id, token]);

  const validNotifications = Array.isArray(notifications)
    ? notifications.filter((n) => n && typeof n === "object" && n.id && typeof n.id !== "undefined")
    : [];

  const hasPermissionForNotification = (notification) => {
    if (!permissions || permissions.length === 0) return true; 

    const notificationName = (notification.name || notification.type || "").toLowerCase();
    return permissions.some((permission) => {
      const permissionName = (permission.name || permission.web_route_key || "").toLowerCase();
      return (
        permissionName === notificationName ||
        notificationName.includes(permissionName) ||
        (permission.web_route_key &&
          notificationName.includes(permission.web_route_key.split("/")[0]?.toLowerCase())) ||
        (notification.type && permissionName === notification.type.toLowerCase())
      );
    });
  };

  const getDefaultLink = (notification) => {
    const type = (notification.type || "").toLowerCase();
    const name = (notification.name || "").toLowerCase();

    if (type.includes("adjustment") || name.includes("adjustment")) return "/adjustment";
    if (type.includes("sale") || name.includes("sale")) return "/sales";
    if (type.includes("purchase") || name.includes("purchase")) return "/purchase";
    if (type.includes("stock") || name.includes("stock")) return "/stock";
    if (type.includes("customer") || name.includes("customer")) return "/customer";
    return "/notifications";
  };

  const filteredNotifications = validNotifications
    .filter((n) => n.sender_id !== user?.id) 
    .filter(hasPermissionForNotification)
    .map((n) => ({
      ...n,
      is_read: Boolean(n.is_read),
      type: n.type || "message",
      title: n.title || n.name || "Notification",
      description: n.description || n.message || "No description available",
      time: n.created_at || n.time || new Date().toISOString(),
      link: n.link || getDefaultLink(n),
    }));

  const unreadCount = filteredNotifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type, name) => {
    const typeLower = (type || "").toLowerCase();
    const nameLower = (name || "").toLowerCase();

    if (typeLower.includes("order") || typeLower.includes("sale") || nameLower.includes("sale")) {
      return <ShoppingCartOutlined style={{ color: "#52c41a" }} />;
    }
    if (typeLower.includes("payment") || typeLower.includes("transaction")) {
      return <CheckCircleOutlined style={{ color: "#1890ff" }} />;
    }
    if (
      typeLower.includes("stock") ||
      typeLower.includes("adjustment") ||
      typeLower.includes("alert") ||
      nameLower.includes("adjustment")
    ) {
      return <WarningOutlined style={{ color: "#faad14" }} />;
    }
    if (typeLower.includes("message") || typeLower.includes("notification")) {
      return <MessageOutlined style={{ color: "#722ed1" }} />;
    }
    return <BellOutlined />;
  };

  const handleMarkAsRead = async (notification) => {
    if (!notification?.id) {
      message.error("Invalid notification");
      console.error("Invalid notification:", notification);
      return;
    }

    setLoading(true);
    try {
      await handleUpdateAdjustmentNotifications(token, notification.id);
      onMarkAsRead(notification.id);
      if (notification.link) navigate(notification.link);
      setNotificationVisible(false);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      message.error("Failed to update notification");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setLoading(true);
    try {
      const unreadIds = filteredNotifications.filter((n) => !n.is_read).map((n) => n.id);
      const batchSize = 5;
      for (let i = 0; i < unreadIds.length; i += batchSize) {
        const batch = unreadIds.slice(i, i + batchSize);
        await Promise.all(batch.map((id) => handleUpdateAdjustmentNotifications(token, id)));
        batch.forEach((id) => onMarkAsRead(id));
      }
      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      message.error("Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  };

  const notificationContent = (
    <div style={{ width: 550, maxHeight: 400, overflow: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 1,
        }}
      >
        <h4 style={{ margin: 0, fontWeight: 500 }}>
          Notifications ({unreadCount} new)
        </h4>
        <div>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              style={{ marginRight: 8 }}
            >
              Mark all read
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={async () => {
              setLoading(true);
              try {
                const result = await handleAdjustmentNotifications(token);
                if (result.success) {
                  onMarkAllAsRead(); // Update parent state
                  message.success("Notifications refreshed");
                }
              } catch (error) {
                message.error("Failed to refresh notifications");
                console.error("Failed to refresh notifications:", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {permissionLoading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="small" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{ padding: "16px", textAlign: "center", color: "#888" }}>
          {validNotifications.length > 0
            ? "No notifications match your permissions"
            : "No notifications available"}
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={filteredNotifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 16px",
                cursor: loading ? "not-allowed" : "pointer",
                backgroundColor: !item.is_read ? "#f6ffed" : "transparent",
                borderBottom: "1px solid #f0f0f0",
                opacity: loading ? 0.6 : 1,
              }}
              onClick={() => !loading && handleMarkAsRead(item)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type, item.name)}
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: !item.is_read ? 600 : 400, fontSize: "14px", flex: 1, marginRight: "8px" }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>
                      {dayjs(item.time).isValid() ? dayjs(item.time).fromNow() : "Recently"}
                    </span>
                  </div>
                }
                description={
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px", lineHeight: "1.4" }}>
                    {item.description}
                    {item.name && item.name !== item.title && (
                      <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
                        Type: {item.name}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Divider style={{ margin: 0 }} />
      <div style={{ textAlign: "center", padding: "8px", background: "#fafafa" }}>
        <Button
          type="link"
          onClick={() => {
            navigate("/notifications");
            setNotificationVisible(false);
          }}
          style={{ fontSize: "12px" }}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      open={notificationVisible}
      onOpenChange={setNotificationVisible}
      placement="bottomRight"
      overlayStyle={{ zIndex: 1050 }}
    >
      <Badge
        count={unreadCount}
        size="small"
        style={{ backgroundColor: "red", boxShadow: "0 0 0 1px #fff" }}
      >
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: "20px", color: "#fff", transition: "color 0.3s",background:"green",padding:"10px",borderRadius:"50%" }} />}
          style={{ padding: "4px 8px", height: "auto", border: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        />
      </Badge>
    </Popover>
  );
};

NotificationPopover.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      message: PropTypes.string,
      name: PropTypes.string,
      time: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      is_read: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      link: PropTypes.string,
      sender_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  onMarkAsRead: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
};

NotificationPopover.defaultProps = {
  notifications: [],
};

export default NotificationPopover;