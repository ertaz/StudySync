import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Assignment,
  getAssignmentById,
} from "../../services/assignmentService";

export default function AssignmentDetail() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [assignment,
    setAssignment] =
    useState<Assignment | null>(
      null
    );

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment =
    async () => {

      if (!id) return;

      try {
        const data =
          await getAssignmentById(
            id
          );

        setAssignment(data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  if (loading)
    return (
      <div className="p-6">
        Loading...
      </div>
    );

  if (!assignment)
    return (
      <div className="p-6">
        Assignment not found
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">

      <div className="rounded-xl border bg-white p-8">

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              {
                assignment.title
              }
            </h1>

            <p className="mt-2 text-gray-500">
              {
                assignment.course
                  ?.title
              }
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/assignments/${assignment.id}/edit`
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Edit
          </button>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">
              Deadline
            </div>

            <div className="font-medium">
              {new Date(
                assignment.deadline
              ).toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">
              Max Grade
            </div>

            <div className="font-medium">
              {
                assignment.max_grade
              }
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">
              Attachments
            </div>

            <div className="font-medium">
              {
                assignment
                  .attachments
                  ?.length
              }
            </div>
          </div>

        </div>

        <div className="mt-8">

          <h3 className="mb-2 text-lg font-semibold">
            Description
          </h3>

          <p className="whitespace-pre-line text-gray-700">
            {
              assignment.description
            }
          </p>

        </div>

        {/* FILES */}

        <div className="mt-8">

          <h3 className="mb-4 text-lg font-semibold">
            Attachments
          </h3>

          <div className="space-y-2">

            {assignment
              .attachments
              ?.map((file) => (

              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span>
                  {
                    file.filename
                  }
                </span>

                <a
                  href={`http://localhost:5000/${file.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  Open
                </a>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}