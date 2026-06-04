import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createAssignment,
  getAssignmentById,
  updateAssignment,
} from "../../services/assignmentService";

export default function AssignmentForm() {
  const navigate = useNavigate();

  const { id, sectionId } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxGrade, setMaxGrade] = useState("");

  const [files, setFiles] = useState<FileList | null>(null);

  // 🔥 NEW: fallback section state (IMPORTANT)
  const [section, setSection] = useState<string | undefined>(sectionId);

  /* ─────────────────────────────
     LOAD ASSIGNMENT (EDIT MODE)
  ───────────────────────────── */

  useEffect(() => {
    if (isEdit && id) {
      loadAssignment(id);
    }
  }, [id]);

  const loadAssignment = async (assignmentId: string) => {
    try {
      const assignment = await getAssignmentById(assignmentId);

      setTitle(assignment.title);
      setDescription(assignment.description);
      setMaxGrade(assignment.max_grade);
      setDeadline(assignment.deadline.slice(0, 16));

      // 🔥 IMPORTANT: restore section in edit mode
      if (assignment.section_id) {
        setSection(String(assignment.section_id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ─────────────────────────────
     SUBMIT
  ───────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("deadline", deadline);
      formData.append("max_grade", maxGrade);

      // 🔥 CRITICAL: section_id always required
      if (section) {
        formData.append("section_id", section);
      } else {
        throw new Error("Section is required");
      }

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      if (isEdit && id) {
        await updateAssignment(id, formData);
      } else {
        await createAssignment(formData);
      }

      // 🔥 go back to section page
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-xl border bg-white p-8">

        <h1 className="mb-6 text-2xl font-bold">
          {isEdit ? "Edit Assignment" : "Create Assignment"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DEADLINE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* MAX GRADE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Max Grade
            </label>
            <input
              type="number"
              value={maxGrade}
              onChange={(e) => setMaxGrade(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* FILES */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Attachments
            </label>
            <input
              multiple
              type="file"
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>

          {/* ⚠️ SECTION INFO (hidden but safe fallback) */}
          {!section && (
            <div className="text-sm text-red-500">
              No section selected
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !section}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}