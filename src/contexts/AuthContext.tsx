import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setStoredToken, getStoredToken, removeStoredToken } from '../api/client';
import { authApi } from '../api/auth';
import type { LoginRequest, LoginResponse } from '../api/types';

interface User {
  id: string;
  email: string;
  name?: string;
  user_type?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'auth_user';

const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch (error) {
    console.warn('Failed to parse stored user', error);
    return null;
  }
};

const persistUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore token and user from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = loadStoredUser();
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response: LoginResponse = await authApi.login(credentials);
    const { token: newToken, user: userData } = response;

    if (!newToken) {
      throw new Error('Authentication failed: missing token');
    }

    setStoredToken(newToken);
    setToken(newToken);

    if (userData) {
      const normalizedUser: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        user_type: userData.user_type,
        phone: userData.phone,
      };
      setUser(normalizedUser);
      persistUser(normalizedUser);
    } else {
      const fallbackUser: User = {
        id: credentials.email,
        email: credentials.email,
      };
      setUser(fallbackUser);
      persistUser(fallbackUser);
    }
  };

  const logout = () => {
    removeStoredToken();
    persistUser(null);
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

