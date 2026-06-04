import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMySubmission,
  createSubmission,
  addFilesToSubmission,
  removeSubmissionFile,
  Submission,
} from "../../services/submissionService";

export default function SubmissionForm() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [submission, setSubmission]     = useState<Submission | null>(null);
  const [newFiles, setNewFiles]         = useState<File[]>([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  // ── Ngarko submission ekzistuese nëse ka ──
  useEffect(() => {
    if (!assignmentId) return;
    (async () => {
      try {
        const data = await getMySubmission(assignmentId);
        setSubmission(data);
      } catch {
        // nuk ka submission ende — normal
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId]);

  // ── Shto file në listë (pa zëvendësuar ato ekzistueset) ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files);
    setNewFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const fresh = picked.filter((f) => !names.has(f.name));
      return [...prev, ...fresh];
    });
    // reset input kështu mund të zgjedhin të njëjtin file sërish nëse duan
    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Fshi file të dorëzuar nga serveri ──
  const handleDeleteFile = async (fileId: number) => {
    try {
      setDeletingId(fileId);
      await removeSubmissionFile(fileId);
      setSubmission((prev) =>
        prev
          ? { ...prev, submissionFiles: prev.submissionFiles.filter((sf) => sf.id !== fileId) }
          : prev
      );
      setSuccess("File removed.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove file.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Submit / Update ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!assignmentId) return;

    // Nëse nuk ka ende submission dhe nuk ka zgjedhur file
    if (!submission && newFiles.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    try {
      setSubmitting(true);

      if (!submission) {
        // Herë e parë — krijo submission
        const res = await createSubmission(parseInt(assignmentId), newFiles);
        setSubmission(res.data);
        setNewFiles([]);
        setSuccess("Assignment submitted successfully!");
      } else if (newFiles.length > 0) {
        // Ka submission — shto file të reja
        const res = await addFilesToSubmission(submission.id, newFiles);
        setSubmission(res.data);
        setNewFiles([]);
        setSuccess("Files added successfully!");
      } else {
        setError("No new files selected.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isGraded = submission?.grade !== null && submission?.grade !== undefined;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <h1 className="mb-1 text-2xl font-bold">
          {submission ? "My Submission" : "Submit Assignment"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {submission
            ? "You have already submitted. You can add or remove files below."
            : "Upload your files below. You can attach multiple files."}
        </p>

        {/* ── GRADE & FEEDBACK (nëse profesori ka vlerësuar) ── */}
        {isGraded && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="mb-1 text-sm font-semibold text-green-800">
              ✅ Graded
            </p>
            <p className="text-sm text-green-700">
              <span className="font-medium">Grade:</span> {submission!.grade}
            </p>
            {submission!.feedback && (
              <p className="mt-1 text-sm text-green-700">
                <span className="font-medium">Feedback:</span> {submission!.feedback}
              </p>
            )}
          </div>
        )}

        {/* ── SUBMITTED AT ── */}
        {submission && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <span>📅 Submitted:</span>
            <span>{new Date(submission.submitted_at).toLocaleString()}</span>
            {submission.is_late === 1 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                Late
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── FILE-T E DORËZUARA (nga serveri) ── */}
          {submission && submission.submissionFiles.length > 0 && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Submitted files:
              </p>
              <ul className="space-y-2">
                {submission.submissionFiles.map((sf) => (
                  <li key={sf.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span>{sf.file.filename}</span>
                      <span className="text-xs text-gray-400">
                        ({(sf.file.file_size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(sf.id)}
                      disabled={deletingId === sf.id}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deletingId === sf.id ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── SHTO FILE TË REJA ── */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              {submission ? "Add more files" : "Files"}{" "}
              {!submission && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border px-4 py-3 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Accepted: PDF, Word, PowerPoint, ZIP, images. Max 10 MB per file.
            </p>
          </div>

          {/* PREVIEW file të reja (ende jo dërguar) */}
          {newFiles.length > 0 && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <p className="mb-2 text-sm font-medium text-blue-700">
                New files to upload:
              </p>
              <ul className="space-y-1">
                {newFiles.map((file, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span>{file.name}</span>
                      <span className="text-xs text-gray-400">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ERROR / SUCCESS */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border px-5 py-3 text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : submission
                ? "Add Files"
                : "Submit"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}