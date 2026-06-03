import { useEffect, useState } from "react";

import {
  Assignment,
  getAssignments,
} from "../services/assignmentService";

export const useAssignments = () => {
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const data =
        await getAssignments();

      setAssignments(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  return {
    assignments,
    setAssignments,
    loading,
    error,
    reload: loadAssignments,
  };
};