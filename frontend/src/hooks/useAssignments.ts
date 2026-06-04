import { useEffect, useState, useCallback } from "react";

import {
  Assignment,
  getAssignments,
} from "../services/assignmentService";

type Filters = {
  course_id?: number;
  section_id?: number;
  title?: string;
  description?: string;
};

export const useAssignments = (initialFilters: Filters = {}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<Filters>(initialFilters);

  const loadAssignments = useCallback(async (customFilters?: Filters) => {
    try {
      setLoading(true);

      const activeFilters = customFilters || filters;

      const data = await getAssignments(activeFilters);

      setAssignments(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
    setAssignments,

    loading,
    error,

    reload: loadAssignments,

    filters,
    setFilters,
  };
};