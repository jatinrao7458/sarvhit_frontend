import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

// Use environment variable or fall back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.errors?.[0] || 'Login failed';
        } catch {
          if (response.status === 401) {
            errorMessage = 'Invalid email or password';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Error: ${response.statusText || 'Login failed'}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      let errorMessage = err.message;
      
      // Handle network errors
      if (err instanceof TypeError) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5000.';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = 'Connection error. Please try again.';
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (signupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const errorData = await response.json();
          // Handle both single errors and validation error arrays
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            // If errors is an object, format it nicely
            if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
              const errorMessages = Object.values(errorData.errors).filter(e => typeof e === 'string');
              errorMessage = errorMessages.join(', ') || 'Signup failed';
            } else if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors[0] || 'Signup failed';
            }
          }
        } catch {
          if (response.status === 409) {
            errorMessage = 'Email already registered. Please use a different email.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid input. Please check your information.';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Error: ${response.statusText || 'Signup failed'}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      let errorMessage = err.message;
      
      // Handle network errors
      if (err instanceof TypeError) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5002.';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = 'Connection error. Please try again.';
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
