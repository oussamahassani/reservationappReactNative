import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_URL, ENDPOINTS } from '../config/apiConfig';

// Helper function to handle storage based on platform
const storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return window.localStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      return false;
    }
  },
  
  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },

  async clearAll() {
    try {
      if (Platform.OS === 'web') {
        window.localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  updatePassword: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = await storage.getItem('user');
        
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } catch (err) {
            await storage.removeItem('user');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
          console.error(`${API_URL}${ENDPOINTS.LOGIN}`);

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to login');
      }

      const userData = result.data;
      
      await storage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const registerData = {
        firstName: userData.firstName || userData.prenom,
        lastName: userData.lastName || userData.nom,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        role: userData.role || 'user'
      };
      
      console.log('Signup data:', registerData);
      
      const response = await fetch(`${API_URL}${ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register');
      }

      return result.data;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await storage.clearAll();
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  const updateUserProfile = async (updateData) => {
    if (!user || !user.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USER_BY_ID(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      const updatedUser = { ...user, ...updateData };
      await storage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!user || !user.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USER_BY_ID(user.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update password');
      }

      return true;
    } catch (error) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Updated forgotPassword to be simpler without loading state
  const forgotPassword = async (email, resetCode) => {
    setError(null);
    
    try {
      console.log(`Sending forgot password request for ${email} with code ${resetCode}`);
      
      // Store the reset code temporarily in local storage to persist between app states
      await storage.setItem('tempResetCode', resetCode);
      await storage.setItem('tempResetEmail', email);
      
      const response = await fetch(`${API_URL}${ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          resetCode 
        }),
      });

      const result = await response.json();
      console.log('Forgot password response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to request password reset');
      }

      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to request password reset. Please try again.');
      throw error;
    }
  };

  // Updated resetPassword to be simpler without loading state
  const resetPassword = async (email, resetCode, newPassword) => {
    setError(null);
    
    try {
      // Check if we need to get the saved values
      const savedCode = await storage.getItem('tempResetCode');
      const savedEmail = await storage.getItem('tempResetEmail');
      
      // Use saved values if provided parameters are empty
      const finalEmail = email || savedEmail;
      const finalCode = resetCode || savedCode;
      
      if (!finalEmail || !finalCode) {
        throw new Error('Missing email or reset code. Please try again.');
      }
      
      console.log('Resetting password with:', { email: finalEmail, code: finalCode });
      
      const response = await fetch(`${API_URL}${ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: finalEmail, 
          resetCode: finalCode, 
          newPassword 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      // Clear temporary storage data
      await storage.removeItem('tempResetCode');
      await storage.removeItem('tempResetEmail');
      
      console.log('Password reset response:', result);
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        signup, 
        logout,
        updateUserProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        loading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
