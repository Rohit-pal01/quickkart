import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, RefreshCw, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function OrderTracking({ orderId, onBackToStore }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.getOrderById(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000); // Polling status every 6s
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await api.cancelOrder(order._id);
      if (res.success) {
        setOrder(res.order);
      } else {
        alert(res.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <RefreshCw className="animate-spin" size={32} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Locating order details...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h3>Order #{orderId} not found</h3>
        <button className="btn-auth" onClick={onBackToStore} style={{ margin: '1rem auto' }}>
          Back to Store
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'CONFIRMED', label: 'Order Placed', icon: Clock },
    { key: 'PACKED', label: 'Order Packed', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const statusPriority = {
    'PENDING_PAYMENT': 0,
    'CONFIRMED': 1,
    'PACKED': 2,
    'OUT_FOR_DELIVERY': 3,
    'DELIVERED': 4,
    'CANCELLED': -1
  };

  const currentLevel = statusPriority[order.status] || 0;
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      <button
        onClick={onBackToStore}
        className="btn-auth"
        style={{ marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Continue Shopping</span>
      </button>

      {/* Header Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order #{order.orderId}</h1>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: isCancelled ? '#FEE2E2' : '#ECFDF5',
                color: isCancelled ? '#B91C1C' : '#047857'
              }}
            >
              {order.status}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • QuickKart Express
          </div>
        </div>

        <button
          onClick={fetchOrder}
          className="btn-auth"
          title="Refresh live status"
          style={{ padding: '0.5rem 0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Progress Timeline Card */}
      {!isCancelled ? (
        <div className="timeline-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46' }}>
                ⚡ Arriving in {order.status === 'DELIVERED' ? '0' : order.status === 'OUT_FOR_DELIVERY' ? '4' : '10'} minutes
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Rider dispatched from HSR Layout Dark Store
              </div>
            </div>
            <div
              style={{
                background: '#FEF3C7',
                color: '#B45309',
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              SUPERFAST
            </div>
          </div>

          <div className="timeline-steps">
            {steps.map((step, idx) => {
              const stepLevel = idx + 1;
              const isCompleted = currentLevel >= stepLevel;
              const isCurrent = currentLevel === stepLevel;
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="step-icon-circle">
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Delivery Address Details */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <MapPin size={22} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Delivering to
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                {order.deliveryAddress?.line1}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '1.5rem',
            textAlign: 'center'
          }}
        >
          <XCircle size={36} color="#DC2626" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3 style={{ color: '#991B1B', fontWeight: 800 }}>This order was cancelled</h3>
          <p style={{ fontSize: '0.85rem', color: '#B91C1C', marginTop: '0.25rem' }}>
            Any amount paid via Juspay has been initiated for refund back to your original source.
          </p>
        </div>
      )}

      {/* Items Summary & Payment Breakdown */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          marginTop: '1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>
          Items in this Order ({order.items.length})
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          {order.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.65rem 0',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.88rem'
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>{item.qty}x</span> {item.name}
              </div>
              <div style={{ fontWeight: 700 }}>₹{item.price * item.qty}</div>
            </div>
          ))}
        </div>

        {/* Bill calculation */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Items Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Delivery Partner Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px dashed var(--border-light)'
            }}
          >
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Juspay Payment Badge */}
        <div
          style={{
            marginTop: '1.25rem',
            background: '#ECFDF5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#059669" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>
              Juspay ExpressCheckout Verified
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#047857' }}>
            {order.paymentId ? `Status: ${order.paymentId.status || 'CHARGED'}` : 'Payment Verified'}
          </span>
        </div>

        {/* Cancellation Option */}
        {!isCancelled && ['PENDING_PAYMENT', 'CONFIRMED', 'PACKED'].includes(order.status) && (
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              style={{
                background: 'none',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
