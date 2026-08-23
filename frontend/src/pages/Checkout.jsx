import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/api/cart');
        if (!res.data || res.data.items.length === 0) {
          navigate('/cart'); // Redirect if cart is empty
        } else {
          setCart(res.data);
        }
      } catch {
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.trim()) { setMsg('Please enter a shipping address'); return; }
    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setMsg('Please fill in all mock payment details'); return;
    }
    
    setCheckingOut(true);
    setMsg('');

    // Simulate mock payment processing delay
    setTimeout(async () => {
      try {
        await api.post('/api/orders/checkout', { shippingAddress: address });
        setMsg('Order placed successfully! Redirecting...');
        setTimeout(() => navigate('/orders'), 2000);
      } catch (err) {
        setMsg(err.response?.data?.message || 'Checkout failed');
        setCheckingOut(false);
      }
    }, 1500); // 1.5 seconds mock processing
  };

  if (loading) return <div className="loading">Preparing checkout...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/cart')} 
        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
      >
        ← Back to Cart
      </button>

      <h1 className="page-title">Checkout</h1>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px',
          backgroundColor: msg.includes('success') ? '#e8f5e9' : '#fdecea',
          color: msg.includes('success') ? 'var(--success)' : 'var(--error)',
          fontWeight: '600', fontSize: '14px'
        }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Left Side: Form */}
        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Shipping & Payment</h3>
          <form onSubmit={handleCheckout}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Shipping Address</label>
              <textarea
                rows={3}
                placeholder="Enter your full delivery address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <h4 style={{ marginBottom: '12px', marginTop: '24px', color: '#333' }}>Mock Payment Details</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Card Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                value={cardNumber} 
                onChange={e => setCardNumber(e.target.value)} 
                required 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Expiry (MM/YY)</label>
                <input 
                  type="text" 
                  placeholder="12/25" 
                  value={expiry} 
                  onChange={e => setExpiry(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label style={labelStyle}>CVV</label>
                <input 
                  type="password" 
                  placeholder="123" 
                  value={cvv} 
                  onChange={e => setCvv(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-accent" disabled={checkingOut}
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}>
              {checkingOut ? 'Processing Payment...' : 'Pay & Place Order'}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--secondary)' }}>
            <span>Total Items</span>
            <span>{cart.items.length}</span>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#444' }}>{item.quantity}x {item.productName.length > 20 ? item.productName.substring(0, 20) + '...' : item.productName}</span>
                <span style={{ fontWeight: '600' }}>₹{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px' }}>
            <span>Total to Pay</span>
            <span style={{ color: 'var(--primary)' }}>₹{cart.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#444' };
