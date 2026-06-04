import api from "../api/axiosInstance";

export interface SubmissionFile {
  id: number;
  file: {
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
  };
}

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string;
  is_late: 0 | 1;
  grade: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  student: { id: number; first_name: string; last_name: string; email: string };
  submissionFiles: SubmissionFile[];
}

export const getAssignmentSubmissions = async (
  assignmentId: string | number,
  params?: { filter?: "late" | "ontime"; sort?: "submitted_at" | "created_at"; order?: "asc" | "desc" }
) => {
  const res = await api.get(`/submissions/assignment/${assignmentId}`, { params });
  return res.data.data;
};

export const getSubmissionById = async (submissionId: string | number) => {
  const res = await api.get(`/submissions/${submissionId}`);
  return res.data.data;
};

// ✅ Student merr submission e tij për një assignment (null nëse s'ka dorëzuar)
export const getMySubmission = async (assignmentId: string | number): Promise<Submission | null> => {
  const res = await api.get(`/submissions/my/${assignmentId}`);
  return res.data.data;
};

export const createSubmission = async (assignmentId: number, files: File[]) => {
  const formData = new FormData();
  formData.append("assignment_id", assignmentId.toString());
  files.forEach((file) => formData.append("files", file));
  const res = await api.post("/submissions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Student shton file të reja tek submission ekzistuese
export const addFilesToSubmission = async (submissionId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await api.post(`/submissions/${submissionId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Student fshin një file të vetme
export const removeSubmissionFile = async (fileId: number) => {
  const res = await api.delete(`/submissions/files/${fileId}`);
  return res.data;
};

export const gradeSubmission = async (submissionId: number, payload: { grade: string; feedback: string }) => {
  const res = await api.put(`/submissions/${submissionId}`, payload);
  return res.data;
};

export const deleteSubmission = async (submissionId: number) => {
  const res = await api.delete(`/submissions/${submissionId}`);
  return res.data;
};