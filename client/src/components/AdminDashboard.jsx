import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Shield,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)'
];

const getAvatarGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

export default function AdminDashboard({ onBackToStore, onViewOrder }) {
  const { isDark } = useTheme();
  const { impersonate } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'users' | 'add_product'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Dairy & Breakfast',
    price: '',
    unit: '',
    stock: '',
    dietType: 'Vegetarian',
    shelfLife: '',
    description: '',
    imageUrl: ''
  });
  const [formMsg, setFormMsg] = useState(null);

  // Edit product state & modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  // Inventory search, filter & pagination state
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(10);

  // Orders search, filter & pagination state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  // Customers search, filter & pagination state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  const getStatusStyle = (status) => {
    const styles = {
      CONFIRMED: {
        bg: isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5',
        text: isDark ? '#34D399' : '#065F46',
        border: isDark ? '#059669' : '#A7F3D0'
      },
      PACKED: {
        bg: isDark ? 'rgba(245, 158, 11, 0.22)' : '#FEF3C7',
        text: isDark ? '#FBBF24' : '#92400E',
        border: isDark ? '#D97706' : '#FDE68A'
      },
      OUT_FOR_DELIVERY: {
        bg: isDark ? 'rgba(99, 102, 241, 0.25)' : '#EEF2FF',
        text: isDark ? '#A5B4FC' : '#3730A3',
        border: isDark ? '#6366F1' : '#C7D2FE'
      },
      DELIVERED: {
        bg: isDark ? 'rgba(14, 165, 233, 0.22)' : '#E0F2FE',
        text: isDark ? '#38BDF8' : '#075985',
        border: isDark ? '#0284C7' : '#BAE6FD'
      },
      CANCELLED: {
        bg: isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEE2E2',
        text: isDark ? '#F87171' : '#991B1B',
        border: isDark ? '#DC2626' : '#FECACA'
      },
      PENDING_PAYMENT: {
        bg: isDark ? 'rgba(148, 163, 184, 0.18)' : '#F1F5F9',
        text: isDark ? '#CBD5E1' : '#334155',
        border: isDark ? '#475569' : '#CBD5E1'
      }
    };
    return styles[status] || {
      bg: isDark ? '#1E293B' : '#F1F5F9',
      text: isDark ? '#F8FAFC' : '#1C1C1C',
      border: isDark ? '#334155' : '#E2E8F0'
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.getAllOrders(),
        api.getProducts({ limit: 100 }),
        api.getAllUsers()
      ]);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (usersRes.success) setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (userRole === 'admin') {
      alert('Admin accounts cannot be deleted directly from this button for security.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        alert(res.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Server error deleting user');
    }
  };

  const handleImpersonateUser = async (targetUser) => {
    if (!window.confirm(`Switch session and log in as customer "${targetUser.name}" (${targetUser.email})?`)) {
      return;
    }
    try {
      const res = await api.impersonateUser(targetUser._id);
      if (res.success && res.token) {
        impersonate(res.user, res.token);
        alert(`Session switched! You are now logged in as ${targetUser.name}.`);
        onBackToStore();
      } else {
        alert(res.message || 'Failed to switch to customer account');
      }
    } catch (err) {
      alert('Error switching account session');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await api.createProduct({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      });
      if (res.success) {
        setFormMsg({ type: 'success', text: 'Product added successfully!' });
        setNewProduct({
          name: '',
          category: 'Dairy & Breakfast',
          price: '',
          unit: '',
          stock: '',
          dietType: 'Vegetarian',
          shelfLife: '',
          description: '',
          imageUrl: ''
        });
        fetchData();
      } else {
        setFormMsg({ type: 'error', text: res.message || 'Error adding product' });
      }
    } catch (err) {
      setFormMsg({ type: 'error', text: 'Server error adding product' });
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}" from the store inventory?`)) {
      return;
    }
    try {
      const res = await api.deleteProduct(productId);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        alert(res.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Server error deleting product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    try {
      const res = await api.updateProduct(editingProduct._id, {
        name: editingProduct.name,
        category: editingProduct.category,
        price: Number(editingProduct.price),
        unit: editingProduct.unit,
        stock: Number(editingProduct.stock),
        dietType: editingProduct.dietType || 'Vegetarian',
        shelfLife: editingProduct.shelfLife || '',
        description: editingProduct.description,
        imageUrl: editingProduct.imageUrl,
        isActive: editingProduct.isActive !== undefined ? editingProduct.isActive : true
      });
      if (res.success) {
        setProducts(prev =>
          prev.map(p => (p._id === editingProduct._id ? (res.product || { ...p, ...editingProduct }) : p))
        );
        setEditingProduct(null);
      } else {
        alert(res.message || 'Failed to update product specifications');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Server error updating product specifications');
    } finally {
      setEditLoading(false);
    }
  };

  const availableCategories = Array.from(
    new Set([
      'Dairy & Breakfast',
      'Fruits & Vegetables',
      'Snacks & Munchies',
      'Beverages',
      'Instant Food',
      'Bakery',
      ...products.map(p => p.category).filter(Boolean)
    ])
  );

  const filteredProducts = products.filter(p => {
    const matchesSearch = !inventorySearch ||
      p.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCat = inventoryCategory === 'All' || p.category === inventoryCategory;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.userId?.name?.toLowerCase().includes(q) ||
      o.userId?.phone?.includes(q) ||
      o.items?.some(i => i.name?.toLowerCase().includes(q));

    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    const q = userSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.addresses?.some(a =>
        a.line1?.toLowerCase().includes(q) ||
        a.label?.toLowerCase().includes(q)
      );

    const matchesRole = userRoleFilter === 'ALL' || u.role?.toLowerCase() === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Orders pagination
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderPageSize));
  const currentOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = filteredOrders.slice((currentOrderPage - 1) * orderPageSize, currentOrderPage * orderPageSize);

  // Products / Inventory pagination
  const totalInventoryPages = Math.max(1, Math.ceil(filteredProducts.length / inventoryPageSize));
  const currentInventoryPage = Math.min(inventoryPage, totalInventoryPages);
  const paginatedProducts = filteredProducts.slice((currentInventoryPage - 1) * inventoryPageSize, currentInventoryPage * inventoryPageSize);

  // Users pagination
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
  const currentUserPage = Math.min(userPage, totalUserPages);
  const paginatedUsers = filteredUsers.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize);

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'PAYMENT_FAILED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeDeliveries = orders.filter(o => ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;

  // Reusable pagination bar for Orders, Inventory, and Customers
  const renderPagination = (currentPage, totalPages, pageSize, setPageSize, setPage, totalItems, label) => {
    if (totalItems === 0) return null;
    return (
      <div
        className="admin-pagination-bar"
        style={{
          padding: '0.9rem 1.5rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
            <strong>{totalItems}</strong> {label}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="search-input"
              style={{
                height: '28px',
                padding: '0 0.5rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="btn-auth"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                opacity: currentPage <= 1 ? 0.4 : 1,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span style={{ padding: '0 0.2rem' }}>...</span>}
                    <button
                      onClick={() => setPage(p)}
                      style={{
                        minWidth: '30px',
                        height: '30px',
                        padding: '0 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: currentPage === p ? '1px solid #10B981' : '1px solid var(--border-light)',
                        background: currentPage === p ? '#10B981' : 'var(--bg-card)',
                        color: currentPage === p ? '#FFF' : 'var(--text-main)',
                        fontWeight: currentPage === p ? 700 : 500,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="btn-auth"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                opacity: currentPage >= totalPages ? 0.4 : 1,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-auth" onClick={onBackToStore}>
            <ArrowLeft size={16} />
            <span>Storefront</span>
          </button>
          <h1 className="admin-main-title" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Dark Store & Admin Hub
          </h1>
        </div>

        <div className="admin-tabs-bar">
          <button
            className={`btn-auth ${activeTab === 'orders' ? 'active' : ''}`}
            style={{
              background: activeTab === 'orders' ? '#10B981' : 'var(--bg-card)',
              color: activeTab === 'orders' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('orders')}
          >
            Live Orders ({orders.length})
          </button>
          <button
            className={`btn-auth ${activeTab === 'inventory' ? 'active' : ''}`}
            style={{
              background: activeTab === 'inventory' ? '#10B981' : 'var(--bg-card)',
              color: activeTab === 'inventory' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('inventory')}
          >
            Stock Inventory ({products.length})
          </button>
          <button
            className={`btn-auth ${activeTab === 'users' ? 'active' : ''}`}
            style={{
              background: activeTab === 'users' ? '#10B981' : 'var(--bg-card)',
              color: activeTab === 'users' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} />
            <span>Customers ({users.length})</span>
          </button>
          <button
            className={`btn-auth ${activeTab === 'add_product' ? 'active' : ''}`}
            style={{
              background: activeTab === 'add_product' ? '#10B981' : 'var(--bg-card)',
              color: activeTab === 'add_product' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('add_product')}
          >
            <Plus size={15} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '0.3rem' }}>₹{totalRevenue}</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE DELIVERIES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.3rem' }}>{activeDeliveries}</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366F1', marginTop: '0.3rem' }}>{orders.length}</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE SKUs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.3rem' }}>{products.length}</div>
        </div>

        <div
          style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', cursor: 'pointer' }}
          onClick={() => setActiveTab('users')}
          title="Click to view all registered customers"
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>REGISTERED CUSTOMERS</span>
            <Users size={15} color="#EC4899" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EC4899', marginTop: '0.3rem' }}>{users.length}</div>
        </div>
      </div>

      {/* Live Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          {/* Orders Search & Filter Controls Header */}
          <div
            className="admin-card-header"
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Live Customer Orders</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Showing {filteredOrders.length} of {orders.length} orders. Search by Order ID, Customer Name, Phone, or Item.
              </p>
            </div>

            <div className="admin-controls-row">
              <div className="admin-search-wrap">
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search order ID, name, phone..."
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value);
                    setOrderPage(1);
                  }}
                  className="search-input"
                  style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: orderSearch ? '2rem' : '0.75rem', fontSize: '0.85rem', height: '42px', minHeight: '42px', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }}
                />
                {orderSearch && (
                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderPage(1);
                    }}
                    style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    aria-label="Clear search"
                  >
                    <X size={14} color="var(--text-muted)" />
                  </button>
                )}
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="admin-filter-select"
                style={{
                  height: '42px',
                  minHeight: '42px',
                  lineHeight: '1.4',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PACKED">PACKED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container admin-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status Transition</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      {orders.length === 0
                        ? 'No orders placed yet.'
                        : `No orders matching "${orderSearch}" with status "${orderStatusFilter}".`}
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => onViewOrder && onViewOrder(o.orderId)}
                          title={`Click to track order #${o.orderId}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#10B981',
                            fontWeight: 800,
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            textDecoration: 'underline'
                          }}
                        >
                          #{o.orderId}
                        </button>
                      </td>
                      <td style={{ minWidth: '130px' }}>
                        <div>{o.userId?.name || 'Customer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.userId?.phone}</div>
                      </td>
                      <td style={{ minWidth: '190px', maxWidth: '300px', lineHeight: 1.45 }}>
                        {o.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>₹{o.totalAmount}</td>
                      <td style={{ minWidth: '165px', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const sStyle = getStatusStyle(o.status);
                          return (
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o._id, e.target.value)}
                              style={{
                                padding: '0.4rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: `1.5px solid ${sStyle.border}`,
                                background: sStyle.bg,
                                color: sStyle.text,
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                outline: 'none',
                                letterSpacing: '0.3px',
                                transition: 'var(--transition)'
                              }}
                            >
                              <option value="PENDING_PAYMENT" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>PENDING_PAYMENT</option>
                              <option value="CONFIRMED" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>CONFIRMED (Placed)</option>
                              <option value="PACKED" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>PACKED</option>
                              <option value="OUT_FOR_DELIVERY" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>OUT_FOR_DELIVERY</option>
                              <option value="DELIVERED" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>DELIVERED</option>
                              <option value="CANCELLED" style={{ background: isDark ? '#131B2E' : '#FFFFFF', color: isDark ? '#F8FAFC' : '#1C1C1C' }}>CANCELLED</option>
                            </select>
                          );
                        })()}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Orders Card View (Zero horizontal scroll needed - 100% visible on mobile) */}
          <div className="admin-mobile-card-list">
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                {orders.length === 0
                  ? 'No orders placed yet.'
                  : `No orders matching "${orderSearch}" with status "${orderStatusFilter}".`}
              </div>
            ) : (
              paginatedOrders.map((o) => {
                const sStyle = getStatusStyle(o.status);
                return (
                  <div
                    key={o._id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.9rem',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {/* Top Row: Order ID + Time + Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={() => onViewOrder && onViewOrder(o.orderId)}
                          title={`Click to track order #${o.orderId}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#10B981',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            textDecoration: 'underline'
                          }}
                        >
                          #{o.orderId}
                        </button>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          • {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${sStyle.border}`,
                          background: sStyle.bg,
                          color: sStyle.text,
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}
                      >
                        {o.status}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.45rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {o.userId?.name || 'Customer'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {o.userId?.phone || 'No phone'}
                      </span>
                    </div>

                    {/* Items list */}
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', marginBottom: '0.15rem' }}>ITEMS ORDERED:</span>
                      {o.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || 'N/A'}
                    </div>

                    {/* Total Amount & Status Transition Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.55rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL AMOUNT</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{o.totalAmount}</div>
                      </div>

                      <div style={{ flex: 1, maxWidth: '190px' }}>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${sStyle.border}`,
                            background: sStyle.bg,
                            color: sStyle.text,
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            outline: 'none',
                            minHeight: '38px',
                            lineHeight: '1.4',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {renderPagination(currentOrderPage, totalOrderPages, orderPageSize, setOrderPageSize, setOrderPage, filteredOrders.length, 'orders')}
        </div>
      )}

      {/* Stock Inventory Tab */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          {/* Inventory Controls Header */}
          <div
            className="admin-card-header"
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Live Stock Inventory & Catalog</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Showing {filteredProducts.length} of {products.length} products. Edit specs, update image links, or delete items.
              </p>
            </div>

            <div className="admin-controls-row">
              <div className="admin-search-wrap">
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={inventorySearch}
                  onChange={(e) => {
                    setInventorySearch(e.target.value);
                    setInventoryPage(1);
                  }}
                  className="search-input"
                  style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: inventorySearch ? '2rem' : '0.75rem', fontSize: '0.85rem', height: '42px', minHeight: '42px', borderRadius: 'var(--radius-md)', boxSizing: 'border-box' }}
                />
                {inventorySearch && (
                  <button
                    onClick={() => {
                      setInventorySearch('');
                      setInventoryPage(1);
                    }}
                    style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    aria-label="Clear search"
                  >
                    <X size={14} color="var(--text-muted)" />
                  </button>
                )}
              </div>

              <select
                value={inventoryCategory}
                onChange={(e) => {
                  setInventoryCategory(e.target.value);
                  setInventoryPage(1);
                }}
                className="admin-filter-select"
                style={{
                  height: '42px',
                  minHeight: '42px',
                  lineHeight: '1.4',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="All">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                className="btn-checkout"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                onClick={() => setActiveTab('add_product')}
              >
                <Plus size={15} />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="admin-table-container admin-desktop-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No items found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={p.imageUrl}
                            alt=""
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                            style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' }}
                          />
                          <div>
                            <span style={{ fontWeight: 700, display: 'block' }}>{p.name}</span>
                            {p.description && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontWeight: 800 }}>₹{p.price}</td>
                      <td>{p.unit}</td>
                      <td>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: p.stock > 10 ? '#ECFDF5' : '#FEF3C7',
                            color: p.stock > 10 ? '#059669' : '#D97706'
                          }}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        <span style={{ color: p.isActive ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '0.8rem' }}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            title="Edit product specifications and image link"
                            onClick={() => setEditingProduct({ ...p })}
                            style={{
                              background: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
                              border: '1px solid rgba(59, 130, 246, 0.35)',
                              color: '#3B82F6',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.76rem'
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            title="Permanently delete item"
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            style={{
                              background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#EF4444',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.35rem 0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.76rem'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Inventory Cards View */}
          <div className="admin-mobile-card-list">
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No items found matching your filter criteria.
              </div>
            ) : (
              paginatedProducts.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={p.imageUrl}
                      alt=""
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>{p.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.category} • {p.unit}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-light)', paddingTop: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRICE / UNIT</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{p.price}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: p.stock > 10 ? '#ECFDF5' : '#FEF3C7',
                          color: p.stock > 10 ? '#059669' : '#D97706'
                        }}
                      >
                        {p.stock} units
                      </span>
                      <span style={{ color: p.isActive ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '0.75rem' }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...p })}
                      style={{
                        background: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        color: '#3B82F6',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p._id, p.name)}
                      style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#EF4444',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {renderPagination(currentInventoryPage, totalInventoryPages, inventoryPageSize, setInventoryPageSize, setInventoryPage, filteredProducts.length, 'products')}
        </div>
      )}

      {/* Customers / Users Tab */}
      {activeTab === 'users' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Customers Header & Stats */}
          <div
            style={{
              padding: '1.35rem 1.75rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    background: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={18} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Registered Users & Directory</h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Customer profiles, delivery addresses, and one-click session impersonation.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.85rem',
                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                  color: isDark ? '#34D399' : '#047857',
                  border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #A7F3D0',
                  borderRadius: '9999px'
                }}
              >
                {users.length} Total Accounts
              </span>
            </div>
          </div>

          {/* Dedicated Filter & Search Toolbar */}
          <div
            className="admin-card-header"
            style={{
              padding: '0.85rem 1.75rem',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem'
            }}
          >
            {/* Search customer input */}
            <div className="admin-search-wrap" style={{ flex: '1', minWidth: '220px', maxWidth: '420px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or address..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="search-input"
                style={{
                  width: '100%',
                  paddingLeft: '2.4rem',
                  paddingRight: userSearch ? '2.2rem' : '0.85rem',
                  fontSize: '0.84rem',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)'
                }}
              />
              {userSearch && (
                <button
                  onClick={() => {
                    setUserSearch('');
                    setUserPage(1);
                  }}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Clear search"
                >
                  <X size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: 'All', count: users.length },
                { key: 'customer', label: 'Customers', count: users.filter(u => u.role === 'customer').length },
                { key: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length },
                { key: 'delivery', label: 'Riders', count: users.filter(u => u.role === 'delivery').length }
              ].map((tab) => {
                const isActive = userRoleFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setUserRoleFilter(tab.key);
                      setUserPage(1);
                    }}
                    style={{
                      border: isActive ? '1px solid #10B981' : '1px solid var(--border-light)',
                      background: isActive ? '#10B981' : 'var(--bg-card)',
                      color: isActive ? '#FFFFFF' : 'var(--text-main)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
                        color: isActive ? '#FFFFFF' : 'var(--text-muted)'
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-table-container admin-desktop-table">
            <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>Customer</th>
                <th>Contact Details</th>
                <th>Role</th>
                <th>Default Address</th>
                <th>Registered On</th>
                <th style={{ textAlign: 'center', width: '170px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                      <Users size={36} style={{ opacity: 0.35 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {users.length === 0
                          ? 'No registered customers found.'
                          : `No accounts matching "${userSearch || userRoleFilter}"`}
                      </div>
                      <p style={{ fontSize: '0.82rem', margin: 0 }}>
                        {users.length === 0
                          ? 'Accounts created by shoppers will appear here.'
                          : 'Try adjusting your search terms or filter selection.'}
                      </p>
                      {(userSearch || userRoleFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setUserSearch('');
                            setUserRoleFilter('ALL');
                            setUserPage(1);
                          }}
                          className="btn-auth"
                          style={{
                            marginTop: '0.6rem',
                            padding: '0.4rem 0.9rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          Clear Search & Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const itemIndex = (currentUserPage - 1) * userPageSize + idx + 1;
                  const isAdmin = u.role === 'admin';
                  const isDelivery = u.role === 'delivery';

                  return (
                    <tr key={u._id}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <strong>{itemIndex}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: getAvatarGradient(u.name),
                              color: '#FFFFFF',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 5px rgba(0,0,0,0.12)'
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ID: {u._id ? u._id.slice(-6).toUpperCase() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                            <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <Phone size={12} style={{ flexShrink: 0 }} />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.22rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: isAdmin
                              ? (isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7')
                              : isDelivery
                              ? (isDark ? 'rgba(99, 102, 241, 0.18)' : '#EEF2FF')
                              : (isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5'),
                            color: isAdmin
                              ? (isDark ? '#FBBF24' : '#B45309')
                              : isDelivery
                              ? (isDark ? '#A5B4FC' : '#4338CA')
                              : (isDark ? '#34D399' : '#047857'),
                            border: isAdmin
                              ? '1px solid rgba(245, 158, 11, 0.3)'
                              : isDelivery
                              ? '1px solid rgba(99, 102, 241, 0.3)'
                              : '1px solid rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAdmin ? '#F59E0B' : isDelivery ? '#6366F1' : '#10B981' }}></span>
                          {isAdmin ? 'Admin' : isDelivery ? 'Delivery' : 'Customer'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                        {u.addresses && u.addresses.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                            <MapPin size={13} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <div style={{ color: 'var(--text-main)', lineHeight: '1.3' }}>{u.addresses[0].line1}</div>
                              {u.addresses[0].label && (
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginTop: '0.2rem', display: 'inline-block' }}>
                                  {u.addresses[0].label}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No address saved</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          {!isAdmin ? (
                            <>
                              <button
                                onClick={() => handleImpersonateUser(u)}
                                title={`Log in as customer ${u.name}`}
                                style={{
                                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                                  border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #A7F3D0',
                                  color: isDark ? '#34D399' : '#047857',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.35rem 0.65rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <LogIn size={13} />
                                <span>Login As</span>
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u._id, u.name, u.role)}
                                title={`Delete account for ${u.name}`}
                                style={{
                                  background: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                                  border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #FECACA',
                                  color: '#EF4444',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.35rem 0.5rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                padding: '0.3rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-subtle)'
                              }}
                            >
                              <Shield size={12} color="#F59E0B" />
                              <span>Protected</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Customers Card View */}
        <div className="admin-mobile-card-list">
          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              No accounts matching your filter.
            </div>
          ) : (
            paginatedUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <div
                  key={u._id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: getAvatarGradient(u.name),
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          flexShrink: 0
                        }}
                      >
                        {(u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {u._id ? u._id.slice(-6).toUpperCase() : 'N/A'}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: isAdmin ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: isAdmin ? '#EF4444' : '#10B981',
                        border: isAdmin ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px dashed var(--border-light)', paddingTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)' }}>
                      <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span>{u.phone}</span>
                      </div>
                    )}
                    {u.addresses && u.addresses.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <MapPin size={13} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span>{u.addresses[0].line1}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.55rem', marginTop: '0.1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                    </span>

                    {!isAdmin ? (
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          onClick={() => handleImpersonateUser(u)}
                          style={{
                            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #A7F3D0',
                            color: isDark ? '#34D399' : '#047857',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.76rem',
                            fontWeight: 700
                          }}
                        >
                          <LogIn size={13} />
                          <span>Login As</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name, u.role)}
                          style={{
                            background: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                            border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #FECACA',
                            color: '#EF4444',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.35rem 0.5rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Shield size={12} color="#F59E0B" /> Protected Admin
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {renderPagination(currentUserPage, totalUserPages, userPageSize, setUserPageSize, setUserPage, filteredUsers.length, 'customers')}
        </div>
      )}

      {/* Add Product Form Tab */}
      {activeTab === 'add_product' && (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Product to Dark Store</h2>

          {formMsg && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                background: formMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: formMsg.type === 'success' ? '#065F46' : '#991B1B',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Product Name</label>
              <input
                type="text"
                required
                className="search-input"
                style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                placeholder="e.g. Organic Almond Milk"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                <select
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Dairy & Breakfast">Dairy & Breakfast</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Snacks & Munchies">Snacks & Munchies</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Instant Food">Instant Food</option>
                  <option value="Bakery">Bakery</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Price (₹)</label>
                <input
                  type="number"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                  placeholder="e.g. 75"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Unit / Weight</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                  placeholder="e.g. 500 ml / 1 kg"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Stock Quantity</label>
                <input
                  type="number"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                  placeholder="e.g. 100"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Image URL</label>
              <input
                type="url"
                className="search-input"
                style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                placeholder="https://images.unsplash.com/..."
                value={newProduct.imageUrl}
                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Diet Type</label>
                <select
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '0.75rem', width: '100%' }}
                  value={newProduct.dietType || 'Vegetarian'}
                  onChange={(e) => setNewProduct({ ...newProduct, dietType: e.target.value })}
                >
                  <option value="Vegetarian">Vegetarian (100% Veg)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Contains Egg">Contains Egg</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Shelf Life</label>
                <input
                  type="text"
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                  placeholder="e.g. Best before 7 days"
                  value={newProduct.shelfLife}
                  onChange={(e) => setNewProduct({ ...newProduct, shelfLife: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
              <textarea
                className="search-input"
                style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', minHeight: '70px' }}
                placeholder="Brief product description..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-checkout" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Add Product to Catalog
            </button>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setEditingProduct(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Edit Product Specifications</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Update name, pricing, stock, description, or image link
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.3rem', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Product Name</label>
                <input
                  type="text"
                  required
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              {/* Category & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                  <select
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '0.75rem', width: '100%' }}
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
              </div>

              {/* Unit & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Unit / Weight</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                    placeholder="e.g. 500 ml / 1 kg"
                    value={editingProduct.unit || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Available Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  />
                </div>
              </div>

              {/* Image URL with live preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Product Image Link / URL
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', flex: 1 }}
                    placeholder="Image URL or local path e.g. /dahi.jpg or https://..."
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  />
                  {editingProduct.imageUrl && (
                    <img
                      src={editingProduct.imageUrl}
                      alt="Preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                      onLoad={(e) => { e.target.style.display = 'block'; }}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        border: '2px solid var(--border-light)',
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Paste any direct image URL (Unsplash, Cloudinary, etc.) or local file path
                </span>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', minHeight: '65px', resize: 'vertical', width: '100%' }}
                  placeholder="Product details & specifications..."
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              {/* Diet Type & Shelf Life */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Diet Type</label>
                  <select
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '0.75rem', width: '100%' }}
                    value={editingProduct.dietType || 'Vegetarian'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dietType: e.target.value })}
                  >
                    <option value="Vegetarian">Vegetarian (100% Veg)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Contains Egg">Contains Egg</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Shelf Life</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem', width: '100%' }}
                    placeholder="e.g. Best before 7 days from packaging"
                    value={editingProduct.shelfLife || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                  />
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Status</label>
                <select
                  className="search-input"
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '0.75rem', width: '100%' }}
                  value={editingProduct.isActive !== false ? 'true' : 'false'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active (Visible in Store)</option>
                  <option value="false">Inactive (Hidden from Store)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-auth"
                  style={{ padding: '0.6rem 1.2rem' }}
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-checkout"
                  style={{ padding: '0.6rem 1.5rem', justifyContent: 'center' }}
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
