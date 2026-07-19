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
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
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
            localStorage.setItem('user_role', data.data.role);
            localStorage.setItem('user_name', data.data.name);
            setIsLoading(false);
            return;
          }
        }
        
        // If we reach here, session is invalid
        console.warn('Session is invalid or expired.');
      } catch (err) {
        console.error('Failed to restore session:', err);
      }
      
      // Cleanup for failed session
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

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
