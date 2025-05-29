import React, { useEffect, useState } from "react";
import { Card, message, Space, Input, Select } from "antd";
import { usePermission } from "../../../hooks/UsePermission";
import PermissionModal from "../../../components/policy/permission/PermissionModal";
import PermissionTable from "../../../components/policy/permission/PermissionTable";
import { useAuth } from "../../../hooks/UseAuth";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const Permission = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const { handlePermission } = usePermission();
  const { token } = useAuth();

  useEffect(() => {
    fetchPermissionData();
  }, []);

  const fetchPermissionData = async () => {
    setLoading(true);
    try {
      const result = await handlePermission(token);
      if (result) {
        setPermissions(result.data.permissions || []);
      }
    } catch (error) {
      message.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setIsModalVisible(true);
  };

  return (
    <Card title="Permission Management">
      <Card className="filter-card">
        <div className="filter-content">
          <Search
            placeholder="Search permissions..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
          />
          <div className="filter-controls">
            <Select style={{ width: 150 }} placeholder="Status">
              <Option value="all">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
            </Select>

            <Select style={{ width: 150 }} placeholder="Role">
              <Option value="all">All Roles</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Editor">Editor</Option>
              <Option value="Viewer">Viewer</Option>
            </Select>
          </div>
        </div>
      </Card>

      <PermissionTable
        permissions={permissions}
        onEdit={handleEdit}
        loading={loading}
      />

      <PermissionModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={fetchPermissionData}
        permission={selectedPermission}
      />
    </Card>
  );
};

export default Permission;
