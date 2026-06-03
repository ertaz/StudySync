import { useState } from "react";

import { useParams } from "react-router-dom";

import {
  deleteSubmission,
  gradeSubmission,
  Submission,
} from "../../services/submissionService";

import { useSubmissions } from "../../hooks/useSubmissions";

import GradeModal from "../../components/GradeModal";

export default function AssignmentSubs() {
  const { id } = useParams();

  const {
    submissions,
    setSubmissions,
    loading,
    error,
    reload,
  } = useSubmissions(id || "");

  const [selectedSubmission,
    setSelectedSubmission] =
    useState<Submission | null>(
      null
    );

  const [modalOpen,
    setModalOpen] =
    useState(false);

  const handleGradeClick = (
    submission: Submission
  ) => {
    setSelectedSubmission(
      submission
    );

    setModalOpen(true);
  };

  const handleGradeSave =
    async (
      grade: string,
      feedback: string
    ) => {

      if (
        !selectedSubmission
      )
        return;

      await gradeSubmission(
        selectedSubmission.id,
        {
          grade,
          feedback,
        }
      );

      await reload();
    };

  const handleDelete =
    async (
      submissionId: number
    ) => {

      const confirmed =
        window.confirm(
          "Delete submission?"
        );

      if (!confirmed) return;

      await deleteSubmission(
        submissionId
      );

      setSubmissions(
        submissions.filter(
          (s) =>
            s.id !==
            submissionId
        )
      );
    };

  return (
    <div className="mx-auto max-w-screen-xl p-6">

      <div className="mb-6">

        <h1 className="text-2xl font-bold">
          Assignment Submissions
        </h1>

        <p className="text-sm text-gray-500">
          Review and grade student submissions
        </p>

      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">

        {loading ? (
          <div className="py-16 text-center">
            Loading submissions...
          </div>
        ) : submissions.length ===
          0 ? (
          <div className="py-16 text-center">
            No submissions found
          </div>
        ) : (
          <table className="w-full">

            <thead>
              <tr className="bg-gray-50 text-left">

                <th className="px-6 py-4">
                  Student
                </th>

                <th className="px-6 py-4">
                  Email
                </th>

                <th className="px-6 py-4">
                  File
                </th>

                <th className="px-6 py-4">
                  Submitted
                </th>

                <th className="px-6 py-4">
                  Grade
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {submissions.map(
                (
                  submission
                ) => (
                  <tr
                    key={
                      submission.id
                    }
                    className="border-t"
                  >

                    <td className="px-6 py-4">

                      {
                        submission
                          .student
                          .first_name
                      }{" "}
                      {
                        submission
                          .student
                          .last_name
                      }

                    </td>

                    <td className="px-6 py-4">
                      {
                        submission
                          .student
                          .email
                      }
                    </td>

                    <td className="px-6 py-4">

                      <a
                        href={`http://localhost:5000/${submission.file.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        {
                          submission
                            .file
                            .filename
                        }
                      </a>

                    </td>

                    <td className="px-6 py-4">

                      {new Date(
                        submission.created_at
                      ).toLocaleString()}

                    </td>

                    <td className="px-6 py-4">

                      {submission.grade ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                          {
                            submission.grade
                          }
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                          Pending
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            handleGradeClick(
                              submission
                            )
                          }
                          className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700"
                        >
                          Grade
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              submission.id
                            )
                          }
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        )}
      </div>

      <GradeModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={
          handleGradeSave
        }
        currentGrade={
          selectedSubmission?.grade
        }
        currentFeedback={
          selectedSubmission?.feedback
        }
      />
    </div>
  );
}