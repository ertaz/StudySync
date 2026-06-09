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
}: Props) {
  const { user } = useAuth();

  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

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

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCourseNote(deleteId);
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
    <div className="flex flex-col gap-4">

      {/* UPLOAD FORM */}
      {user?.role === "student" && (
        <div className="rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Upload a Note
          </h3>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent px-3 py-2 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* File input styled as a label */}
            <label className="flex items-center gap-3 w-full cursor-pointer rounded-lg border border-dashed border-stroke dark:border-strokedark px-4 py-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{file ? file.name : "Choose file (PDF, PNG, JPG…)"}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            <button
              onClick={handleUpload}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
              disabled={!file || !title.trim()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Note
            </button>
          </div>
        </div>
      )}

      {/* NOTES LIST */}
      <div className="rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Shared Notes
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading notes…
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4">No notes uploaded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => {
              const fileUrl = note.file?.file_path
                ? `${baseUrl}${note.file.file_path}`
                : "#";

              const isImage = note.file?.file_path?.match(/\.(jpg|jpeg|png|webp)$/i);
              const canDelete = user?.role === "admin" || user?.id === note.student_id;

              return (
                <div
                  key={note.id}
                  className="flex items-center gap-4 rounded-xl border border-stroke dark:border-strokedark px-4 py-3"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 flex-shrink-0">
                    {isImage ? (
                      <img src={fileUrl} className="w-full h-full object-cover rounded-lg border border-stroke dark:border-strokedark" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-lg border border-stroke dark:border-strokedark bg-gray-50 dark:bg-white/5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{note.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {note.student?.first_name} {note.student?.last_name}
                    </p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-0.5 inline-block"
                    >
                      Open file →
                    </a>
                  </div>

                  {/* Delete */}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteId(note.id)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl w-[320px] p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-base font-semibold text-black dark:text-white mb-1">Delete note?</h2>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-stroke dark:border-strokedark text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
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