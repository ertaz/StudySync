import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { connectSocket } from '../services/socketService';
import { useAuth } from './AuthContext';
import api from '../api/axiosInstance';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { accessToken } = useAuth();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [accessToken]);

  // Fetch when token is available
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ONE socket listener for the entire app — registered here only
  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    const handler = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    if (socket.connected) {
      socket.on('notification:new', handler);
    } else {
      socket.once('connect', () => {
        socket.on('notification:new', handler);
      });
    }

    return () => {
      socket.off('notification:new', handler);
    };
  }, [accessToken]);

  const markAsRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
