import { useState } from "react";
import { useParams } from "react-router-dom";

import {
  deleteSubmission,
  gradeSubmission,
  Submission,
} from "../../services/submissionService";

import { useSubmissions } from "../../hooks/useSubmissions";
import { useAuth } from "../../context/AuthContext";
import GradeModal from "../../components/GradeModal";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function AssignmentSubs() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role; // "professor" | "admin" | "student"

  const {
    submissions,
    setSubmissions,
    loading,
    error,
    reload,
    params,
    setParams,
  } = useSubmissions(id || "");

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── filter helpers ── */
  const handleFilter = (filter: "late" | "ontime" | "") => {
    const next = { ...params, filter: filter || undefined };
    setParams(next);
    reload(next);
  };

  /* ── sort helper ── */
  const handleSort = (sort: "submitted_at" | "created_at") => {
    const next = {
      ...params,
      sort,
      order:
        params.sort === sort && params.order === "asc" ? "desc" : "asc",
    } as typeof params;
    setParams(next);
    reload(next);
  };

  /* ── grade ── */
  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  const handleGradeSave = async (grade: string, feedback: string) => {
    if (!selectedSubmission) return;
    await gradeSubmission(selectedSubmission.id, { grade, feedback });
    await reload();
  };

  /* ── delete ── */
  const handleDelete = async (submissionId: number) => {
    if (!window.confirm("Delete submission?")) return;
    await deleteSubmission(submissionId);
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
  };

  /* ── sort icon ── */
  const sortIcon = (field: "submitted_at" | "created_at") => {
    if (params.sort !== field) return " ↕";
    return params.order === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-screen-xl p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Assignment Submissions</h1>
        <p className="text-sm text-gray-500">
          Review and grade student submissions
        </p>
      </div>

      {/* FILTERS */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(
            [
              { label: "All",     value: ""       },
              { label: "On Time", value: "ontime" },
              { label: "Late",    value: "late"   },
            ] as const
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                (params.filter ?? "") === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-gray-500">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No submissions found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Files</th>
                <th
                  className="cursor-pointer px-6 py-4 hover:text-blue-600"
                  onClick={() => handleSort("submitted_at")}
                >
                  Submitted{sortIcon("submitted_at")}
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-t hover:bg-gray-50">

                  {/* Student */}
                  <td className="px-6 py-4 font-medium">
                    {submission.student.first_name}{" "}
                    {submission.student.last_name}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {submission.student.email}
                  </td>

                  {/* Files */}
                  <td className="px-6 py-4">
                    {submission.submissionFiles?.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {submission.submissionFiles.map((sf) => (
                          <a
                            key={sf.id}
                            href={`${BASE_URL}/${sf.file.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          >
                            <span>📄</span>
                            <span>{sf.file.filename}</span>
                            <span className="text-xs text-gray-400">
                              ({(sf.file.file_size / 1024).toFixed(0)} KB)
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No files</span>
                    )}
                  </td>

                  {/* Submitted at */}
                  <td className="px-6 py-4 text-sm">
                    {new Date(submission.submitted_at).toLocaleString()}
                  </td>

                  {/* Late / On Time */}
                  <td className="px-6 py-4">
                    {submission.is_late ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Late
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        On Time
                      </span>
                    )}
                  </td>

                  {/* Grade */}
                  <td className="px-6 py-4">
                    {submission.grade ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {submission.grade}
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      {/* ✅ Grade — vetëm professor */}
                      {role === "professor" && (
                        <button
                          onClick={() => handleGradeClick(submission)}
                          className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700 hover:bg-blue-100"
                        >
                          Grade
                        </button>
                      )}

                      {/* ✅ Delete — vetëm professor */}
                      {role === "professor" && (
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}

                      {/* ✅ Admin — view only, nuk ka butona */}
                      {role === "admin" && (
                        <span className="text-xs italic text-gray-400">
                          View only
                        </span>
                      )}

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* GRADE MODAL — hapet vetëm për professor */}
      {role === "professor" && (
        <GradeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleGradeSave}
          currentGrade={selectedSubmission?.grade}
          currentFeedback={selectedSubmission?.feedback}
        />
      )}
    </div>
  );
}