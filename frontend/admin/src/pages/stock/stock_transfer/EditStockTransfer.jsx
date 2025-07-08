import React, { useState, useEffect } from "react";
import {
  Table,
  AutoComplete,
  Button,
  Space,
  Popconfirm,
  message,
  InputNumber,
  Select,
  Card,
  Typography,
  Form,
  Input,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useProductTerm } from "../../../hooks/UserProductTerm";
import { useStock } from "../../../hooks/UseStock";
import { useParams, useNavigate } from "react-router-dom";
const { Option } = Select;
const { Title, Text } = Typography;
import Cookie from "js-cookie";

const EditTransfer = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState(null);
  const { handleProducts } = useProductTerm();
  const { handleGetUomTransferOne, handleUomTransferUpdate } = useStock();
  const token = Cookie.get("token");
  const user = JSON.parse(Cookie.get("user") || "{}");

  useEffect(() => {
    fetchTransferData();
    fetchProductData();
  }, []);

  const fetchTransferData = async () => {
    setLoading(true);
    try {
      const result = await handleGetUomTransferOne(token, id);
      if (result.success) {
        setTransferData(result.data);

        const formattedTransfers = result.uoms.items.map((item) => ({
          key: item.id || `temp_${Date.now()}`,
          sourceProduct: {
            id: item.source_product_id,
            name: item.source_product?.name || "",
            stock: item.source_product?.stock || 0,
            unit_code: item.source_unit || "",
            unit_id: item.source_unit_id,
          },
          destinationProduct: {
            id: item.destination_product_id,
            name: item.destination_product?.name || "",
            stock: item.destination_product?.stock || 0,
            unit_code: item.destination_unit || "",
            unit_id: item.destination_unit_id,
          },
          sourceQty: parseFloat(item.source_qty),
          destinationQty: parseFloat(item.destination_qty),
          sourceUnit: item.source_unit,
          destinationUnit: item.destination_unit,
          sourceUnitId: item.source_unit_id,
          destinationUnitId: item.destination_unit_id,
        }));

        // Load from localStorage if available
        const savedTransfers = localStorage.getItem(`transfer_${id}`);
        if (savedTransfers) {
          try {
            const parsed = JSON.parse(savedTransfers);
            setTransfers(parsed);
          } catch (e) {
            // Fallback to server data if JSON is invalid
            setTransfers(formattedTransfers);
            localStorage.removeItem(`transfer_${id}`);
          }
        } else {
          setTransfers(formattedTransfers);
        }
      }
    } catch (error) {
      console.error("Error fetching transfer:", error);
      message.error("Failed to load transfer data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const productsData = await handleProducts(token, user.warehouse_id);
      if (productsData.success) {
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAddTransfer = () => {
    const newTransfer = {
      key: `temp_${Date.now()}`,
      sourceProduct: null,
      destinationProduct: null,
      sourceQty: 1,
      destinationQty: 1,
      sourceUnit: "",
      destinationUnit: "",
      sourceUnitId: null,
      destinationUnitId: null,
    };
    setTransfers([...transfers, newTransfer]);
  };

  const handleProductSelect = (key, field, value) => {
    const selectedProduct = products.find((product) => product.name === value);
    if (!selectedProduct) return;

    setTransfers((prev) =>
      prev.map((transfer) => {
        if (transfer.key !== key) return transfer;

        if (
          (field === "sourceProduct" &&
            selectedProduct.id === transfer.destinationProduct?.id) ||
          (field === "destinationProduct" &&
            selectedProduct.id === transfer.sourceProduct?.id)
        ) {
          message.error("Source and Destination products cannot be the same.");
          return transfer;
        }

        return {
          ...transfer,
          [field]: {
            ...selectedProduct,
            unit_code: selectedProduct.unit_code,
            unit_id: selectedProduct.unit_id,
          },
          [`${field === "sourceProduct" ? "sourceUnit" : "destinationUnit"}`]:
            selectedProduct.unit_code || "",
          [`${field === "sourceProduct" ? "sourceUnitId" : "destinationUnitId"}`]:
            selectedProduct.unit_id || null,
        };
      })
    );
  };

  const handleQuantityChange = (key, field, value) => {
    setTransfers(
      transfers.map((transfer) =>
        transfer.key === key ? { ...transfer, [field]: value } : transfer
      )
    );
  };

  const handleRemoveTransfer = (key) => {
    const updatedTransfers = transfers.filter(
      (transfer) => transfer.key !== key
    );
    setTransfers(updatedTransfers);
    message.success("Transfer removed");
  };

  const handleClearAll = () => {
    setTransfers([]);
    message.success("All transfers cleared!");
  };

  useEffect(() => {
    if (id && transfers.length > 0) {
      localStorage.setItem(`transfer_${id}`, JSON.stringify(transfers));
    }
  }, [transfers, id]);

  const handleSubmit = async () => {
    // Validate transfers first
    const isValid = transfers.every((transfer) => {
      if (!transfer.sourceProduct || !transfer.destinationProduct) {
        message.error("Please complete all transfer fields");
        return false;
      }

      if (transfer.sourceProduct.id === transfer.destinationProduct.id) {
        message.error("Source and Destination products cannot be the same");
        return false;
      }

      if (transfer.sourceQty <= 0 || transfer.destinationQty <= 0) {
        message.error("Quantity must be greater than 0");
        return false;
      }

      return true;
    });

    if (!isValid) return;

    try {
      const payload = {
        date: transferData?.date || new Date().toISOString().split("T")[0],
        transfer_user_id: user?.id ? Number(user.id) : 1,
        warehouse_id: user?.warehouse_id ? Number(user.warehouse_id) : null,
        items: transfers.map((transfer) => ({
          id: transfer.key.toString().startsWith("temp_") ? null : transfer.key,
          source_product_id: Number(transfer.sourceProduct.id),
          destination_product_id: Number(transfer.destinationProduct.id),
          source_qty: Number(transfer.sourceQty),
          destination_qty: Number(transfer.destinationQty),
          source_unit_id: Number(
            transfer.sourceUnitId || transfer.sourceProduct.unit_id
          ),
          destination_unit_id: Number(
            transfer.destinationUnitId || transfer.destinationProduct.unit_id
          ),
          source_unit: transfer.sourceUnit,
          destination_unit: transfer.destinationUnit,
        })),
      };
      const result = await handleUomTransferUpdate(id, payload, token);

      if (result.success) {
        localStorage.removeItem(`transfer_${id}`); 
        message.success("Transfer updated successfully!");
        navigate("/transfer/uom"); 
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            errors.forEach((err) => message.error(`${field}: ${err}`));
          });
        } else {
          message.error(result.message || "Failed to update transfer");
        }
      }
    } catch (error) {
      console.error("Full error object:", error);

      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, errors]) => {
          errors.forEach((err) => message.error(`${field}: ${err}`));
        });
      } else {
        message.error(error.response?.data?.message || "Failed to update transfer");
      }
    }
  };

  const columns = [
    {
      title: "Source Product",
      dataIndex: "sourceProduct",
      key: "sourceProduct",
      width: 150,
      render: (_, record) => (
        <AutoComplete
          options={getFilteredProducts().map((product) => ({
            value: product.name,
            label: (
              <div>
                <strong>{product.name}</strong>
                <div>
                  QOH: {product.stock} {product.unit_code}
                </div>
              </div>
            ),
          }))}
          onSelect={(value) =>
            handleProductSelect(record.key, "sourceProduct", value)
          }
          value={record.sourceProduct?.name}
          filterOption={(inputValue, option) =>
            option.value.toUpperCase().includes(inputValue.toUpperCase())
          }
          style={{ width: "100%" }}
        >
          <Input.Search
            placeholder="Search products..."
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </AutoComplete>
      ),
    },
    {
      title: "QOH",
      key: "QOH",
      width: 70,
      render: (_, record) => (
        <InputNumber
          value={record.sourceProduct?.stock ?? 0}
          disabled
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Source Qty",
      key: "sourceQty",
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.sourceProduct?.stock || 1000}
          value={record.sourceQty}
          onChange={(value) =>
            handleQuantityChange(record.key, "sourceQty", value)
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit",
      key: "sourceUnit",
      width: 100,
      render: (_, record) => (
        <Select value={record.sourceUnit.name} disabled style={{ width: "100%" }}>
          <Option value={record.sourceUnit.id}>{record.sourceUnit.name}</Option>
        </Select>
      ),
    },
    {
      title: "Destination Product",
      dataIndex: "destinationProduct",
      key: "destinationProduct",
      width: 150,
      render: (_, record) => (
        <AutoComplete
          options={getFilteredProducts().map((product) => ({
            value: product.name,
            label: (
              <div>
                <strong>{product.name}</strong>
                <div>
                  QOH: {product.stock} {product.unit_code}
                </div>
              </div>
            ),
          }))}
          onSelect={(value) =>
            handleProductSelect(record.key, "destinationProduct", value)
          }
          value={record.destinationProduct?.name}
          filterOption={(inputValue, option) =>
            option.value.toUpperCase().includes(inputValue.toUpperCase())
          }
          style={{ width: "100%" }}
        >
          <Input.Search
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            allowClear
          />
        </AutoComplete>
      ),
    },
    {
      title: "Destination Qty (per 1 source)",
      key: "destinationQty",
      width: 200,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.destinationQty}
          onChange={(value) =>
            handleQuantityChange(record.key, "destinationQty", value)
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Source After",
      key: "sourceAfter",
      width: 120,
      render: (_, record) => (
        <InputNumber
          value={
            record.destinationQty
          }
          disabled
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit",
      key: "destinationUnit",
      width: 100,
      render: (_, record) => (
        <Select value={record.destinationUnit.name} disabled style={{ width: "100%" }}>
          <Option value={record.destinationUnit.id}>{record.destinationUnit.name}</Option>
        </Select>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 20,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this transfer?"
          onConfirm={() => handleRemoveTransfer(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="transfer-container">
      <Card>
        <div className="header">
          <Title level={3} style={{ color: "#52c41a" }}>
            Edit UOM Transfer
          </Title>
          <Text type="secondary">Edit transfer between products</Text>
        </div>

        <Form form={form} layout="vertical">
          <div style={{ margin: "20px 0" }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTransfer}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Add Transfer Line
              </Button>
            </Space>
          </div>

          <Table
            bordered
            columns={columns}
            dataSource={transfers}
            pagination={false}
            scroll={{ x: 1400 }}
            rowKey="key"
            loading={loading}
            locale={{
              emptyText: "No transfer items added yet",
            }}
          />

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Space>
              <Button onClick={handleClearAll}>Clear All</Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                disabled={transfers.length === 0}
              >
                Update Transfer
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditTransfer;