import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { auth, setAuthInvalidHandler } from './api';
import { LoadingScreen } from './components/ui';
import { userService } from '../services/userService';
import type { User } from '../types/user';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<User | null>(null);

  const checkSession = useCallback(async () => {
    if (auth.isLoggedOut()) {
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setStatus('checking');
    try {
      const me = await userService.getMe();
      setUser(me);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await auth.login(email, password);
      auth.setTokens(data);
      setStatus('authenticated');
      try {
        const me = await userService.getMe();
        setUser(me);
      } catch {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setStatus('unauthenticated');
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await userService.getMe();
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    setAuthInvalidHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setAuthInvalidHandler(null);
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const value = useMemo<AuthContextValue>(() => ({ status, user, login, logout, refreshUser }), [status, user, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <LoadingScreen />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <LoadingScreen />;
  if (status === 'authenticated') {
    const state = location.state as { from?: Location } | null;
    const from = state?.from;
    const target = from ? `${from.pathname}${from.search}${from.hash}` : '/';
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}
