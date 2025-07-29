'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { LoginCredentials, RegisterCustomerDTO, RegisterMerchantDTO } from '@/types/auth';
import { api } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  registerCustomer: (data: RegisterCustomerDTO) => Promise<void>;
  registerMerchant: (data: RegisterMerchantDTO) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isEmailVerified: () => boolean;
  isKYCVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      // Try to get current user - this will use existing cookies
      const response = await api.users.getMe();
      setUser(response.data.user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // User is not authenticated or token is invalid
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.auth.login(credentials);
      setUser(response.data.user);
    } catch (error) {
      throw error; // Re-throw to handle in the calling component
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Optionally redirect to login page here or let the calling component handle it
    }
  };

  const registerCustomer = async (data: RegisterCustomerDTO) => {
    try {
      const response = await api.auth.registerCustomer(data);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const registerMerchant = async (data: RegisterMerchantDTO) => {
    try {
      const response = await api.auth.registerMerchant(data);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.users.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || user?.role === 'admin';
  };

  const isEmailVerified = (): boolean => {
    return user?.emailVerification?.verified ?? false;
  };

  const isKYCVerified = (): boolean => {
    if (!user) return false;

    if (user.role === 'customer') return true; // Customers don't need KYC
    if (user.role === 'admin') return true; // Admins bypass KYC

    if (user.role === 'merchant') {
      return user.merchantInfo?.kyc?.reviewResult === 'verified';
    }

    if (user.role === 'rider') {
      return user.riderInfo?.kyc?.reviewResult === 'verified';
    }

    return false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    registerCustomer,
    registerMerchant,
    refreshUser,
    hasRole,
    isEmailVerified,
    isKYCVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
