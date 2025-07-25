    import React, { useState, useEffect,useRef  } from 'react';
    import { 
      Card, 
      Button, 
      InputText, 
      Calendar, 
      InputNumber, 
      Divider,
      DataTable,
      Column,
      Message,
    } from 'primereact';
    import { Toast } from 'primereact/toast';
    import { useNavigate, useParams } from 'react-router-dom';
    import { useSale } from '../../hooks/UseSale';
    import dayjs from 'dayjs';
    import Cookies from 'js-cookie';
    import './AddSaleReturn.css';
    import "primereact/resources/themes/lara-light-indigo/theme.css";
    import "primereact/resources/primereact.min.css";
    import "primeicons/primeicons.css";

    const AddSaleReturn = () => {
      const toast = useRef(null);
      const navigate = useNavigate();
      const { id,type } = useParams();
      const { handleAddSaleReturn, handleGetOneInventorySale,handleGetOnePosSale} = useSale();
      const token = localStorage.getItem("token");
      const user = JSON.parse(Cookies.get("user"));

      const [loading, setLoading] = useState(false);
      const [originalSale, setOriginalSale] = useState(null);
      const [saleItems, setSaleItems] = useState([]);

      const [formData, setFormData] = useState({
        sale_id: id,
        reference: `SR-${dayjs().format('YYMMDDHHmm')}`,
        date: dayjs().format('YYYY-MM-DD'),
        warehouse_id: user.warehouse_id,
        saleperson: user.name,
        note: '',
        status: 'pending',
        items: []
      });

      useEffect(() => {
        fetchSale();
      }, []);

      useEffect(() => {
        // Only persist to localStorage if there are items
        if (saleItems.length > 0) {
          localStorage.setItem(`saleReturnItems_${id}`, JSON.stringify(saleItems));
        } else {
          localStorage.removeItem(`saleReturnItems_${id}`);
        }
      }, [saleItems, id]);

      const fetchSale = async () => {
        try {
          let result ;
          if (type == 'inventory') {
            result = await handleGetOneInventorySale(id, token);
            
          }else{
            result = await handleGetOnePosSale(id, token);
          }
          if (result.success) {
            setOriginalSale(result.sale);
            
            const savedItems = localStorage.getItem(`saleReturnItems_${id}`);
            if (savedItems) {
              setSaleItems(JSON.parse(savedItems));
            } else {
              const items = result.sale.items.map(item => ({
                ...item,
                product_id: item.product_id,
                product_name: item.product?.name || 'Unknown Product',
                product_code: item.product?.code || 'N/A',
                return_qty: 1,
                original_qty: item.qty,
                discount: 0,
                discount_amount: 0,
                total: item.price * 1
              }));
              setSaleItems(items);
            }
          }
        } catch (error) {
          Message.error('Failed to fetch sale details');
        }
      };

      const handleRemoveItem = (productId) => {
        const updatedItems = saleItems.filter(item => item.product_id !== productId);
        
        setSaleItems(prevItems => {
          const newItems = prevItems.filter(item => item.product_id !== productId);
          return newItems;
        });
      };

    const handleQuantityChange = (index, value) => {
      setSaleItems(prevItems => {
        const newItems = prevItems.map((item, i) => {
          if (i === index) {
            const newQty = Math.min(value, item.original_qty);
            return {
              ...item,
              return_qty: newQty,
              total: newQty * item.price - (item.discount_amount || 0)
            };
          }
          return item;
        });
        return newItems;
      });
    };

      const calculateSubtotal = () => {
        return saleItems.reduce((sum, item) => sum + (item.return_qty * item.price), 0);
      };

      const calculateTotalDiscount = () => {
        return saleItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
      };

      const calculateTotal = () => {
        return calculateSubtotal() - calculateTotalDiscount();
      };

      const handleSubmit = async () => {
        if (saleItems.length === 0) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Please add at least one item to return',
            life: 3000
          });
          return;
        }

        const payload = {
          ...formData,
          items: saleItems.map(item => ({
            product_id: item.product_id,
            qty: item.return_qty,
            unit_price: item.price,
            unit_cost: item.cost || 0,
            discount: item.discount_amount || 0
          })),
          subtotal: calculateSubtotal(),
          discount_amount: calculateTotalDiscount(),
          total_amount: calculateTotal(),
          created_by: user.id,
          warehouse_id: user.warehouse_id,
          saleperson: user?.id,
          customer_id: originalSale?.customer?.id,
          original_reference: originalSale?.reference,
          type: type
        };
        setLoading(true);
        try {
          const result = await handleAddSaleReturn(payload, token);
          if (result?.success) {
            localStorage.removeItem(`saleReturnItems_${id}`);
            setTimeout(() => {
              navigate('/sale-return');
            }, 1000);
          } else {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: result?.message || 'Failed to create sale return',
              life: 3000
            });
          }
        } catch (error) {
          console.error('Error creating sale return:', error);
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to create sale return',
            life: 3000
          });
        } finally {
          setLoading(false);
        }
      };


      const handleClearForm = () => {
        setSaleItems([]);
      };

      return (
        <div className="sale-return-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <i 
                className="pi pi-arrow-left"
                style={{ 
                  fontSize: '1.25rem',
                  color: '#4CAF50',
                  marginRight: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(-1)}
              />
              <h2 style={{ margin: 0 }}>Create Sale Return</h2>
            </div>
          </div>

          <Divider />

          <Card style={{ marginBottom: '24px' }}>
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Return Information</h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Date*</label>
                  <Calendar 
                    value={new Date(formData.date)} 
                    onChange={(e) => setFormData({...formData, date: dayjs(e.value).format('YYYY-MM-DD')})}
                    dateFormat="yy-mm-dd"
                    style={{ width: '100%', height: '44px' }}
                    inputStyle={{ paddingLeft: '10px' }}
                  />
                </div>  
                <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Reference*</label>
                  <InputText 
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                {/* Original Sale */}
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Original Sale</label>
                  <InputText 
                    value={originalSale ? `#${originalSale.reference} - ${dayjs(originalSale.date).format('DD/MM/YYYY')}` : 'Loading...'}
                    readOnly
                    style={{ width: '100%', padding: '8px 12px', backgroundColor: '#f5f5f5' }}
                  />
                </div>

                {/* Customer */}
                <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Customer</label>
                  <InputText 
                    value={originalSale?.customer?.username || 'N/A'}
                    readOnly
                    style={{ width: '100%', padding: '8px 12px', backgroundColor: '#f5f5f5' }}
                  />
                </div>

                {/* Salesperson */}
                <div style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Salesperson</label>
                  <InputText 
                    value={formData.saleperson}
                    onChange={(e) => setFormData({...formData, saleperson: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>

                {/* Note */}
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Note</label>
                  <InputText 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="Additional notes..."
                    style={{ width: '100%', padding: '8px 12px' }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Return Items Section */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Return Items</h3>
                <Button 
                  label="Reset Items" 
                  icon="pi pi-refresh" 
                  className="p-button-text p-button-secondary"
                  onClick={handleClearForm}
                  disabled={saleItems.length === 0}
                />
              </div>
              
              {!originalSale ? (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  backgroundColor: '#fff8e1',
                  borderRadius: '6px',
                  color: '#ff8f00'
                }}>
                  <i className="pi pi-spinner pi-spin" style={{ marginRight: '8px' }} />
                  <span>Loading sale items...</span>
                </div>
              ) : saleItems.length === 0 ? (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  backgroundColor: '#ffebee',
                  borderRadius: '6px',
                  color: '#c62828'
                }}>
                  <i className="pi pi-info-circle" style={{ marginRight: '8px' }} />
                  <span>No items to return</span>
                </div>
              ) : (
                <DataTable
                  value={saleItems}
                  responsiveLayout="scroll"
                  style={{ width: '100%' }}
                  emptyMessage="No items found"
                  key={saleItems.length} // Force re-render when items change
                >
                  <Column field="product_name" header="Product" />
                  <Column field="product_code" header="Code" />
                  <Column 
                    header="Original Qty" 
                    body={(rowData) => rowData.original_qty}
                  />
                  <Column 
                    header="Return Qty" 
                    body={(rowData, { rowIndex }) => (
                      <InputNumber
                        value={rowData.return_qty}
                        onValueChange={(e) => handleQuantityChange(rowIndex, e.value)}
                        min={1}
                        max={rowData.original_qty}
                        mode="decimal"
                        showButtons={false}
                        style={{ width: '100%' }}
                        inputClassName="no-spinners"
                      />
                    )}
                  />
                  <Column 
                    header="Unit Price" 
                    body={(rowData) => (
                      <span>${parseFloat(rowData.price)?.toFixed(2)}</span>
                    )}
                  />
                  <Column 
                    header="Discount" 
                    body={(rowData) => (
                      <span>${(rowData.discount_amount || 0).toFixed(2)}</span>
                    )}
                  />
                  <Column 
                    header="Total" 
                    body={(rowData) => (
                      <span style={{ fontWeight: '600' }}>
                        ${((rowData.return_qty * rowData.price) - (rowData.discount_amount || 0)).toFixed(2)}
                      </span>
                    )}
                  />
                  <Column 
                    header="Action" 
                    body={(rowData) => (
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-text"
                        onClick={() => handleRemoveItem(rowData.product_id)}
                        tooltip="Remove item"
                        tooltipOptions={{ position: 'top' }}
                      />
                    )}
                    style={{ width: '80px' }}
                  />
                </DataTable>
              )}
            </div>
          </Card>

          {/* Summary Section */}
          <Card>
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Return Summary</h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span>Discount:</span>
                    <span style={{ fontWeight: '600' }}>${calculateTotalDiscount().toFixed(2)}</span>
                  </div>
                  <Divider />
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '12px'
                  }}>
                    <span style={{ fontWeight: '600' }}>Total Refund:</span>
                    <span style={{ fontWeight: '600', color: '#4CAF50' }}>
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  flex: '1 1 300px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      label="Cancel"
                      icon="pi pi-times"
                      onClick={() => navigate('/sales/returns')}
                      className="p-button-text p-button-danger"
                    />
                    <Button
                      label="Create Return"
                      icon="pi pi-check"
                      onClick={handleSubmit}
                      loading={loading}
                      style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
                      disabled={saleItems.length === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    };

    export default AddSaleReturn;