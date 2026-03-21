import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      const userData = {
        email: response.user?.email || response.email || credentials.email,
        full_name: response.user?.full_name || response.full_name || credentials.username,
        is_admin: response.user?.is_admin || response.is_admin || false
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    // Simulate generic response for now, real link would go to authService.register
    try {
       // mock implementation
       const newUser = { email: userData.email, full_name: userData.full_name, is_admin: false };
       setUser(newUser);
       return newUser;
    } catch (err) { throw err; }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
