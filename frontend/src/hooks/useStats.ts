import { useEffect, useState } from "react";

import {
  AssignmentStats,
  getAssignmentStats,
} from "../services/assignmentService";

export const useStats = () => {
  const [stats, setStats] =
    useState<AssignmentStats>({
      total: 0,
      submitted: 0,
      overdue: 0,
      pending: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadStats = async () => {
    try {
      setLoading(true);

      const data =
        await getAssignmentStats();

      setStats(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load stats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    reload: loadStats,
  };
};