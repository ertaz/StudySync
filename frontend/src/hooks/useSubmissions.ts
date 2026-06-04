import { useEffect, useState, useCallback } from "react";
import {
  Submission,
  getAssignmentSubmissions,
} from "../services/submissionService";

type SubmissionParams = {
  filter?: "late" | "ontime";
  sort?: "submitted_at" | "created_at";
  order?: "asc" | "desc";
};

export const useSubmissions = (
  assignmentId: string | number,
  initialParams: SubmissionParams = {}
) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params, setParams] = useState<SubmissionParams>(initialParams);

  const loadSubmissions = useCallback(
    async (customParams?: SubmissionParams) => {
      if (!assignmentId) return;
      try {
        setLoading(true);
        const data = await getAssignmentSubmissions(
          assignmentId,
          customParams ?? params
        );
        setSubmissions(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load submissions"
        );
      } finally {
        setLoading(false);
      }
    },
    [assignmentId, params]
  );

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  return {
    submissions,
    setSubmissions,
    loading,
    error,
    params,
    setParams,
    reload: loadSubmissions,
  };
};