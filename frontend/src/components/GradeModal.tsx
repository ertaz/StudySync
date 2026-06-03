import { useState } from "react";

interface GradeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    grade: string,
    feedback: string
  ) => Promise<void>;
  currentGrade?: string | null;
  currentFeedback?: string | null;
}

export default function GradeModal({
  open,
  onClose,
  onSubmit,
  currentGrade,
  currentFeedback,
}: GradeModalProps) {
  const [grade, setGrade] = useState(
    currentGrade || ""
  );

  const [feedback, setFeedback] =
    useState(currentFeedback || "");

  const [loading, setLoading] =
    useState(false);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setLoading(true);

      await onSubmit(
        grade,
        feedback
      );

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-5 text-xl font-bold">
          Grade Submission
        </h2>

        <div className="space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Grade
            </label>

            <input
              value={grade}
              onChange={(e) =>
                setGrade(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="e.g. 10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Feedback
            </label>

            <textarea
              rows={5}
              value={feedback}
              onChange={(e) =>
                setFeedback(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            {loading
              ? "Saving..."
              : "Save Grade"}
          </button>

        </div>

      </div>
    </div>
  );
}