import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  roleData: any | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  demoLogin: (identifier: 'C001' | 'P001' | 'P002' | 'P003' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roleData, setRoleData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data);
      setRoleData(data.roleData || null);
    } catch (err) {
      setUser(null);
      setRoleData(null);
      api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('gridxchange_token');
    if (token) {
      refreshProfile();
    } else {
      // User is not logged in by default - persistent guest until explicit login
      setUser(null);
      setRoleData(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (identifier: 'C001' | 'P001' | 'P002' | 'P003' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(identifier);
      setUser(res.user);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setRoleData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleData,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
