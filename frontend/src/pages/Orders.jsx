import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  PLACED: '#2196f3',
  SHIPPED: '#ff9800',
  DELIVERED: '#4caf50',
  CANCELLED: '#f44336'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--secondary)' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: 'var(--primary)' }}>Order #{order.id}</h3>
                <p style={{ color: 'var(--secondary)', fontSize: '13px', marginTop: '4px' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
                <p style={{ color: 'var(--secondary)', fontSize: '13px' }}>
                  📍 {order.shippingAddress}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  backgroundColor: STATUS_COLORS[order.status] || '#888',
                  color: 'white', padding: '4px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: '700'
                }}>
                  {order.status}
                </span>
                <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)', marginTop: '8px' }}>
                  ₹{order.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '12px' }} />

            {order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', fontSize: '14px'
              }}>
                <span>{item.productName} × {item.quantity}</span>
                <span style={{ color: 'var(--secondary)' }}>₹{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}