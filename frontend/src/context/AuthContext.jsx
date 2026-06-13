import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on mount
  useEffect(() => {
    async function checkSession() {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Proactively verify token validity with backend
          const response = await apiClient.get('/auth/me');
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (err) {
          console.error('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    checkSession();
  }, []);

  /**
   * Log in a user.
   */
  async function login(email, password) {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
      setLoading(false);
      throw err;
    }
  }

  /**
   * Register a new user.
   */
  async function register(name, email, password, role) {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      const { user: userData, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      setLoading(false);
      throw err;
    }
  }

  /**
   * Log out the current user.
   */
  async function logout() {
    setLoading(true);
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (err) {
        console.error('Logout request to server failed:', err.message);
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    setLoading(false);
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
