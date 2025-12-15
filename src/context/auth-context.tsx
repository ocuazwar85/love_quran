
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, pass: string) => void;
  logout: () => void;
  updateCredentials: (newUsername: string, newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [credentials, setCredentials] = useState({ username: 'admin', pass: 'admin1' });
  const router = useRouter();
  const { toast } = useToast();

  const login = (username: string, pass: string) => {
    if (username === credentials.username && pass === credentials.pass) {
      setIsAuthenticated(true);
      setUser({ username });
      router.push('/admin');
      toast({ title: 'Login Berhasil', description: `Selamat datang, ${username}!` });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'Username atau password salah.',
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  const updateCredentials = (newUsername: string, newPass: string) => {
    if (!isAuthenticated) {
        toast({ variant: 'destructive', title: 'Aksi Ditolak', description: 'Anda harus login.' });
        return;
    }
    setCredentials({ username: newUsername, pass: newPass });
    toast({ title: 'Berhasil', description: 'Username dan password telah diperbarui.' });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
