import { useEffect, useState } from "react";

import {
  Submission,
  getAssignmentSubmissions,
} from "../services/submissionService";

export const useSubmissions = (
  assignmentId: string | number
) => {
  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);

      const data =
        await getAssignmentSubmissions(
          assignmentId
        );

      setSubmissions(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!assignmentId) return;

    loadSubmissions();
  }, [assignmentId]);

  return {
    submissions,
    setSubmissions,
    loading,
    error,
    reload: loadSubmissions,
  };
};