import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setStoredToken, getStoredToken, removeStoredToken } from '../api/client';
import { authApi } from '../api/auth';
import type { LoginRequest, LoginResponse } from '../api/types';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore token from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      // If user info is stored separately, restore it here
      // For now, we'll fetch it on login
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await authApi.login(credentials);
      const { token: newToken, user: userData } = response;
      
      setStoredToken(newToken);
      setToken(newToken);
      
      if (userData) {
        setUser(userData);
      } else {
        // If user data not in response, create minimal user from email
        setUser({
          id: credentials.email,
          email: credentials.email,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

