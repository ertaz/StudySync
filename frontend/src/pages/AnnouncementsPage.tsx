import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

import {
  getAnnouncementsAPI,
  createAnnouncementAPI,
  deleteAnnouncementAPI,
} from "../../api/announcementAPI";

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { id: courseId } = useParams(); 

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canManageAnnouncements =
    user?.role === "admin" ||
    user?.role === "professor";

  // GET BY COURSE
  const fetchAnnouncements = async () => {
    if (!courseId) return;

    setLoading(true);

    try {
      const res = await getAnnouncementsAPI(courseId);

      setAnnouncements(res.data.data || res.data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]); 

  // CREATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    try {
      await createAnnouncementAPI({
        title,
        content,
        course_id: courseId, 
      });

      setTitle("");
      setContent("");

      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      await deleteAnnouncementAPI(id);
      fetchAnnouncements();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-gray-500 mt-1">
          Course announcements
        </p>
      </div>

      {/* CREATE FORM */}
      {canManageAnnouncements && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Create Announcement
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-3"
              required
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3"
              required
            />

            <button
              type="submit"
              className="px-5 py-2.5 text-white rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              Add Announcement
            </button>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border">

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            All Announcements
          </h2>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="p-6 text-gray-500">
            No announcements found.
          </div>
        ) : (
          <div className="divide-y">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 flex justify-between">

                <div>
                  <h3 className="font-semibold text-lg">
                    {announcement.title}
                  </h3>

                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {announcement.content}
                  </p>

                  <p className="mt-3 text-sm text-gray-400">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* DELETE */}
                {canManageAnnouncements && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="h-fit px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}