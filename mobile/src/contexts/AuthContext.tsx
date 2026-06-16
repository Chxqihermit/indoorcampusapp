import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuth, loadStoredAuth, login as apiLogin, logout as apiLogout, register as apiRegister } from '@/api/auth';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth()
      .then((stored) => {
        if (stored) setUser(stored.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { user: nextUser } = await apiLogin(email, password);
        setUser(nextUser);
      },
      async register(name, email, password, passwordConfirmation) {
        const { user: nextUser } = await apiRegister(name, email, password, passwordConfirmation);
        setUser(nextUser);
      },
      async logout() {
        await apiLogout().catch(() => clearAuth());
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
