import api from "../api/axiosInstance";

/* ─────────────────────────────
   TYPES
──────────────────────────── */

export interface AssignmentAttachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
}

export interface Assignment {
  id: number;

  course_id: number;
  section_id?: number;

  title: string;
  description: string;

  // 🔥 KEEP THIS EXACT (backend e kthen string date)
  deadline: string;

  max_grade: number; // (më mirë number, jo string)

  created_at: string;
  updated_at: string;

  course?: {
    id: number;
    title: string;
  };

  section?: {
    id: number;
    title: string; // ⚠️ jo "name"
  };

  attachments?: AssignmentAttachment[];
}
export interface AssignmentStats {
  total: number;
  submitted: number;
  overdue: number;
  pending: number;
}

/* ─────────────────────────────
   GET ALL (LEGACY + NEW FILTERS)
──────────────────────────── */

/**
 * Supports:
 * - old: getAssignments()
 * - new: getAssignments({ course_id, section_id })
 */
export const getAssignments = async (filters?: {
  course_id?: number | string;
  section_id?: number | string;
}) => {
  const res = await api.get("/assignments", {
    params: filters,
  });

  return res.data.data;
};

/* ─────────────────────────────
   GET BY ID
──────────────────────────── */

export const getAssignmentById = async (id: string | number) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data.data;
};

/* ─────────────────────────────
   CREATE
   (NOW SECTION-AWARE)
──────────────────────────── */

/**
 * REQUIRED now:
 * - section_id must exist (from UI context)
 */
export const createAssignment = async (formData: FormData) => {
  const res = await api.post("/assignments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* ─────────────────────────────
   UPDATE
──────────────────────────── */

export const updateAssignment = async (
  id: string | number,
  formData: FormData
) => {
  const res = await api.put(`/assignments/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* ─────────────────────────────
   DELETE
──────────────────────────── */

export const deleteAssignment = async (id: number) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

/* ─────────────────────────────
   ATTACHMENTS
──────────────────────────── */

export const deleteAttachment = async (
  assignmentId: number,
  fileId: number
) => {
  const res = await api.delete(
    `/assignments/${assignmentId}/attachments/${fileId}`
  );

  return res.data;
};

/* ─────────────────────────────
   STATS
──────────────────────────── */

export const getAssignmentStats = async (): Promise<AssignmentStats> => {
  const res = await api.get("/assignments/stats");
  return res.data.data;
};

/* ─────────────────────────────
   EXPORT / IMPORT (UNCHANGED)
──────────────────────────── */

export const exportAssignments = async (
  format: "csv" | "excel" | "json"
) => {
  const res = await api.get(
    `/assignments/export?format=${format}`,
    {
      responseType: "blob",
    }
  );

  return res.data;
};

export const importAssignments = async (file: FormData) => {
  const res = await api.post("/assignments/import", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};