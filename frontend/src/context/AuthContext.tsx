import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { loginAPI, logoutAPI, refreshTokenAPI } from '../api/authAPI';
import { setTokenGetter, setRefreshCallbacks } from '../api/axiosInstance';

interface User {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  role:       'admin' | 'professor' | 'student';
}

interface AuthContextType {
  user:        User | null;
  loading:     boolean;
  accessToken: string | null;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]               = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);

  // Keep a ref so axios interceptor always reads the latest token
  // even between renders
  const accessTokenRef = useRef<string | null>(null);

  const updateToken = (token: string | null) => {
    accessTokenRef.current = token;
    setAccessToken(token);
  };

  // Register the token getter with axios once on mount.
  // Axios reads from the ref so it always gets the latest value
  // without needing a re-render.
  useEffect(() => {
    setTokenGetter(() => accessTokenRef.current);

    setRefreshCallbacks(
      // Called by axios interceptor when a silent refresh succeeds
      (newToken: string, newUser: any) => {
        updateToken(newToken);
        if (newUser) setUser(newUser);
      },
      // Called by axios interceptor when a silent refresh fails
      () => {
        updateToken(null);
        setUser(null);
      }
    );
  }, []);

  // On every page load: try to restore session using the HTTP-only cookie
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const data = await refreshTokenAPI();
        if (!cancelled) {
          updateToken(data.accessToken);
          setUser(data.user || null);
        }
      } catch {
        if (!cancelled) {
          updateToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginAPI({ email, password });
    // ✅ Access token stored in React state — most secure browser option
    // ✅ Refresh token is in HTTP-only cookie — set by the server
    updateToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await logoutAPI();
    // Clear everything from React state immediately
    updateToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
