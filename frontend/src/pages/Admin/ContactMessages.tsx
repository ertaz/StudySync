import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContactMessagesAPI, markMessageAsReadAPI } from '../../api/contactAPI';

interface Message {
  id:         number;
  name:       string;
  email:      string;
  subject:    string;
  message:    string;
  is_read:    number;
  created_at: string;
}

const ContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getContactMessagesAPI()
      .then((data) => setMessages(data.messages))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: number) => {
    await markMessageAsReadAPI(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: 1 } : m))
    );
  };

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black dark:text-white">Contact Messages</h1>
          <p className="text-sm text-gray-500">Messages sent by students through the Contact Us page</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <span className="text-5xl">💬</span>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
            <p className="text-sm">Student messages will appear here</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-black dark:text-white">{msg.name}</div>
                    <div className="text-xs text-gray-400">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">{msg.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{msg.message}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {msg.is_read ? (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        Read
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                        Unread
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      {msg.is_read ? (
                        <button
                          disabled
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Mark as read
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkRead(msg.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Mark as read
                        </button>
                      )}
                    </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ContactMessages;