'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  userId: string;
  role: string;
}

interface UseAuthReturn {
  session: Session | null;
  loading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.success && data.authenticated) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        await checkSession();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setSession(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    session,
    loading,
    login,
    logout,
    checkSession,
  };
}
