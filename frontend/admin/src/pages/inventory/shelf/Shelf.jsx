import React, { useState, useEffect,useMemo  } from "react";
import { Card, message, Space, Button, Spin,Dropdown, Menu } from "antd";
import { UploadOutlined, DownloadOutlined, PlusOutlined ,MenuOutlined, EditFilled } from "@ant-design/icons";
import CategoryModal from "../../../components/category/CategoryModal";
import ProductTable from "../../../components/product/ProductTable";
import ProductToolBar from "../../../components/product/ProductToolbar";
import "./Product.css";
import Cookies from "js-cookie";
import { useProductTerm } from "../../../hooks/UserProductTerm";
import { useNavigate } from "react-router-dom";
import ImportProductModal from '../../../components/product/addProduct/ImporProductModal';
import ProductDetailModal from '../../../components/product/ProductDetailModal';
import ProductUpdatePrice from "../../../components/product/importUpdateProductPrice";
import { useCompany } from "../../../hooks/UseCompnay";
import ImportNewStock from "../../../components/product/addProduct/importSetNewStockModal";

const Shelf = () => {
  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [importProductModalVisible, setImportProductModalVisible] = useState(false);
  const [productDetailModalVisible, setProductDetailModalVisible] = useState(false);
  const [productUpdatePriceModalVisible, setProductUpdatePriceModalVisible] = useState(false);
  const [importNewStockModalVisible, setImportNewStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { company } = useCompany();
  const navigate = useNavigate();
  
  // Other hooks and logic...

  return (
    <div className="shelf-container">
      {/* Render components and modals */}
    </div>
  );
};

export default Shelf;
