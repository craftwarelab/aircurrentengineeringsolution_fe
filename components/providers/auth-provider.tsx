'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { AuthUtils } from '@/lib/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  restoring: boolean;
  refresh: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  restoring: true,
  refresh: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the persisted hint as the initial value so the UI is correct instantly
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== 'undefined' && AuthUtils.hasLoggedInHint()
  );
  // restoring = true while we are waiting for the refresh-token API call
  const [restoring, setRestoring] = useState(true);

  const refresh = useCallback(async (): Promise<boolean> => {
    const token = await AuthUtils.refreshAccessToken();
    const ok = !!token;
    setIsAuthenticated(ok);
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      // If token already in RAM and not expired, no need to call the API
      if (AuthUtils.isAuthenticated() && !AuthUtils.isTokenExpired()) {
        setRestoring(false);
        return;
      }

      // Only call refresh-token if we have the login hint (user was logged in before)
      if (AuthUtils.hasLoggedInHint()) {
        await refresh();
      }

      setRestoring(false);
    };

    init();

    const handleAuthChange = () => {
      setIsAuthenticated(AuthUtils.isAuthenticated());
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, restoring, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
