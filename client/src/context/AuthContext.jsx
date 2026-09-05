import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('quickkart_token') || null);
  const [loading, setLoading] = useState(true);
  const [activeAddress, setActiveAddress] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          if (res.user.addresses && res.user.addresses.length > 0) {
            setActiveAddress(res.user.addresses[0]);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('quickkart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.addresses && res.user.addresses.length > 0) {
        setActiveAddress(res.user.addresses[0]);
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('quickkart_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.user.addresses && res.user.addresses.length > 0) {
        setActiveAddress(res.user.addresses[0]);
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('quickkart_token');
    setToken(null);
    setUser(null);
    setActiveAddress(null);
  };

  const addAddress = async (addr) => {
    const res = await api.addAddress(addr);
    if (res.success && res.addresses) {
      setUser(prev => ({ ...prev, addresses: res.addresses }));
      setActiveAddress(res.addresses[res.addresses.length - 1]);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeAddress,
        setActiveAddress,
        login,
        register,
        logout,
        addAddress,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
