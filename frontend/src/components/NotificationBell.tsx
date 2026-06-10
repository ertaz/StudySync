import { useState } from 'react';
import { useNotifications, Notification } from '../api/useNotifications'; 

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <span className="font-semibold text-gray-700">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications yet
              </li>
            ) : (
              notifications.map((n: Notification) => ( 
                <li
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;