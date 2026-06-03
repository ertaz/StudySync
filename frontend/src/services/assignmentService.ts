import api from "../api/axiosInstance";

export interface AssignmentAttachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  deadline: string;
  max_grade: string;

  created_at: string;
  updated_at: string;

  course?: {
    id: number;
    title: string;
  };

  attachments?: AssignmentAttachment[];
}

export interface AssignmentStats {
  total: number;
  submitted: number;
  overdue: number;
  pending: number;
}

// GET /assignments
export const getAssignments = async () => {
  const res = await api.get("/assignments");
  return res.data.data;
};

// GET /assignments/:id
export const getAssignmentById = async (id: string | number) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data.data;
};

// POST /assignments
export const createAssignment = async (formData: FormData) => {
  const res = await api.post("/assignments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// PUT /assignments/:id
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

// DELETE /assignments/:id
export const deleteAssignment = async (id: number) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

// DELETE attachment
export const deleteAttachment = async (
  assignmentId: number,
  fileId: number
) => {
  const res = await api.delete(
    `/assignments/${assignmentId}/attachments/${fileId}`
  );

  return res.data;
};

// GET stats
export const getAssignmentStats = async (): Promise<AssignmentStats> => {
  const res = await api.get("/assignments/stats");
  return res.data.data;
};

// EXPORT
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

// IMPORT
export const importAssignments = async (file: FormData) => {
    const res = await api.post("/assignments/import", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  
    return res.data;
  };