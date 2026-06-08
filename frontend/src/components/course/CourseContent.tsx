import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSections,
  createSection,
  createLesson,
  deleteSection,
  updateSection,
} from "../../api/courseContentApi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../../services/assignmentService";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getFileUrl = (filePath?: string) => {
  if (!filePath) return "";
  return `http://localhost:5000/${filePath}`;
};

const getFileIcon = (filename?: string) => {
  if (!filename) return "📁";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (ext === "doc" || ext === "docx") return "📝";
  if (ext === "ppt" || ext === "pptx") return "📊";
  if (ext === "xls" || ext === "xlsx") return "📈";
  return "📁";
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface AssignmentAttachment {
  id: number;
  filename: string;
  file_path: string;
}

interface AssignmentItem {
  id: number;
  title: string;
  description?: string;
  deadline: string;
  max_grade: number | string;
  attachments?: AssignmentAttachment[];
  created_at?: string;
}

interface AssignmentFormState {
  title: string;
  description: string;
  deadline: string;
  maxGrade: string;
  files: File[] | null;
}

const emptyAssignmentForm = (): AssignmentFormState => ({
  title: "",
  description: "",
  deadline: "",
  maxGrade: "100",
  files: null,
});

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CourseContent({ courseId }: { courseId: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProfessor = user?.role === "admin" || user?.role === "professor";
  const isStudent = user?.role === "student";
  // Admin mund te shiqoje gjithcka por NUK mund te shtoje/editoje/fshije assignments
  const canManageAssignments = user?.role === "professor";

  // ── Sections / Lessons state ──
  const [sections, setSections] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [lessonInputs, setLessonInputs] = useState<{ [key: number]: string }>({});
  const [openMenu, setOpenMenu] = useState<{ type: "section" | "lesson" | "assignment" | null; id: number | null }>({ type: null, id: null });
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonTitleEdit, setLessonTitleEdit] = useState("");
  const [lessonFileEdit, setLessonFileEdit] = useState<File | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<number | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);

  // ── Assignments state (per section) ──
  const [assignmentsBySectionId, setAssignmentsBySectionId] = useState<{ [sectionId: number]: AssignmentItem[] }>({});
  const [assignmentLoadingIds, setAssignmentLoadingIds] = useState<Set<number>>(new Set());

  // ── Assignment modals ──
  const [createAssignmentSectionId, setCreateAssignmentSectionId] = useState<number | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(emptyAssignmentForm());
  const [assignmentFormLoading, setAssignmentFormLoading] = useState(false);

  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
  const [editingAssignmentSectionId, setEditingAssignmentSectionId] = useState<number | null>(null);
  const [editAssignmentForm, setEditAssignmentForm] = useState<AssignmentFormState>(emptyAssignmentForm());
  const [editAssignmentLoading, setEditAssignmentLoading] = useState(false);

  const [deleteAssignmentId, setDeleteAssignmentId] = useState<number | null>(null);
  const [deleteAssignmentSectionId, setDeleteAssignmentSectionId] = useState<number | null>(null);

  // ── Tab per section (lessons | assignments) ──
  const [sectionTab, setSectionTab] = useState<{ [sectionId: number]: "lessons" | "assignments" }>({});

  // ── Click outside to close menus ──
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu({ type: null, id: null });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─────────────────────────────────────────────
  // LOAD SECTIONS
  // ─────────────────────────────────────────────
  const load = async () => {
    const data = await fetchSections(courseId);
    setSections(data || []);
  };

  useEffect(() => {
    if (courseId) load();
  }, [courseId]);

  // ─────────────────────────────────────────────
  // LOAD ASSIGNMENTS PER SECTION
  // ─────────────────────────────────────────────
  const loadAssignmentsForSection = async (sectionId: number) => {
    setAssignmentLoadingIds((prev) => new Set(prev).add(sectionId));
    try {
      const data = await getAssignments({ section_id: sectionId });
      setAssignmentsBySectionId((prev) => ({ ...prev, [sectionId]: data }));
    } catch (err) {
      console.error("Failed to load assignments for section", sectionId, err);
    } finally {
      setAssignmentLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  };

  // Load assignments when switching to assignments tab
  const handleTabChange = (sectionId: number, tab: "lessons" | "assignments") => {
    setSectionTab((prev) => ({ ...prev, [sectionId]: tab }));
    if (tab === "assignments" && !assignmentsBySectionId[sectionId]) {
      loadAssignmentsForSection(sectionId);
    }
  };

  const getTab = (sectionId: number) => sectionTab[sectionId] || "lessons";

  // ─────────────────────────────────────────────
  // SECTION CRUD
  // ─────────────────────────────────────────────
  const addSection = async () => {
    if (!title.trim()) return;
    await createSection({ course_id: courseId, title });
    setTitle("");
    load();
  };

  const saveSection = async (id: number) => {
    await updateSection(id, { title: editingTitle });
    setEditingSectionId(null);
    setEditingTitle("");
    load();
  };

  const removeSection = async (id: number) => {
    try {
      await deleteSection(id);
      await load();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  // ─────────────────────────────────────────────
  // LESSON CRUD
  // ─────────────────────────────────────────────
  const addLesson = async (sectionId: number) => {
    const lessonTitle = lessonInputs[sectionId];
    if (!lessonTitle?.trim()) return;
    const formData = new FormData();
    formData.append("section_id", String(sectionId));
    formData.append("title", lessonTitle);
    formData.append("description", "");
    await createLesson(formData);
    setLessonInputs((prev) => ({ ...prev, [sectionId]: "" }));
    load();
  };

  const saveLesson = async () => {
    if (!editingLesson) return;
    const formData = new FormData();
    formData.append("title", lessonTitleEdit);
    if (lessonFileEdit) formData.append("file", lessonFileEdit);
    await api.put(`/course-content/lessons/${editingLesson.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setEditingLesson(null);
    setLessonTitleEdit("");
    setLessonFileEdit(null);
    load();
  };

  const removeLesson = async (id: number) => {
    await api.delete(`/course-content/lessons/${id}`);
    setDeleteLessonId(null);
    load();
  };

  // ─────────────────────────────────────────────
  // ASSIGNMENT CRUD
  // ─────────────────────────────────────────────
  const handleCreateAssignment = async () => {
    if (!createAssignmentSectionId || !assignmentForm.title.trim()) return;
    setAssignmentFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("section_id", String(createAssignmentSectionId));
      formData.append("course_id", String(courseId));
      formData.append("title", assignmentForm.title);
      formData.append("description", assignmentForm.description);
      formData.append("deadline", assignmentForm.deadline);
      formData.append("max_grade", assignmentForm.maxGrade);
      if (assignmentForm.files) {
        assignmentForm.files.forEach((f) => formData.append("files", f));
      }
      await createAssignment(formData);
      setCreateAssignmentSectionId(null);
      setAssignmentForm(emptyAssignmentForm());
      await loadAssignmentsForSection(createAssignmentSectionId);
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    } finally {
      setAssignmentFormLoading(false);
    }
  };

  const openEditAssignment = (assignment: AssignmentItem, sectionId: number) => {
    setEditingAssignment(assignment);
    setEditingAssignmentSectionId(sectionId);
    setEditAssignmentForm({
      title: assignment.title,
      description: assignment.description || "",
      deadline: assignment.deadline ? assignment.deadline.slice(0, 16) : "",
      maxGrade: String(assignment.max_grade),
      files: null,
    });
    setOpenMenu({ type: null, id: null });
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !editingAssignmentSectionId) return;
    setEditAssignmentLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", editAssignmentForm.title);
      formData.append("description", editAssignmentForm.description);
      formData.append("deadline", editAssignmentForm.deadline);
      formData.append("max_grade", editAssignmentForm.maxGrade);
      formData.append("section_id", String(editingAssignmentSectionId));
      if (editAssignmentForm.files) {
        editAssignmentForm.files.forEach((f) => formData.append("files", f));
      }
      await updateAssignment(String(editingAssignment.id), formData);
      setEditingAssignment(null);
      setEditingAssignmentSectionId(null);
      setEditAssignmentForm(emptyAssignmentForm());
      await loadAssignmentsForSection(editingAssignmentSectionId);
    } catch (err) {
      console.error(err);
      alert("Failed to update assignment");
    } finally {
      setEditAssignmentLoading(false);
    }
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteAssignmentId || !deleteAssignmentSectionId) return;
    try {
      await deleteAssignment(deleteAssignmentId);
      setAssignmentsBySectionId((prev) => ({
        ...prev,
        [deleteAssignmentSectionId]: (prev[deleteAssignmentSectionId] || []).filter(
          (a) => a.id !== deleteAssignmentId
        ),
      }));
    } catch (err) {
      alert("Failed to delete assignment");
    } finally {
      setDeleteAssignmentId(null);
      setDeleteAssignmentSectionId(null);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div className="mt-6" ref={menuRef}>

      {/* ── ADD SECTION ── */}
      {isProfessor && (
        <div className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSection()}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New section title..."
          />
          <button
            onClick={addSection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            + Add Section
          </button>
        </div>
      )}

      {/* ── SECTIONS ── */}
      {sections.map((sec) => {
        const tab = getTab(sec.id);
        const assignments = assignmentsBySectionId[sec.id] || [];
        const assignmentsLoading = assignmentLoadingIds.has(sec.id);
        const lessonCount = sec.lessons?.length || 0;
        const assignmentCount = assignments.length;

        return (
          <div key={sec.id} className="mb-4 border border-gray-200 rounded-xl overflow-visible shadow-sm">

            {/* ── SECTION HEADER ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-xl">

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-gray-400 text-sm select-none">☰</span>

                {editingSectionId === sec.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveSection(sec.id)}
                      className="border px-2 py-1 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveSection(sec.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingSectionId(null); setEditingTitle(""); }}
                      className="text-xs border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2 className="font-semibold text-gray-800 truncate">{sec.title}</h2>
                )}
              </div>

              <div className="flex items-center gap-2 ml-2 relative">
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">·</span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {assignmentCount} assignment{assignmentCount !== 1 ? "s" : ""}
                </span>

                {isProfessor && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu.id === sec.id && openMenu.type === "section"
                            ? { type: null, id: null }
                            : { type: "section", id: sec.id }
                        )
                      }
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      ⋮
                    </button>

                    {openMenu.type === "section" && openMenu.id === sec.id && (
                      <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 shadow-lg rounded-lg w-36 py-1">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setEditingSectionId(sec.id);
                            setEditingTitle(sec.title);
                            setOpenMenu({ type: null, id: null });
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeleteSectionId(sec.id);
                            setOpenMenu({ type: null, id: null });
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── TAB BAR ── */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                onClick={() => handleTabChange(sec.id, "lessons")}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === "lessons"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                📚 Lessons
                {lessonCount > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {lessonCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange(sec.id, "assignments")}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === "assignments"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                📋 Assignments
                {assignmentCount > 0 && (
                  <span className="ml-1.5 text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">
                    {assignmentCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── TAB CONTENT ── */}
            <div className="bg-white rounded-b-xl">

              {/* ════════════ LESSONS TAB ════════════ */}
              {tab === "lessons" && (
                <div>
                  {sec.lessons?.length === 0 && (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">
                      No lessons yet. Add one below.
                    </div>
                  )}

                  {sec.lessons?.map((lesson: any) => (
                    <div key={lesson.id} className="flex justify-between items-start px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3 items-start">
                        <span className="mt-0.5 text-lg">{getFileIcon(lesson.file?.filename)}</span>
                        <div>
                          <div
                            className={`font-medium text-sm ${isProfessor ? "cursor-pointer hover:text-blue-600" : ""}`}
                            onClick={() => {
                              if (!isProfessor) return;
                              setEditingLesson(lesson);
                              setLessonTitleEdit(lesson.title);
                              setLessonFileEdit(null);
                            }}
                          >
                            {lesson.title}
                          </div>
                          <div className="flex gap-3 mt-0.5 items-center">
                            {lesson.file ? (
                              <a
                                href={getFileUrl(lesson.file.file_path)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Open file
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">No file</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(lesson.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isProfessor && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu.id === lesson.id && openMenu.type === "lesson"
                                  ? { type: null, id: null }
                                  : { type: "lesson", id: lesson.id }
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            ⋮
                          </button>
                          {openMenu.type === "lesson" && openMenu.id === lesson.id && (
                            <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 shadow-lg rounded-lg w-36 py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setLessonTitleEdit(lesson.title);
                                  setOpenMenu({ type: null, id: null });
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setDeleteLessonId(lesson.id);
                                  setOpenMenu({ type: null, id: null });
                                }}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isProfessor && (
                    <div className="px-6 py-3 bg-gray-50 rounded-b-xl flex gap-2">
                      <input
                        value={lessonInputs[sec.id] || ""}
                        onChange={(e) => setLessonInputs({ ...lessonInputs, [sec.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addLesson(sec.id)}
                        className="border p-2 text-sm w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New lesson title..."
                      />
                      <button
                        onClick={() => addLesson(sec.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ════════════ ASSIGNMENTS TAB ════════════ */}
              {tab === "assignments" && (
                <div>
                  {assignmentsLoading ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">Loading assignments...</div>
                  ) : assignments.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">
                      No assignments yet.{canManageAssignments ? " Add one below." : ""}
                    </div>
                  ) : (
                    assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-start px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          <span className="mt-0.5 text-lg">📋</span>
                          <div>
                            <div className="font-medium text-sm text-gray-800">
                              {assignment.title}
                            </div>
                            {assignment.description && (
                              <div className="text-xs text-gray-500 mt-0.5 max-w-md line-clamp-1">
                                {assignment.description}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 mt-1 items-center">
                              {/* Deadline + late indicator */}
                              <span className={`text-xs font-medium ${
                                new Date() > new Date(assignment.deadline)
                                  ? "text-red-500"
                                  : "text-orange-600"
                              }`}>
                                ⏰ {new Date(assignment.deadline).toLocaleString()}
                                {new Date() > new Date(assignment.deadline) && (
                                  <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">
                                    Closed
                                  </span>
                                )}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                Max: {assignment.max_grade}pts
                              </span>
                              {assignment.attachments && assignment.attachments.length > 0 && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                  {assignment.attachments.length} file{assignment.attachments.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {/* Attachments */}
                            {assignment.attachments && assignment.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {assignment.attachments.map((att) => (
                                  <a
                                    key={att.id}
                                    href={getFileUrl(att.file_path)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    {getFileIcon(att.filename)} {att.filename}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ── ACTIONS: profesor sheh submissions, studenti submit ── */}
                        <div className="flex items-center gap-2 flex-shrink-0">

                          {/* PROFESOR: submissions button + edit/delete menu */}
                          {isProfessor && (
                            <>
                              <button
                                onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
                              >
                                👥 Submissions
                              </button>

                              {/* Edit/Delete menu: vetem professor, jo admin */}
                              {canManageAssignments && (
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setOpenMenu(
                                        openMenu.id === assignment.id && openMenu.type === "assignment"
                                          ? { type: null, id: null }
                                          : { type: "assignment", id: assignment.id }
                                      )
                                    }
                                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    ⋮
                                  </button>
                                  {openMenu.type === "assignment" && openMenu.id === assignment.id && (
                                    <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 shadow-lg rounded-lg w-36 py-1">
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                        onClick={() => openEditAssignment(assignment, sec.id)}
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                          setDeleteAssignmentId(assignment.id);
                                          setDeleteAssignmentSectionId(sec.id);
                                          setOpenMenu({ type: null, id: null });
                                        }}
                                      >
                                        🗑 Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* ── STUDENT: submit button ── */}
                          {isStudent && (
                            <button
                              onClick={() =>
                                navigate(`/assignments/${assignment.id}/submit`)
                              }
                              disabled={new Date() > new Date(assignment.deadline)}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                                new Date() > new Date(assignment.deadline)
                                  ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              }`}
                            >
                              {new Date() > new Date(assignment.deadline)
                                ? "⛔ Closed"
                                : "📤 Submit"}
                            </button>
                          )}

                        </div>
                      </div>
                    ))
                  )}

                  {/* "+ New Assignment" button: vetem professor, jo admin */}
                  {canManageAssignments && (
                    <div className="px-6 py-3 bg-orange-50/50 rounded-b-xl">
                      <button
                        onClick={() => {
                          setCreateAssignmentSectionId(sec.id);
                          setAssignmentForm(emptyAssignmentForm());
                        }}
                        className="w-full border-2 border-dashed border-orange-300 text-orange-600 text-sm py-2 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors"
                      >
                        + New Assignment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════ */}

      {/* ── EDIT LESSON MODAL ── */}
      {editingLesson && (
        <Modal onClose={() => setEditingLesson(null)} title="Edit Lesson">
          <input
            value={lessonTitleEdit}
            onChange={(e) => setLessonTitleEdit(e.target.value)}
            className="border w-full p-2 mb-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Lesson title"
          />
          <label className="block text-xs text-gray-500 mb-1">Replace file (optional)</label>
          <input type="file" onChange={(e) => setLessonFileEdit(e.target.files?.[0] || null)} />
          <ModalActions
            onCancel={() => setEditingLesson(null)}
            onSave={saveLesson}
            saveLabel="Save"
          />
        </Modal>
      )}

      {/* ── DELETE SECTION MODAL ── */}
      {deleteSectionId && (
        <ConfirmModal
          message="Delete this section and all its content?"
          onCancel={() => setDeleteSectionId(null)}
          onConfirm={async () => {
            await removeSection(deleteSectionId);
            setDeleteSectionId(null);
          }}
        />
      )}

      {/* ── DELETE LESSON MODAL ── */}
      {deleteLessonId && (
        <ConfirmModal
          message="Delete this lesson?"
          onCancel={() => setDeleteLessonId(null)}
          onConfirm={() => removeLesson(deleteLessonId)}
        />
      )}

      {/* ── CREATE ASSIGNMENT MODAL ── */}
      {createAssignmentSectionId !== null && (
        <Modal
          onClose={() => setCreateAssignmentSectionId(null)}
          title="New Assignment"
        >
          <AssignmentFormFields
            form={assignmentForm}
            onChange={setAssignmentForm}
          />
          <ModalActions
            onCancel={() => setCreateAssignmentSectionId(null)}
            onSave={handleCreateAssignment}
            saveLabel={assignmentFormLoading ? "Creating..." : "Create"}
            disabled={assignmentFormLoading || !assignmentForm.title.trim() || !assignmentForm.deadline}
          />
        </Modal>
      )}

      {/* ── EDIT ASSIGNMENT MODAL ── */}
      {editingAssignment && (
        <Modal
          onClose={() => setEditingAssignment(null)}
          title="Edit Assignment"
        >
          <AssignmentFormFields
            form={editAssignmentForm}
            onChange={setEditAssignmentForm}
          />
          <ModalActions
            onCancel={() => setEditingAssignment(null)}
            onSave={handleUpdateAssignment}
            saveLabel={editAssignmentLoading ? "Saving..." : "Save"}
            disabled={editAssignmentLoading || !editAssignmentForm.title.trim()}
          />
        </Modal>
      )}

      {/* ── DELETE ASSIGNMENT MODAL ── */}
      {deleteAssignmentId && (
        <ConfirmModal
          message="Delete this assignment?"
          onCancel={() => { setDeleteAssignmentId(null); setDeleteAssignmentSectionId(null); }}
          onConfirm={confirmDeleteAssignment}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// REUSABLE SUB-COMPONENTS
// ─────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onSave,
  saveLabel,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2 border-t mt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function ConfirmModal({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentFormFields({
  form,
  onChange,
}: {
  form: AssignmentFormState;
  onChange: (f: AssignmentFormState) => void;
}) {
  const set = (key: keyof AssignmentFormState, val: any) =>
    onChange({ ...form, [key]: val });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const existing = form.files || [];
    // Shto skedarët e rinj, shmang duplikatet sipas emrit+madhësisë
    const merged = [...existing];
    selected.forEach((newFile) => {
      const exists = merged.some(
        (f) => f.name === newFile.name && f.size === newFile.size
      );
      if (!exists) merged.push(newFile);
    });
    set("files", merged);
    // Reset input-in që të mund të zgjidhet i njëjti skedar sërish
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const updated = (form.files || []).filter((_, i) => i !== index);
    set("files", updated.length > 0 ? updated : null);
  };

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="border w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="e.g. Homework 1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="border w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="Instructions for students..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deadline *</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            className="border w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Max Grade</label>
          <input
            type="number"
            value={form.maxGrade}
            onChange={(e) => set("maxGrade", e.target.value)}
            className="border w-full p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            min={0}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Attachments</label>
        <input
          type="file"
          multiple
          onChange={handleFiles}
          className="text-sm"
        />
        {form.files && form.files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {form.files.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs bg-gray-50 border rounded px-2 py-1">
                <span className="truncate max-w-xs">{getFileIcon(f.name)} {f.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}