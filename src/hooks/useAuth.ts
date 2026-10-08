import { useState, useCallback } from 'react';
import { useAppState } from '../store/appState';
import { User } from '../types';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  preferredLanguage?: string;
  role?: 'user' | 'translator_admin' | 'reviewer';
}

export interface OAuthCredentials {
  provider: 'google' | 'github' | 'apple' | 'microsoft';
  token?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export function useAuth() {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, updateUserPreferences } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          storeLogin(data.user, data.token);
          setIsLoading(false);
          return { success: true, user: data.user };
        } else {
          const errMsg = data.error || 'Invalid login credentials';
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }
      } catch (err: any) {
        const errMsg = err.message || 'Login failed. Please try again.';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [storeLogin]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          storeLogin(data.user, data.token);
          setIsLoading(false);
          return { success: true, user: data.user };
        } else {
          const errMsg = data.error || 'Registration failed';
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }
      } catch (err: any) {
        const errMsg = err.message || 'Registration failed. Please try again.';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [storeLogin]
  );

  const signIn = useCallback(
    async (oauthData: OAuthCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(oauthData),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          storeLogin(data.user, data.token);
          setIsLoading(false);
          return { success: true, user: data.user };
        } else {
          const errMsg = data.error || 'OAuth sign-in failed';
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }
      } catch (err: any) {
        const errMsg = err.message || 'Social sign-in failed.';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [storeLogin]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore network errors on logout
    } finally {
      storeLogout();
    }
  }, [token, storeLogout]);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          storeLogin(data.user, token);
          return true;
        }
      }
    } catch (err) {
      console.warn('Verify token failed', err);
    }
    return false;
  }, [token, storeLogin]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    signIn,
    logout,
    verifyToken,
    updateUser: updateUserPreferences,
  };
}
