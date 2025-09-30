'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/user';
import { LoginCredentials, RegisterCustomerDTO, RegisterMerchantDTO } from '@/types/auth';
import { api } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
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

  // Handle app visibility changes to refresh auth when app comes back from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // App came back to foreground, refresh user data
        // This triggers any necessary token refresh
        refreshUser().catch(() => {
          // If refresh fails, the user will be logged out
          setUser(null);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      const response = await api.users.getMe();
      setUser(response.data.user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      // If error is 401, user is not authenticated or token expired
      // Don't log error as this is expected for unauthenticated users
      if (error?.status !== 401) {
        console.error('Failed to initialize auth:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.auth.login(credentials);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      throw error; // Re-throw to handle in the calling component
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      // Only log if it's not a network error or 401 (already logged out)
      if (error?.status !== 401) {
        console.error('Logout error:', error);
      }
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
    } catch (error: any) {
      // Only clear user state if it's an auth error
      // For other errors (network, server), keep the user state
      if (error?.status === 401 || error?.status === 403) {
        setUser(null);
      }
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
    if (user.role === 'manager') return true; // Managers don't need KYC

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
