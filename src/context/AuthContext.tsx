import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { useAppState } from '../store/appState';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, updateUserPreferences } = useAppState();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifyToken = async (): Promise<boolean> => {
    if (!token) {
      setIsLoading(false);
      return false;
    }
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          storeLogin(data.user, token);
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('Token verification error:', err);
    }
    setIsLoading(false);
    return false;
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login: storeLogin,
        logout: storeLogout,
        updateUser: updateUserPreferences,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
