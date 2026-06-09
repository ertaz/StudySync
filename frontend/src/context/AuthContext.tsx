import axios from 'axios';
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { loginAPI, logoutAPI } from '../api/authAPI';
import { setTokenGetter, setRefreshCallbacks } from '../api/axiosInstance';
import { disconnectSocket } from '../services/socketService';
import toast from 'react-hot-toast'; // Imidiatisht i gatshëm për përdorim

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
    // 🔥 ZGJIDHJA GLOBALE: Mbishkruajmë alert-in e shëmtuar të sistemit me Toast-in e bukur
    window.alert = (message) => {
      toast.error(message, {
        duration: 4000,
        style: {
          borderRadius: '8px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    };

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
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
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

    updateToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await logoutAPI();
    disconnectSocket();
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