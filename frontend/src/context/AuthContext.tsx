'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isDemoAccount?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const router = useRouter();

  const verifySession = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    
    try {
      setToken(storedToken);
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          setIsSessionVerified(true);
          localStorage.setItem('user_role', data.data.role);
          localStorage.setItem('user_name', data.data.name);
        } else {
          if (res.status === 401 || res.status === 403 || data.message?.includes('authorized') || data.message?.includes('token')) {
            throw new Error('Invalid session');
          } else {
            handleTemporaryFallback();
          }
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Invalid session');
        } else {
          handleTemporaryFallback();
        }
      }
    } catch (err: any) {
      console.error('Failed to restore session:', err);
      if (err instanceof Error && err.message === 'Invalid session') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        setToken(null);
        setUser(null);
        setIsSessionVerified(false);
      } else {
        handleTemporaryFallback();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemporaryFallback = () => {
    const storedRole = localStorage.getItem('user_role');
    const storedName = localStorage.getItem('user_name');
    if (storedRole) {
      setUser({
        _id: '',
        name: storedName || 'User',
        role: storedRole,
      });
    }
    setIsSessionVerified(false);
  };

  useEffect(() => {
    verifySession();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleReverify = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !isSessionVerified) {
        verifySession();
      }
    };

    window.addEventListener('focus', handleReverify);
    window.addEventListener('online', handleReverify);

    return () => {
      window.removeEventListener('focus', handleReverify);
      window.removeEventListener('online', handleReverify);
    };
  }, [isSessionVerified]);

  const login = (newToken: string, newUserInfo: Partial<User>) => {
    localStorage.setItem('token', newToken);
    if (newUserInfo.role) localStorage.setItem('user_role', newUserInfo.role);
    if (newUserInfo.name) localStorage.setItem('user_name', newUserInfo.name);
    setToken(newToken);
    setUser(newUserInfo as User);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
