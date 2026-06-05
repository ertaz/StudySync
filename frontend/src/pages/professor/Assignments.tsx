import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAssignments } from "../../hooks/useAssignments";
import { useAuth } from "../../context/AuthContext";

import {
  deleteAssignment,
  Assignment,
} from "../../services/assignmentService";

export default function Assignments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role; // "professor" | "admin" | "student"

  const {
    assignments,
    setAssignments,
    loading,
    error,
  } = useAssignments();

  const [search, setSearch] = useState("");

  // 🔥 UPDATED: search works for title + section + course
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a: Assignment) => {
      const searchLower = search.toLowerCase();

      return (
        a.title?.toLowerCase().includes(searchLower) ||
        a.course?.title?.toLowerCase().includes(searchLower) 
      );
    });
  }, [assignments, search]);

  const handleDelete = async (assignmentId: number) => {
    const confirmed = window.confirm(
      "Delete this assignment?"
    );

    if (!confirmed) return;

    try {
      await deleteAssignment(assignmentId);

      setAssignments((prev) =>
        prev.filter((a) => a.id !== assignmentId)
      );
    } catch {
      alert("Failed to delete assignment");
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Assignments
          </h1>

          <p className="text-sm text-gray-500">
            Manage course sections & assignments
          </p>
        </div>

        {/* ✅ Vetëm professor mund të krijojë assignment të ri */}
        {role === "professor" && (
          <button
            onClick={() => navigate("/assignments/new")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Assignment
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by title, course, or section..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">

        {loading ? (
          <div className="py-16 text-center">
            Loading assignments...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-16 text-center">
            No assignments found
          </div>
        ) : (
          <table className="w-full table-auto">

            <thead>
              <tr className="bg-gray-50 text-left">

                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Course</th>

                {/* 🔥 NEW */}
                <th className="px-6 py-4">Section</th>

                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Max Grade</th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {assignment.title}
                    </div>

                    <div className="text-xs text-gray-500">
                      {assignment.description}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {assignment.course?.title || "-"}
                  </td>

                  {/* 🔥 NEW SECTION */}
                  <td className="px-6 py-4">
                    {assignment.section?.title || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(assignment.deadline).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    {assignment.max_grade}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      {/* ✅ View — të gjithë rolet */}
                      <button
                        onClick={() =>
                          navigate(`/assignments/${assignment.id}`)
                        }
                        className="rounded-lg border px-3 py-2 text-xs hover:bg-gray-100"
                      >
                        View
                      </button>

                      {/* ✅ Submissions — professor dhe admin */}
                      {(role === "professor" || role === "admin") && (
                        <button
                          onClick={() =>
                            navigate(
                              `/assignments/${assignment.id}/submissions`
                            )
                          }
                          className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700"
                        >
                          Submissions
                        </button>
                      )}

                      {/* ✅ Edit — vetëm professor */}
                      {role === "professor" && (
                        <button
                          onClick={() =>
                            navigate(`/assignments/${assignment.id}/edit`)
                          }
                          className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700"
                        >
                          Edit
                        </button>
                      )}

                      {/* ✅ Delete — vetëm professor */}
                      {role === "professor" && (
                        <button
                          onClick={() =>
                            handleDelete(assignment.id)
                          }
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700"
                        >
                          Delete
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}