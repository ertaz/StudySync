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

  const canCreate = user?.role === "admin" || user?.role === "professor";

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

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Course Announcements</h1>

        {canCreate && (
          <button
            onClick={() => navigate(`/courses/${id}/announcements/create`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + Add Announcement
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <p className="text-gray-500">No announcements for this course yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((item: any) => (
            <div
              key={item.id}
              className="border rounded p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-700 mt-1">{item.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;