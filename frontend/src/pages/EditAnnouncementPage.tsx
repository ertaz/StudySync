import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

const EditAnnouncementPage = () => {
  const { id, announcementId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const existing = location.state as { title: string; content: string } | null;

  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.put(`/announcements/${announcementId}`, { title, content });

      navigate(`/courses/${id}/announcements`);
    } catch (err) {
      setError("Failed to update announcement.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border px-4 py-3 text-sm outline-none transition border-stroke bg-transparent text-black dark:border-strokedark dark:text-white focus:border-blue-500";

  return (
    <div className="mx-auto max-w-screen-md p-4 md:p-6">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/courses/${id}/announcements`)}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Edit Announcement</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Update the announcement details</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="p-6 md:p-8 space-y-6">

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputBase}
              placeholder="Announcement title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputBase} h-40 resize-none`}
              placeholder="Announcement content..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/courses/${id}/announcements`)}
              className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditAnnouncementPage;
