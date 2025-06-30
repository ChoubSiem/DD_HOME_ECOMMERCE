import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  InputText, 
  Dropdown, 
  Calendar, 
  InputNumber, 
  Message, 
  Panel, 
  Divider,
  Tag,
  DataTable,
  Column,
  Badge
} from 'primereact';
import { useNavigate } from 'react-router-dom';
import { useSale } from '../../hooks/UseSale';
import { useProductTerm } from '../../hooks/UserProductTerm';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import './AddSaleReturn.css';
// import { justify } from '@antv/g2plot/lib/plots/sankey/sankey';
// import { display } from 'html2canvas/dist/types/css/property-descriptors/display';

const AddSaleReturn = () => {
  const navigate = useNavigate();
  const { handleAddSaleReturn, handleGetSales } = useSale();
  const { handleProducts } = useProductTerm();
  const token = localStorage.getItem("token");
  const user = JSON.parse(Cookies.get("user"));

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [originalSale, setOriginalSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '4px',
    // border: '1px solid #ccc'
  };

  const [formData, setFormData] = useState({
    sale_id: null,
    reference: `SR-${dayjs().format('YYMMDDHHmm')}`,
    date: dayjs().format('YYYY-MM-DD'),
    warehouse_id: user.warehouse_id,
    saleperson: user.name,
    note: '',
    status: 'pending',
    items: []
  });

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await handleProducts(token, user.warehouse_id);
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      Message.error('Failed to fetch products');
    }
  };

  const fetchSales = async () => {
    try {
      const result = await handleGetSales(token);
      if (result.success) {
        setSales(result.data);
      }
    } catch (error) {
      Message.error('Failed to fetch sales');
    }
  };

  const handleProductSelect = (product) => {
    const existingItemIndex = selectedItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].qty += 1;
      setSelectedItems(updatedItems);
    } else {
      const newItem = {
        product_id: product.id,
        qty: 1,
        unit_price: product.price,
        unit_cost: product.cost || 0,
        product_name: product.name,
        product_code: product.code,
        stock: product.stock
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].qty = value;
    setSelectedItems(updatedItems);
  };

  const handlePriceChange = (index, value) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].unit_price = value;
    setSelectedItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  const calculateRefundAmount = () => {
    return selectedItems.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateRefundAmount() * 0.1;
  };

  const calculateTotal = () => {
    return calculateRefundAmount() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!formData.sale_id) {
      Message.error('Please select original sale');
      return;
    }

    if (selectedItems.length === 0) {
      Message.error('Please add at least one item');
      return;
    }

    const payload = {
      ...formData,
      items: selectedItems.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        price: item.unit_price,
        cost: item.unit_cost
      })),
      refund_amount: calculateRefundAmount(),
      tax_amount: calculateTax(),
      total_amount: calculateTotal(),
      created_by: user.id
    };

    setLoading(true);
    try {
      const result = await handleAddSaleReturn(payload, token);

      if (result.success) {
        Message.success('Sale return created successfully');
        navigate('/sales/returns');
      }
    } catch (error) {
      Message.error(error.response?.data?.message || 'Failed to create sale return');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusSeverity = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger'
  };

  return (
    <div className="sale-return-container">
    <div style={{ display: 'flex',justifyContent: 'space-between' }}>
        <div className="card-header">
          <i 
            className="pi pi-arrow-left back-button"
            onClick={() => navigate('/sales/returns')} 
          />
          <h2>Create Sale Return</h2>
        </div>

        <div className="status-bar">
          {/* <div className="flex align-items-center">
            <span className="font-bold mr-3">Status:</span>
            <Tag 
              className="status-tag"
              value={formData?.status?.toUpperCase()} 
              severity={statusSeverity[formData.status]} 
            />
          </div> */}
          <div>
            <span className="font-bold mr-2">Reference:</span>
            <Tag className="status-tag" value={formData.reference} severity="info" />
          </div>
        </div>
      </div>
        

        <Divider />

        <div className="form-grid">
            <div style={{
              display: 'flex',
              // background:'black',
              flexDirection:'column',
              marginTop:'20px'
            }}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{ flex: '1 1 45%', maxWidth: '48%' }}>
                  <label style={labelStyle}>Date*</label>
                  <Calendar
                  style={{background:'black',height:'40px',width: '100%',borderRadius:'10px'}} 
                    value={new Date(formData.date)} 
                    onChange={(e) => setFormData({...formData, date: dayjs(e.value).format('YYYY-MM-DD')})}
                    dateFormat="yy-mm-dd"
                    // showIcon
                    // style={inputStyle}
                  />
                </div>
                {/* Date */}

                {/* Reference */}
                <div style={{ flex: '1 1 45%', maxWidth: '48%' }}>
                  <label style={labelStyle}>Reference*</label>
                  <InputText 
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    style={inputStyle}
                  />
                </div>

              </div>
              <div style={{display:'flex',justifyContent:'space-between',width:'100%',background:'black'}}>
                <div style={{ flex: '1 1 100%' }}>
                  <label style={labelStyle}>Original Sale*</label>
                  <Dropdown
                    value={formData.sale_id}
                    options={sales.map(s => ({ 
                      label: `#${s.reference} - ${dayjs(s.date).format('DD/MM/YYYY')} - ${s.customer?.name || 'No Customer'}`,
                      value: s.id 
                    }))}
                    onChange={(e) => {
                      setFormData({...formData, sale_id: e.value});
                      setOriginalSale(sales.find(s => s.id === e.value));
                    }}
                    placeholder="Select Original Sale"
                    filter
                    // style={inputStyle}
                  />
                </div>

                {/* Warehouse */}
                <div>
                  <label style={labelStyle}>Warehouse</label>
                  <InputText 
                    value={user.warehouse?.name || 'N/A'}
                    readOnly
                    style={{ ...inputStyle, backgroundColor: '#f0f0f0', color: '#666' }}
                  />
                </div>

              </div>

              {/* Original Sale (full width) */}

              {/* Salesperson */}
              <div style={{ flex: '1 1 45%', maxWidth: '48%' }}>
                <label style={labelStyle}>Salesperson</label>
                <InputText 
                  value={formData.saleperson}
                  onChange={(e) => setFormData({...formData, saleperson: e.target.value})}
                  style={inputStyle}
                />
              </div>
              {/* Note (full width) */}
              <div style={{ flex: '1 1 100%' }}>
                <label style={labelStyle}>Note</label>
                <InputText 
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Additional notes..."
                  style={inputStyle}
                />
              </div>
            </div>
          <div>
            <Panel className="info-panel" header="Product Selection" toggleable>
              <div className="panel-content">
                <div className="mb-4">
                  <label className="form-label">Search Products</label>
                  <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search"></i>
                    </span>
                    <InputText 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or code..."
                      className="form-input"
                    />
                  </div>
                </div>

                <Dropdown
                  options={filteredProducts.map(p => ({ 
                    label: `${p.name} (${p.code}) - Stock: ${p.stock}`,
                    value: p 
                  }))}
                  onChange={(e) => handleProductSelect(e.value)}
                  placeholder="Select Product"
                  filter
                  optionLabel="label"
                  className="form-input"
                  emptyMessage="No products found"
                  emptyFilterMessage="No matching products"
                />
              </div>
            </Panel>

            <Panel className="info-panel mt-4" header="Return Items">
              {selectedItems.length === 0 ? (
                <div className="empty-state">
                  <i className="pi pi-info-circle empty-state-icon" />
                  <span>No items added for return</span>
                </div>
              ) : (
                <DataTable
                  value={selectedItems}
                  className="return-items-table"
                  responsiveLayout="scroll"
                >
                  <Column field="product_name" header="Product"></Column>
                  <Column field="product_code" header="Code"></Column>
                  <Column 
                    header="Quantity" 
                    body={(rowData, { rowIndex }) => (
                      <InputNumber
                        value={rowData.qty}
                        onValueChange={(e) => handleQuantityChange(rowIndex, e.value)}
                        min={1}
                        max={rowData.stock}
                        mode="decimal"
                        showButtons
                        className="form-input"
                      />
                    )}
                  ></Column>
                  <Column 
                    header="Unit Price" 
                    body={(rowData, { rowIndex }) => (
                      <InputNumber
                        value={rowData.unit_price}
                        onValueChange={(e) => handlePriceChange(rowIndex, e.value)}
                        mode="currency"
                        currency="USD"
                        min={0}
                        className="form-input"
                      />
                    )}
                  ></Column>
                  <Column 
                    header="Total" 
                    body={(rowData) => (
                      <span className="font-bold">
                        ${(rowData.qty * rowData.unit_price).toFixed(2)}
                      </span>
                    )}
                  ></Column>
                  <Column 
                    header="Action" 
                    body={(_, { rowIndex }) => (
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-text"
                        onClick={() => handleRemoveItem(rowIndex)}
                        tooltip="Remove item"
                        tooltipOptions={{ position: 'top' }}
                      />
                    )}
                  ></Column>
                </DataTable>
              )}
            </Panel>
          </div>
        </div>

        <div className="summary-panel mt-6">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span className="font-bold">${calculateRefundAmount().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%):</span>
                <span className="font-bold">${calculateTax().toFixed(2)}</span>
              </div>
              <Divider />
              <div className="summary-row">
                <span className="font-bold">Total Refund:</span>
                <span className="summary-total">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="col-12 md:col-6 flex align-items-end justify-content-end">
              <div className="flex flex-column">
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  onClick={() => navigate('/sales/returns')}
                  className="secondary-button action-button mb-2"
                />
                <Button
                  label="Create Return"
                  icon="pi pi-check"
                  onClick={handleSubmit}
                  loading={loading}
                  className="primary-button action-button"
                  disabled={selectedItems.length === 0}
                />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AddSaleReturn;