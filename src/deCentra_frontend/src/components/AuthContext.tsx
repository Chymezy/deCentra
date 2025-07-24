'use client';
import { AuthClient } from '@dfinity/auth-client';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface User {
  name?: string;
  id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  principal: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        setIsAuthenticated(isAuthenticated);
        if (isAuthenticated) {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal().toText());
          setUser({ id: identity.getPrincipal().toText() });
        } else {
          setPrincipal(null);
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setPrincipal(null);
        setUser(null);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: process.env.NEXT_PUBLIC_II_CANISTER_URL,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          setIsAuthenticated(true);
          setPrincipal(identity.getPrincipal().toText());
          setUser({ id: identity.getPrincipal().toText() });
        },
        onError: (error) => {
          console.error('Login error:', error);
          alert('Login failed: ' + error);
        },
      });
    } catch (error) {
      console.error('Login setup error:', error);
      alert('Login setup failed: ' + error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, principal, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
