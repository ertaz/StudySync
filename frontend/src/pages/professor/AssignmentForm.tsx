import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAssignment,
  getAssignmentById,
  updateAssignment,
} from "../../services/assignmentService";

import {
  fetchCourses,
} from "../../api/courseApi";

export default function AssignmentForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] =
    useState(false);

  const [courses, setCourses] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [description,
    setDescription] =
    useState("");

  const [courseId,
    setCourseId] =
    useState("");

  const [deadline,
    setDeadline] =
    useState("");

  const [maxGrade,
    setMaxGrade] =
    useState("");

  const [files,
    setFiles] =
    useState<FileList | null>(null);

  useEffect(() => {
    loadCourses();

    if (isEdit && id) {
      loadAssignment(id);
    }
  }, []);

  const loadCourses = async () => {
    try {
      const data =
        await fetchCourses();

      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssignment =
    async (assignmentId: string) => {

      try {
        const assignment =
          await getAssignmentById(
            assignmentId
          );

        setTitle(
          assignment.title
        );

        setDescription(
          assignment.description
        );

        setCourseId(
          String(
            assignment.course_id
          )
        );

        setMaxGrade(
          assignment.max_grade
        );

        setDeadline(
          assignment.deadline
            .slice(0, 16)
        );
      } catch (err) {
        console.error(err);
      }
    };

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "title",
          title
        );

        formData.append(
          "description",
          description
        );

        formData.append(
          "course_id",
          courseId
        );

        formData.append(
          "deadline",
          deadline
        );

        formData.append(
          "max_grade",
          maxGrade
        );

        if (files) {
          Array.from(files)
            .forEach((file) => {
              formData.append(
                "files",
                file
              );
            });
        }

        if (isEdit && id) {
          await updateAssignment(
            id,
            formData
          );
        } else {
          await createAssignment(
            formData
          );
        }

        navigate(
          "/assignments"
        );

      } catch (err) {
        console.error(err);

        alert(
          "Failed to save assignment"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="mx-auto max-w-4xl p-6">

      <div className="rounded-xl border border-stroke bg-white p-8 shadow-sm">

        <h1 className="mb-6 text-2xl font-bold">
          {isEdit
            ? "Edit Assignment"
            : "Create Assignment"}
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* COURSE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Course
            </label>

            <select
              value={courseId}
              onChange={(e) =>
                setCourseId(
                  e.target.value
                )
              }
              required
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="">
                Select Course
              </option>

              {courses.map(
                (course) => (
                  <option
                    key={
                      course.id
                    }
                    value={
                      course.id
                    }
                  >
                    {
                      course.title
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* DEADLINE */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Deadline
            </label>

            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) =>
                setDeadline(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setMaxGrade(
                  e.target.value
                )
              }
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
              onChange={(e) =>
                setFiles(
                  e.target.files
                )
              }
            />
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/assignments"
                )
              }
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update"
                : "Create"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}