import { useEffect, useState } from "react";
import {
  fetchCourseNotes,
  uploadCourseNote,
  deleteCourseNote,
  CourseNote,
} from "../../api/courseNoteApi";

import { useAuth } from "../../context/AuthContext";

interface Props {
  courseId: number;
  renderCompact?: boolean;
}

export default function CourseNotesSection({
  courseId,
  renderCompact = false,
}: Props) {
  const { user } = useAuth();

  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: custom delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseNotes(courseId);
      setNotes(res?.data ?? []);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [courseId]);

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    try {
      await uploadCourseNote(courseId, file, title);
      setTitle("");
      setFile(null);
      await loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIXED DELETE (no window.confirm)
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCourseNote(deleteId);

      // instant UI update (no reload needed)
      setNotes((prev) => prev.filter((n) => n.id !== deleteId));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const baseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace("/api", "");

  return (
    <div className={renderCompact ? "p-2" : "mt-8 rounded-2xl border bg-white p-6"}>
      {!renderCompact && (
        <>
          <h2 className="text-xl font-bold">Student Notes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Shared notes uploaded by students
          </p>
        </>
      )}

      {/* UPLOAD */}
      {user?.role === "student" && (
        <div className={renderCompact ? "mb-3" : "mb-6 border p-4 rounded-xl"}>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 mb-3 rounded"
          />

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload Note
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const fileUrl = note.file?.file_path
              ? `${baseUrl}${note.file.file_path}`
              : "#";

            const isImage =
              note.file?.file_path?.match(/\.(jpg|jpeg|png|webp)$/i);

            const canDelete =
              user?.role === "admin" || user?.id === note.student_id;

            return (
              <div
                key={note.id}
                className="border p-4 rounded-xl flex justify-between items-center gap-3"
              >
                {/* LEFT */}
                <div className="flex-1">
                  <h4 className="font-semibold">{note.title}</h4>

                  <p className="text-xs text-gray-500">
                    Uploaded by {note.student?.first_name} {note.student?.last_name}
                  </p>

                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-xs"
                  >
                    Open Note
                  </a>
                </div>

                {/* RIGHT PREVIEW */}
                <div className={renderCompact ? "w-12 h-12" : "w-16 h-16"}>
                  {isImage ? (
                    <img
                      src={fileUrl}
                      className="w-full h-full object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 border rounded">
                      PDF
                    </div>
                  )}
                </div>

                {/* DELETE BUTTON */}
                {canDelete && (
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ CUSTOM MODAL (NO LOCALHOST TEXT ANYMORE) */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[300px]">
            <h2 className="text-lg font-semibold mb-2">Delete note?</h2>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}