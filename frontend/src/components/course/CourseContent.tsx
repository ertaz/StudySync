import { useEffect, useState } from "react";
import {
  fetchSections,
  createSection,
  createLesson,
  deleteSection,
  updateSection,
} from "../../api/courseContentApi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

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

export default function CourseContent({ courseId }: { courseId: number }) {
  const { user } = useAuth();

  const [sections, setSections] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const [lessonInputs, setLessonInputs] = useState<{ [key: number]: string }>({});

  const [openMenu, setOpenMenu] = useState<{
    type: "section" | "lesson" | null;
    id: number | null;
  }>({ type: null, id: null });

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonTitleEdit, setLessonTitleEdit] = useState("");
  const [lessonFileEdit, setLessonFileEdit] = useState<File | null>(null);

  const [deleteSectionId, setDeleteSectionId] = useState<number | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);

  const isProfessor =
    user?.role === "admin" || user?.role === "professor";

  const load = async () => {
    const data = await fetchSections(courseId);
    setSections(data || []);
  };

  useEffect(() => {
    if (courseId) load();
  }, [courseId]);

  // ---------------- SECTION CRUD ----------------

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
      console.log("Deleting section:", id);
  
      const res = await deleteSection(id);
  
      console.log("Delete response:", res);
  
      await load();
  
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  // ---------------- LESSON CRUD ----------------

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

    if (lessonFileEdit) {
      formData.append("file", lessonFileEdit);
    }

    await api.put(
      `/course-content/lessons/${editingLesson.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

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

  // ---------------- UI ----------------

  return (
    <div className="mt-6">

      {/* ADD SECTION */}
      {isProfessor && (
        <div className="flex gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="New section title..."
          />
          <button
            onClick={addSection}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add Section
          </button>
        </div>
      )}

      {/* SECTIONS */}
      {sections.map((sec) => (
        <div key={sec.id} className="mb-6 border p-4 rounded">

          {/* SECTION HEADER */}
          <div className="flex justify-between items-center">

            {editingSectionId === sec.id ? (
              <div className="flex gap-2">
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="border px-2 py-1"
                />
                <button onClick={() => saveSection(sec.id)}>Save</button>
              </div>
            ) : (
              <h2 className="font-bold text-lg">{sec.title}</h2>
            )}

            {isProfessor && (
              <button
                onClick={() =>
                  setOpenMenu(
                    openMenu.id === sec.id && openMenu.type === "section"
                      ? { type: null, id: null }
                      : { type: "section", id: sec.id }
                  )
                }
              >
                ⋮
              </button>
            )}

            {openMenu.type === "section" && openMenu.id === sec.id && (
              <div className="absolute right-10 bg-white border shadow rounded w-32">
                <button
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setEditingSectionId(sec.id);
                    setEditingTitle(sec.title);
                    setOpenMenu({ type: null, id: null });
                  }}
                >
                  Edit
                </button>

                <button
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setDeleteSectionId(sec.id);
                    setOpenMenu({ type: null, id: null });
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* LESSONS */}
          <div className="ml-4 mt-3">

            {sec.lessons?.map((lesson: any) => (
              <div
                key={lesson.id}
                className="flex justify-between items-start border-b py-3"
              >

                {/* LEFT */}
                <div className="flex gap-3">

                <div className="flex items-center gap-2">
  <div>{getFileIcon(lesson.file?.filename)}</div>

  {lesson.file ? (
  <a
    href={getFileUrl(lesson.file.file_path)}
    target="_blank"
     rel="noreferrer"
    className="text-blue-600 hover:underline"
  >
    Open file
  </a>
) : (
  <span className="text-xs text-gray-400">No file</span>
)}
</div>

                  <div>
                    <div
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => {
                        setEditingLesson(lesson);
                        setLessonTitleEdit(lesson.title);
                        setLessonFileEdit(null);
                      }}
                    >
                      {lesson.title}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(lesson.created_at).toLocaleString()}
                    </div>
                  </div>

                </div>

                {/* MENU */}
                {isProfessor && (
                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu.id === lesson.id &&
                          openMenu.type === "lesson"
                          ? { type: null, id: null }
                          : { type: "lesson", id: lesson.id }
                      )
                    }
                  >
                    ⋮
                  </button>
                )}

                {openMenu.type === "lesson" &&
                  openMenu.id === lesson.id && (
                    <div className="absolute right-10 bg-white border shadow rounded w-32">

                      <button
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setEditingLesson(lesson);
                          setLessonTitleEdit(lesson.title);
                          setOpenMenu({ type: null, id: null });
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                        onClick={() => {
                          setDeleteLessonId(lesson.id);
                          setOpenMenu({ type: null, id: null });
                        }}
                      >
                        Delete
                      </button>

                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* ADD LESSON */}
          {isProfessor && (
            <div className="mt-3 flex gap-2">
              <input
                value={lessonInputs[sec.id] || ""}
                onChange={(e) =>
                  setLessonInputs({
                    ...lessonInputs,
                    [sec.id]: e.target.value,
                  })
                }
                className="border p-2 w-full"
                placeholder="New lesson..."
              />
              <button onClick={() => addLesson(sec.id)}>
                Add
              </button>
            </div>
          )}
        </div>
      ))}

      {/* EDIT LESSON MODAL */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 w-[400px] rounded">

            <input
              value={lessonTitleEdit}
              onChange={(e) => setLessonTitleEdit(e.target.value)}
              className="border w-full p-2 mb-3"
            />

            <input
              type="file"
              onChange={(e) =>
                setLessonFileEdit(e.target.files?.[0] || null)
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveLesson}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

{deleteSectionId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded">

      <p>Delete this section?</p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setDeleteSectionId(null)}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await removeSection(deleteSectionId);
            setDeleteSectionId(null);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}

      {/* DELETE LESSON MODAL */}
      {deleteLessonId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded">

            <p>Delete this lesson?</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDeleteLessonId(null)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => removeLesson(deleteLessonId)}
                className="px-3 py-1 bg-red-600 text-white rounded"
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