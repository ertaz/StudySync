import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchChatHistory, ChatMessage } from '../../api/chatApi';
import { connectSocket } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  courseId:    number;
  fullHeight?: boolean;
}

export default function CourseChat({ courseId, fullHeight = false }: Props) {
  const { user, accessToken } = useAuth();
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [joined, setJoined]         = useState(false);
  const [monitor, setMonitor]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ id: number; name: string }[]>([]);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editText, setEditText]     = useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);
  const joinedRef  = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isStudent = user?.role === 'student';

  const joinRoom = useCallback((socket: ReturnType<typeof connectSocket>) => {
    if (joinedRef.current) return;
    socket.emit('chat:join', { courseId });
  }, [courseId]);

  useEffect(() => {
    if (!accessToken || !courseId) return;

    joinedRef.current = false;
    setTypingUsers([]);

    fetchChatHistory(courseId)
      .then(setMessages)
      .catch(() => setError('Could not load chat history.'))
      .finally(() => setLoading(false));

    const socket = connectSocket(accessToken);

    const onConnect = () => joinRoom(socket);

    const onJoined = ({ monitor: isMonitor }: { courseId: number; monitor: boolean }) => {
      joinedRef.current = true;
      setJoined(true);
      setMonitor(isMonitor);
    };

    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    // Someone edited a message
    const onEdited = ({ _id, message, is_edited, edited_at }: any) => {
      setMessages((prev) =>
        prev.map((m) => m._id === _id ? { ...m, message, is_edited, edited_at } : m)
      );
    };

    // Someone deleted a message
    const onDeleted = ({ _id, message, is_deleted }: any) => {
      setMessages((prev) =>
        prev.map((m) => m._id === _id ? { ...m, message, is_deleted } : m)
      );
    };

    // Typing indicators
    const onTyping = ({ sender_id, sender_name }: { sender_id: number; sender_name: string }) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === sender_id)) return prev;
        return [...prev, { id: sender_id, name: sender_name }];
      });
    };

    const onStopTyping = ({ sender_id }: { sender_id: number }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== sender_id));
    };

    const onError = ({ message }: { message: string }) => setError(message);

    socket.on('connect', onConnect);
    socket.on('chat:joined',      onJoined);
    socket.on('chat:message',     onMessage);
    socket.on('chat:edited',      onEdited);
    socket.on('chat:deleted',     onDeleted);
    socket.on('chat:typing',      onTyping);
    socket.on('chat:stop_typing', onStopTyping);
    socket.on('chat:error',       onError);

    if (socket.connected) joinRoom(socket);

    return () => {
      socket.off('connect',          onConnect);
      socket.off('chat:joined',      onJoined);
      socket.off('chat:message',     onMessage);
      socket.off('chat:edited',      onEdited);
      socket.off('chat:deleted',     onDeleted);
      socket.off('chat:typing',      onTyping);
      socket.off('chat:stop_typing', onStopTyping);
      socket.off('chat:error',       onError);
    };
  }, [courseId, accessToken, joinRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !joined || monitor) return;
    const socket = connectSocket(accessToken!);
    socket.emit('chat:send', { courseId, message: input.trim() });
    socket.emit('chat:stop_typing', { courseId });
    setInput('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!joined || monitor) return;
    const socket = connectSocket(accessToken!);
    socket.emit('chat:typing', { courseId });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('chat:stop_typing', { courseId });
    }, 2000);
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg._id);
    setEditText(msg.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const submitEdit = (msg: ChatMessage) => {
    if (!editText.trim() || editText === msg.message) { cancelEdit(); return; }
    const socket = connectSocket(accessToken!);
    socket.emit('chat:edit', { courseId, messageId: msg._id, newMessage: editText.trim() });
    cancelEdit();
  };

  const deleteMessage = (messageId: string) => {
    const socket = connectSocket(accessToken!);
    socket.emit('chat:delete', { courseId, messageId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
        Loading chat...
      </div>
    );
  }

  if (error && !joined) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: fullHeight ? '100%' : '500px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-stroke dark:border-strokedark px-5 py-3 bg-gray-50 dark:bg-meta-4">
        <span className="text-lg">💬</span>
        <h3 className="font-semibold text-black dark:text-white text-sm">
          Student Discussion Room
        </h3>
        {monitor && (
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">
            Monitor Mode
          </span>
        )}
        {joined && !monitor && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            No messages yet. Start the discussion! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const isBeingEdited = editingId === msg._id;

          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && !msg.is_deleted && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1 font-medium">
                  {msg.sender_name}
                </span>
              )}

              {/* Edit mode */}
              {isBeingEdited ? (
                <div className="flex gap-2 w-full max-w-sm">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitEdit(msg);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 rounded-xl border border-blue-400 px-3 py-1.5 text-sm text-black dark:text-white dark:bg-boxdark outline-none"
                    autoFocus
                  />
                  <button onClick={() => submitEdit(msg)} className="text-xs text-blue-600 font-medium hover:underline">Save</button>
                  <button onClick={cancelEdit} className="text-xs text-gray-400 hover:underline">Cancel</button>
                </div>
              ) : (
                <div className="group relative">
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm leading-relaxed break-words
                      ${msg.is_deleted
                        ? 'bg-gray-100 dark:bg-meta-4 text-gray-400 italic'
                        : isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-meta-4 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                  >
                    {msg.message}
                  </div>

                 {isMe && !msg.is_deleted && (
                <div className="absolute -top-8 right-0 hidden group-hover:flex items-center gap-1 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg px-2 py-1.5 shadow-md">
                  <button
                    onClick={() => startEdit(msg)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    title="Edit message"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                
                  <div className="w-px h-3 bg-gray-200 dark:bg-gray-600" />
                
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    title="Delete message"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
                </div>
              )}

              {/* Timestamp + edited label */}
              <div className="flex items-center gap-1 mt-1 px-1">
                {msg.is_edited && !msg.is_deleted && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">edited ·</span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-400">
              {typingUsers.map((u) => u.name).join(', ')}
              {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isStudent && (
        <div className="border-t border-stroke dark:border-strokedark px-4 py-3 flex gap-2 bg-gray-50 dark:bg-meta-4">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            maxLength={1000}
            className="flex-1 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark px-4 py-2 text-sm text-black dark:text-white outline-none focus:border-primary transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !joined}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      )}

      {/* Monitor bar */}
      {monitor && (
        <div className="border-t border-stroke dark:border-strokedark px-4 py-2 text-center text-xs text-amber-600 bg-amber-50 dark:bg-meta-4">
          👁️ You are in monitor mode — you can read but not send messages
        </div>
      )}
    </div>
  );
}