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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/courses/${id}/announcements`)}
        className="mb-6 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Back to Announcements
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit Announcement</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm"
          placeholder="Announcement title..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm h-40"
          placeholder="Announcement content..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default EditAnnouncementPage;