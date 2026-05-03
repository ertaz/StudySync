import axios from 'axios';
let tokenGetter: (() => string | null) = () => null;

export const setTokenGetter = (fn: () => string | null) => {
  tokenGetter = fn;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// ── Request interceptor: read token from React state via getter ──
api.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never retry the refresh call itself — prevents infinite loop
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');
    if (isRefreshCall) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        // Notify AuthContext to update its state via the onRefresh callback
        onRefreshSuccess?.(data.accessToken, data.user);
        processQueue(null, data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onRefreshFailure?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Callbacks so AuthContext can react to silent refresh events ──
let onRefreshSuccess: ((token: string, user: any) => void) | null = null;
let onRefreshFailure: (() => void) | null = null;

export const setRefreshCallbacks = (
  onSuccess: (token: string, user: any) => void,
  onFailure: () => void
) => {
  onRefreshSuccess = onSuccess;
  onRefreshFailure = onFailure;
};

export default api;