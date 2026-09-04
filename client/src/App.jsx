import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import JuspayModal from './components/JuspayModal';
import AuthModal from './components/AuthModal';
import LocationModal from './components/LocationModal';
import OrderTracking from './components/OrderTracking';
import AdminDashboard from './components/AdminDashboard';
import { api } from './services/api';
import { Zap, Clock, ShieldCheck, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'All', label: 'All Items', icon: '⚡' },
  { name: 'Dairy & Breakfast', label: 'Dairy & Bread', icon: '🥛' },
  { name: 'Fruits & Vegetables', label: 'Fresh Fruits & Veggies', icon: '🍎' },
  { name: 'Snacks & Munchies', label: 'Chips & Namkeen', icon: '🍟' },
  { name: 'Beverages', label: 'Drinks & Juices', icon: '🥤' },
  { name: 'Instant Food', label: 'Maggi & Noodles', icon: '🍜' },
  { name: 'Chocolates & Sweets', label: 'Chocolates & Sweets', icon: '🍫' },
  { name: 'Personal & Home', label: 'Home Care & Hygiene', icon: '🧼' }
];

function StoreContent() {
  const { user, activeAddress } = useAuth();
  const { items, itemCount, totalAmount, clearCart, setIsCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Active Views
  const [activeView, setActiveView] = useState('store'); // 'store' | 'orders' | 'admin'
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isJuspayOpen, setIsJuspayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Load products from API
  const loadCatalog = async () => {
    setLoading(true);
    try {
      const prodRes = await api.getProducts({
        category: selectedCategory,
        search: searchTerm,
        limit: 50
      });

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
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

  // Handle checkout
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
      alert('Error initiating checkout. Please make sure backend is reachable.');
    }
  };

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
        onOpenLocation={() => setIsLocationOpen(true)}
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
            {/* Zepto/Blinkit Promo Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0C831F 0%, #05420E 100%)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 4px 16px rgba(12, 131, 31, 0.25)',
                marginBottom: '1.25rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ maxWidth: '520px', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  <Zap size={13} fill="#F7D000" color="#F7D000" />
                  <span>SUPERFAST QUICK COMMERCE</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '0.35rem' }}>
                  Groceries delivered in 8 to 10 minutes.
                </h1>
                <p style={{ opacity: 0.9, fontSize: '0.84rem' }}>
                  Over 1,000+ daily essentials from your nearest micro dark store.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, opacity: 0.9 }}>FREE DELIVERY</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#F7D000' }}>ABOVE ₹199</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Auto applied at checkout</div>
              </div>
            </div>

            {/* Zepto Style Circular Category Grid */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                  color: 'var(--text-main)'
                }}
              >
                Explore By Category
              </div>

              <div className="category-visual-grid">
                {CATEGORY_ITEMS.map((cat) => (
                  <div
                    key={cat.name}
                    className={`cat-circle-card ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    <div className="cat-icon-circle">{cat.icon}</div>
                    <span className="cat-name-label">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '0 0 1rem 0'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedCategory === 'All' ? 'Popular Essentials' : selectedCategory}
                </h2>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Showing {products.length} items available near you
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C831F' }}>
                  ⚡ Fetching fresh stock from dark store...
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
                <ShoppingBag size={44} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3>No items found</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Try changing your search term or select another category.
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

      {/* Floating Bottom Cart Bar (Zepto & Blinkit Iconic Mobile UX) */}
      {itemCount > 0 && activeView === 'store' && (
        <div
          className="floating-bottom-cart"
          onClick={() => setIsCartOpen(true)}
          role="button"
          aria-label="View Cart"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ShoppingCart size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 700 }}>
                {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>₹{totalAmount}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 900, fontSize: '0.94rem' }}>
            <span>VIEW CART</span>
            <ArrowRight size={18} />
          </div>
        </div>
      )}

      {/* Cart Drawer */}
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

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
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
