import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
import {
  Zap,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  ShoppingCart,
  Layers,
  Milk,
  Apple,
  Cookie,
  CupSoda,
  Utensils,
  Gift,
  Sparkles,
  Bike,
  CheckCircle2
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'All', label: 'All Items', Icon: Layers, color: '#0b5e54', bg: 'rgba(81, 226, 245, 0.22)' },
  { name: 'Dairy & Breakfast', label: 'Dairy & Bread', Icon: Milk, color: '#0284C7', bg: 'rgba(157, 249, 239, 0.3)' },
  { name: 'Fruits & Vegetables', label: 'Fresh Fruits', Icon: Apple, color: '#16A34A', bg: '#DCFCE7' },
  { name: 'Snacks & Munchies', label: 'Chips & Snacks', Icon: Cookie, color: '#9c384e', bg: 'rgba(255, 168, 182, 0.32)' },
  { name: 'Beverages', label: 'Cold Drinks', Icon: CupSoda, color: '#088395', bg: 'rgba(81, 226, 245, 0.25)' },
  { name: 'Instant Food', label: 'Instant Food', Icon: Utensils, color: '#704f57', bg: 'rgba(162, 128, 137, 0.22)' },
  { name: 'Chocolates & Sweets', label: 'Chocolates', Icon: Gift, color: '#a83256', bg: 'rgba(255, 168, 182, 0.38)' },
  { name: 'Personal & Home', label: 'Home Hygiene', Icon: Sparkles, color: '#09707e', bg: 'rgba(81, 226, 245, 0.35)' }
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
            {/* Zepto/Blinkit Promo Banner with Custom Brand Palette */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d2822 0%, #153a41 45%, #463b41 100%)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem 1.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(81, 226, 245, 0.18)',
                border: '1px solid rgba(81, 226, 245, 0.25)',
                marginBottom: '1.35rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Subtle ambient lighting */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(255, 168, 182, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '20%',
                  width: '160px',
                  height: '160px',
                  background: 'radial-gradient(circle, rgba(81, 226, 245, 0.2) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <div style={{ maxWidth: '520px', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(237, 247, 86, 0.15)',
                    border: '1px solid rgba(237, 247, 86, 0.45)',
                    color: 'var(--dusty-white)',
                    padding: '0.22rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginBottom: '0.55rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  <Zap size={13} fill="var(--dusty-white)" color="var(--dusty-white)" />
                  <span>SUPERFAST QUICK COMMERCE</span>
                </div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '0.35rem', letterSpacing: '-0.4px' }}>
                  Groceries & Essentials delivered in <span style={{ color: 'var(--blue-green)' }}>8 to 10 minutes</span>.
                </h1>
                <p style={{ opacity: 0.9, fontSize: '0.86rem', color: '#E2E8F0' }}>
                  Over 1,000+ daily essentials from your nearest micro dark store.
                </p>
              </div>

              {/* Zepto / Rapido style Free Delivery Perk Pass */}
              <div
                style={{
                  background: 'rgba(12, 26, 28, 0.72)',
                  backdropFilter: 'blur(14px)',
                  padding: '1.05rem 1.3rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid rgba(81, 226, 245, 0.4)',
                  zIndex: 2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  minWidth: '245px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: 'rgba(157, 249, 239, 0.18)',
                      border: '1px solid var(--blue-green)',
                      color: 'var(--blue-green)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.4px'
                    }}
                  >
                    <Bike size={12} strokeWidth={2.5} />
                    <span>ZERO DELIVERY FEE</span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--pink-sand)',
                      background: 'rgba(255, 168, 182, 0.18)',
                      border: '1px solid rgba(255, 168, 182, 0.35)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    SAVE ₹25
                  </span>
                </div>

                <div style={{ marginTop: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--dusty-white)', letterSpacing: '-0.3px' }}>
                      ₹0 Delivery
                    </span>
                    <span style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                      ₹25
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600, marginTop: '0.1rem' }}>
                    Unlocked on all orders above <strong style={{ color: 'var(--blue-green)' }}>₹199</strong>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.71rem',
                    color: 'var(--blue-green)',
                    fontWeight: 700,
                    borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                    paddingTop: '0.45rem',
                    marginTop: '0.15rem'
                  }}
                >
                  <CheckCircle2 size={13} color="var(--blue-green)" />
                  <span>Auto-applied at checkout • No code needed</span>
                </div>
              </div>
            </div>

            {/* Rapido / Zepto Style Value Proposition Quick Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.35rem'
              }}
            >
              <div className="perk-card perk-card-delivery">
                <div className="perk-icon-wrap perk-icon-delivery">
                  <Bike size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>Free Delivery Above ₹199</div>
                  <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>Zero delivery fee on all eligible orders</div>
                </div>
              </div>

              <div className="perk-card">
                <div className="perk-icon-wrap perk-icon-speed">
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>8-10 Mins Express</div>
                  <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>Instant dispatch from nearest dark store</div>
                </div>
              </div>

              <div className="perk-card">
                <div className="perk-icon-wrap perk-icon-quality">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>100% Quality Assured</div>
                  <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)' }}>Hygienically packed & certified items</div>
                </div>
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
                    <div
                      className="cat-icon-circle"
                      style={{
                        color: selectedCategory === cat.name ? '#FFFFFF' : cat.color,
                        background: selectedCategory === cat.name ? '#0C831F' : cat.bg
                      }}
                    >
                      <cat.Icon size={25} strokeWidth={2.3} />
                    </div>
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
                  background: 'var(--bg-card)',
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
              <div style={{ fontSize: '0.72rem', color: 'var(--blue-green)', fontWeight: 800, letterSpacing: '0.3px' }}>
                {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--dusty-white)' }}>₹{totalAmount}</div>
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
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <StoreContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
