import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, subscriptionAPI } from '../services/api';

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
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const cachedUser = localStorage.getItem('user');
      
      // If we have a cached user but no token, clear the cache
      if (cachedUser && !token) {
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          const userData = response.data.user;
          setUser(userData);
          // Update cached user data
          localStorage.setItem('user', JSON.stringify(userData));
          // Load subscription info
          await loadSubscription();
        } catch (error) {
          console.error('Auth check error:', error);
          // Only logout on 401 (unauthorized), not on network errors
          if (error.response?.status === 401) {
            console.log('Token invalid or expired, clearing auth data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // For network errors, try to use cached user data
            if (cachedUser) {
              try {
                const parsedUser = JSON.parse(cachedUser);
                console.log('Using cached user data due to network error');
                setUser(parsedUser);
              } catch (e) {
                console.error('Error parsing cached user:', e);
                localStorage.removeItem('user');
              }
            }
          }
        }
      } else if (cachedUser) {
        // No token but have cached user - clear it
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await subscriptionAPI.getSubscription();
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      await loadSubscription();
      return response.data;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const register = async (email, password, name, country, default_currency, mobile_number) => {
    try {
      const response = await authAPI.register({ email, password, name, country, default_currency, mobile_number });
      const { token, user, requiresVerification } = response.data;
      
      // If verification is required, don't set token/user yet
      if (requiresVerification) {
        return { ...response.data, requiresVerification: true };
      }
      
      // Only set token if user is verified
      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        await loadSubscription();
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const googleSignIn = async (credential) => {
    try {
      const response = await authAPI.googleSignIn(credential);
      const { token, user, needsProfileCompletion } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      await loadSubscription();
      return { ...response.data, needsProfileCompletion };
    } catch (error) {
      console.error('Google sign-in error in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setSubscription(null);
  };

  const isPremium = () => {
    return user?.subscription_tier === 'premium' && 
           user?.subscription_status === 'active';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    subscription,
    loading,
    login,
    register,
    googleSignIn,
    updateUser,
    logout,
    isPremium,
    loadSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

