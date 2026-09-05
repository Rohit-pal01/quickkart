import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ onBackToStore }) {
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
    description: '',
    imageUrl: ''
  });
  const [formMsg, setFormMsg] = useState(null);

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

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'PAYMENT_FAILED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeDeliveries = orders.filter(o => ['CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-auth" onClick={onBackToStore}>
            <ArrowLeft size={16} />
            <span>Storefront</span>
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dark Store & Admin Hub</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn-auth ${activeTab === 'orders' ? 'active' : ''}`}
            style={{
              background: activeTab === 'orders' ? '#10B981' : 'white',
              color: activeTab === 'orders' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('orders')}
          >
            Live Orders ({orders.length})
          </button>
          <button
            className={`btn-auth ${activeTab === 'inventory' ? 'active' : ''}`}
            style={{
              background: activeTab === 'inventory' ? '#10B981' : 'white',
              color: activeTab === 'inventory' ? 'white' : 'var(--text-main)'
            }}
            onClick={() => setActiveTab('inventory')}
          >
            Stock Inventory ({products.length})
          </button>
          <button
            className={`btn-auth ${activeTab === 'users' ? 'active' : ''}`}
            style={{
              background: activeTab === 'users' ? '#10B981' : 'white',
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
              background: activeTab === 'add_product' ? '#10B981' : 'white',
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '0.3rem' }}>₹{totalRevenue}</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE DELIVERIES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.3rem' }}>{activeDeliveries}</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366F1', marginTop: '0.3rem' }}>{orders.length}</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE SKUs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '0.3rem' }}>{products.length}</div>
        </div>

        <div
          style={{ background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', cursor: 'pointer' }}
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
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>#{o.orderId}</strong>
                    </td>
                    <td>
                      <div>{o.userId?.name || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.userId?.phone}</div>
                    </td>
                    <td>
                      {o.items?.map(i => `${i.qty}x ${i.name}`).join(', ') || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 800 }}>₹{o.totalAmount}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border-light)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          background:
                            o.status === 'CONFIRMED'
                              ? '#ECFDF5'
                              : o.status === 'DELIVERED'
                              ? '#E0F2FE'
                              : o.status === 'CANCELLED'
                              ? '#FEE2E2'
                              : 'white'
                        }}
                      >
                        <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                        <option value="CONFIRMED">CONFIRMED (Placed)</option>
                        <option value="PACKED">PACKED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Inventory Tab */}
      {activeTab === 'inventory' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Available Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={p.imageUrl} alt="" style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customers / Users Tab */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Registered Users & Customers</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Total of {users.length} accounts created across QuickKart</p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', background: '#FDF2F8', color: '#EC4899', borderRadius: '9999px' }}>
              {users.length} Total Users
            </span>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Default Address</th>
                <th>Registered On</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u._id}>
                    <td><strong>{idx + 1}</strong></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{u.phone || 'N/A'}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: u.role === 'admin' ? '#FEF3C7' : '#DCFCE7',
                          color: u.role === 'admin' ? '#B45309' : '#15803D'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {u.addresses && u.addresses.length > 0 ? u.addresses[0].line1 : 'No address saved'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name, u.role)}
                          title={`Delete account for ${u.name}`}
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            transition: 'var(--transition)'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Form Tab */}
      {activeTab === 'add_product' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', maxWidth: '600px' }}>
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
    </div>
  );
}
