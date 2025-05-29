import React, { useState, useEffect, use } from "react";
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
const { Option } = Select;
const { Title, Text } = Typography;
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";

const AddTransfer = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { handleProducts } = useProductTerm();
  const token = Cookie.get("token");
  const {handleCreateUomTransfer} = useStock();
  const user = JSON.parse(Cookie.get("user") || "{}"); 
  useEffect(() => {
    const savedTransfers = localStorage.getItem("transfers");
    if (savedTransfers) {
      try {
        setTransfers(JSON.parse(savedTransfers));
      } catch (e) {
        console.error("Failed to load transfers from localStorage", e);
      }
    }
    fetchProductData();
  }, []);

  useEffect(() => {
    localStorage.setItem("transfers", JSON.stringify(transfers));
  }, [transfers]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const productsData = await handleProducts(token,user.warehouse_id);
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
      key: Date.now(),
      sourceProduct: null,
      destinationProduct: null,
      sourceQty: 1,
      destinationQty: 1,
      sourceUnit: "",
      destinationUnit: "",
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
          [field]: selectedProduct,
          [`${field === 'sourceProduct' ? 'sourceUnit' : 'destinationUnit'}`]: selectedProduct.unit_code || "",
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

  const handleSubmit = async () => {
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
        date: new Date().toISOString().split('T')[0], 
        transfer_user: user?.id ? Number(user.id) : 1,
        warehouse_id: user?.warehouse_id ? Number(user.warehouse_id) : null, 
        items: transfers.map(transfer => ({
          source_product_id: Number(transfer.sourceProduct.id),
          destination_product_id: Number(transfer.destinationProduct.id),
          source_qty: Number(transfer.sourceQty),
          destination_qty: Number(transfer.destinationQty),
          source_unit: transfer.sourceUnit,
          destination_unit: transfer.destinationUnit
        }))
      };
  
      console.log("Final payload being sent:", JSON.stringify(payload, null, 2));
  
      const result = await handleCreateUomTransfer(payload, token);
  
      if (result.success) {
        message.success("Transfer created successfully!");
        localStorage.removeItem("transfers");
        setTransfers([]);
        navigate("/transfer/uom")
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            errors.forEach(err => message.error(`${field}: ${err}`));
          });
        }
      }
    } catch (error) {
      console.error("Full error object:", error);
      
      if (error.response?.data?.errors) {
        // Display all validation errors
        Object.entries(error.response.data.errors).forEach(([field, errors]) => {
          errors.forEach(err => message.error(`${field}: ${err}`));
        });
      } else {
        message.error(error.response?.data?.message || "Failed to submit transfer");
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
                <div>QOH: {product.stock} {product.unit_code}</div>
              </div>
            ),
          }))}
          onSelect={(value) =>
            handleProductSelect(record.key, "sourceProduct", value)
          }
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
        <Select value={record.sourceUnit} disabled style={{ width: "100%" }}>
          <Option value={record.sourceUnit}>{record.sourceUnit}</Option>
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
                <div>QOH: {product.stock} {product.unit_code}</div>
              </div>
            ),
          }))}
          onSelect={(value) =>
            handleProductSelect(record.key, "destinationProduct", value)
          }
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
            (record.sourceQty * record.destinationQty)
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
        <Select value={record.destinationUnit} disabled style={{ width: "100%" }}>
          <Option value={record.destinationUnit}>{record.destinationUnit}</Option>
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
          <Title level={3} style={{ color: "#52c41a" }}>UOM Transfer</Title>
          <Text type="secondary">Transfer products between product</Text>
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
                Submit Transfers
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddTransfer;