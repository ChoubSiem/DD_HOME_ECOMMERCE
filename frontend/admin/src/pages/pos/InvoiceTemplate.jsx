import React from "react";
import { ShopOutlined } from '@ant-design/icons';
import logo from 'http://127.0.0.1:8000/storage/logo/DD_Home_Logo.jpg';

const InvoiceTemplate = React.forwardRef(({ sale, customer, items }, ref) => {
  return (
    <div ref={ref} className="receipt" style={{ 
      width: '80mm', 
      padding: '5px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <img src='http://127.0.0.1:8000/storage/logo/DD_Home_Logo.jpg' alt="logo" />
        <h2 style={{ margin: '5px 0', fontSize: '16px' }}>DD Home</h2>
        <p style={{ margin: '2px 0', fontSize: '10px' }}>ឌីឌី ហូម</p>
        <p style={{ margin: '2px 0', fontSize: '10px' }}>123 Business Street</p>
        <p style={{ margin: '2px 0', fontSize: '10px' }}>081 90 5050</p>
      </div>

      <div style={{ 
        borderTop: '1px dashed #000',
        borderBottom: '1px dashed #000',
        padding: '5px 0',
        margin: '5px 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Receipt #:</span>
          <span>{sale?.reference || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier:</span>
          <span>{sale?.user?.username || 'N/A'}</span>
        </div>
      </div>

      {/* Customer Info (if available) */}
      {customer && (
        <div style={{ margin: '5px 0' }}>
          <div style={{ fontWeight: 'bold' }}>CUSTOMER:</div>
          <div>{customer.username}</div>
          {customer.phone && <div>Phone: {customer.phone}</div>}
        </div>
      )}

      {/* Items List */}
      <div style={{ margin: '10px 0' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '3fr 1fr 1fr 1fr',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          <span>ITEM</span>
          <span>QTY</span>
          <span>PRICE</span>
          <span>TOTAL</span>
        </div>
        
        {items.map(item => (
          <div key={item.id} style={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1fr 1fr',
            marginBottom: '3px'
          }}>
            <span>{item.name}</span>
            <span>{item.quantity}</span>
            <span>${item.price.toFixed(2)}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ 
        borderTop: '1px dashed #000',
        borderBottom: '1px dashed #000',
        padding: '5px 0',
        margin: '5px 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>${sale?.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        {sale?.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount:</span>
            <span>-${sale?.discount?.toFixed(2) || '0.00'}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tax:</span>
          <span>${sale?.tax?.toFixed(2) || '0.00'}</span>
        </div>
        {sale?.delivery_fee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery:</span>
            <span>${sale?.delivery_fee?.toFixed(2) || '0.00'}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div style={{ 
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        margin: '10px 0'
      }}>
        TOTAL: ${sale?.total?.toFixed(2) || '0.00'}
      </div>

      {/* Payment Info */}
      <div style={{ margin: '5px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Payment Method:</span>
          <span>{sale?.payment_method || 'Cash'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Amount Paid:</span>
          <span>${sale?.amount_paid?.toFixed(2) || sale?.total?.toFixed(2) || '0.00'}</span>
        </div>
        {sale?.change_due > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Change Due:</span>
            <span>${sale?.change_due?.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        fontSize: '10px',
        marginTop: '15px'
      }}>
        <div>Thank you for your business!</div>
        <div>Items can be returned within 7 days</div>
        <div>with original receipt</div>
      </div>
    </div>
  );
});

export default InvoiceTemplate;