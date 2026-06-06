import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (accessToken: string): Socket => {
  // If token changed (different user) — destroy old socket first
  if (socket && currentToken !== accessToken) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }

  if (!socket) {
    currentToken = accessToken;
    socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
      {
        withCredentials: true,
        autoConnect: false,
        auth: { token: accessToken },
      }
    );
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  currentToken = null;
};