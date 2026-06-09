import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const AnnouncementsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const courseId = id;

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === "admin" || user?.role === "professor";

  useEffect(() => {
    if (!courseId) return;

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/announcements/course/${courseId}`);
        setAnnouncements(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseId]);

  const handleDelete = async (announcementId: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${announcementId}`);
      setAnnouncements((prev: any) =>
        prev.filter((a: any) => a.id !== announcementId)
      );
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <svg className="h-6 w-6 animate-spin mr-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading announcements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-md p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-600">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-lg p-4 md:p-6">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/courses/${id}`)}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Course Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Stay up to date with the latest updates</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
          </span>
          {canManage && (
            <button
              onClick={() => navigate(`/courses/${id}/announcements/create`)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Announcement
            </button>
          )}
        </div>

        {/* Announcement list */}
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4 mb-4">
              <span className="text-2xl">📢</span>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No announcements yet</p>
            {canManage && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Add Announcement" to post one.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {announcements.map((item: any) => (
              <div key={item.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black dark:text-white text-base leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                      {item.content}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          navigate(`/courses/${id}/announcements/edit/${item.id}`, {
                            state: { title: item.title, content: item.content },
                          })
                        }
                        className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
