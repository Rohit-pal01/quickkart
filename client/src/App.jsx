import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import JuspayModal from './components/JuspayModal';
import AuthModal from './components/AuthModal';
import OrderTracking from './components/OrderTracking';
import AdminDashboard from './components/AdminDashboard';
import { api } from './services/api';
import { Zap, Clock, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

function StoreContent() {
  const { user, activeAddress } = useAuth();
  const { items, clearCart, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Active Views
  const [activeView, setActiveView] = useState('store'); // 'store' | 'orders' | 'admin'
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isJuspayOpen, setIsJuspayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load products & categories from API
  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ category: selectedCategory, search: searchTerm }),
        api.getCategories()
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes.success && catRes.categories) {
        setCategories(['All', ...catRes.categories.map(c => c.name)]);
      }
    } catch (err) {
      console.error('Failed to load catalog from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, searchTerm]);

  // Handle proceeding from cart to order creation & Juspay
  const handleProceedToPayment = async () => {
    if (items.length === 0) return;

    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          qty: item.qty,
          price: item.product.price
        })),
        deliveryAddress: {
          line1: activeAddress ? activeAddress.line1 : '12B, Green Glen Layout, Bellandur, Bengaluru'
        }
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setPendingOrder(res.order);
        setIsCartOpen(false);
        setIsJuspayOpen(true);
      } else {
        alert(res.message || 'Failed to initialize order');
      }
    } catch (err) {
      alert('Error initiating checkout. Please make sure backend is running.');
    }
  };

  // Called when Juspay simulates payment success
  const handlePaymentSuccess = (orderId) => {
    clearCart();
    setIsJuspayOpen(false);
    setActiveOrderId(orderId);
    setActiveView('orders');
  };

  return (
    <div className="app-container">
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={() => setIsAuthOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="main-content">
        {activeView === 'admin' ? (
          <AdminDashboard onBackToStore={() => setActiveView('store')} />
        ) : activeView === 'orders' ? (
          <OrderTracking
            orderId={activeOrderId || 'QK-749102-3847'}
            onBackToStore={() => setActiveView('store')}
          />
        ) : (
          <>
            {/* Hero Quick Commerce Promotion Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ maxWidth: '580px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(6px)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem'
                  }}
                >
                  <Zap size={14} fill="#FCD34D" color="#FCD34D" />
                  <span>LIGHTNING QUICK COMMERCE</span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.5rem' }}>
                  Groceries & daily essentials delivered in 10 minutes.
                </h1>
                <p style={{ opacity: 0.9, fontSize: '0.92rem', marginBottom: '1rem' }}>
                  Fresh farm produce, dairy, chilled drinks, and snacks straight from your nearest micro dark store.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} />
                    <span>10 Min Delivery Guarantee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} />
                    <span>Juspay 1-Click Payments</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center',
                  minWidth: '180px'
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 700 }}>FREE DELIVERY ON</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FCD34D' }}>ORDERS &gt; ₹199</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '0.2rem' }}>No coupon required</div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="category-strip">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))
              ) : (
                ['All', 'Dairy & Breakfast', 'Fruits & Vegetables', 'Snacks & Munchies', 'Beverages', 'Instant Food', 'Bakery'].map((cat) => (
                  <button
                    key={cat}
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>

            {/* Product Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '1rem 0 1.25rem 0'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedCategory === 'All' ? 'Popular Essentials' : selectedCategory}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing {products.length} items available in your location
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>
                  Loading fresh items from Dark Store...
                </div>
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                <h3>No products found</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Try changing your search terms or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Cart Drawer Modal */}
      <CartDrawer
        onProceedToPayment={handleProceedToPayment}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Juspay ExpressCheckout Simulation Modal */}
      {isJuspayOpen && (
        <JuspayModal
          order={pendingOrder}
          onClose={() => setIsJuspayOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreContent />
      </CartProvider>
    </AuthProvider>
  );
}
