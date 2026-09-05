const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('quickkart_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addAddress(address) {
    const res = await fetch(`${API_BASE}/auth/address`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address)
    });
    return res.json();
  },

  async getAllUsers() {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.sort) query.append('sort', params.sort);
    if (params.inStock) query.append('inStock', 'true');
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Orders
  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload)
    });
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getOrderById(identifier) {
    const res = await fetch(`${API_BASE}/orders/${identifier}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAllOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async cancelOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Juspay Payment integration
  async createPaymentSession(orderId) {
    const res = await fetch(`${API_BASE}/payments/create-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId })
    });
    return res.json();
  },

  async verifyPaymentStatus(orderId) {
    const res = await fetch(`${API_BASE}/payments/verify-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId })
    });
    return res.json();
  },

  async simulatePayment(orderId, status = 'CHARGED', paymentMethod = 'UPI') {
    const res = await fetch(`${API_BASE}/payments/simulate-sandbox-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, paymentMethod })
    });
    return res.json();
  }
};
