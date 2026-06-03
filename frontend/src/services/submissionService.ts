import api from "../api/axiosInstance";

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  file_id: number;

  grade: string | null;
  feedback: string | null;

  created_at: string;
  updated_at: string;

  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };

  file: {
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
  };
}

// GET assignment submissions
export const getAssignmentSubmissions = async (
  assignmentId: string | number
) => {
  const res = await api.get(
    `/assignments/${assignmentId}/submissions`
  );

  return res.data.data;
};

// GET submission by id
export const getSubmissionById = async (
  submissionId: string | number
) => {
  const res = await api.get(
    `/submissions/${submissionId}`
  );

  return res.data.data;
};

// GRADE submission
export const gradeSubmission = async (
  submissionId: number,
  payload: {
    grade: string;
    feedback: string;
  }
) => {
  const res = await api.put(
    `/submissions/${submissionId}`,
    payload
  );

  return res.data;
};

// DELETE submission
export const deleteSubmission = async (
  submissionId: number
) => {
  const res = await api.delete(
    `/submissions/${submissionId}`
  );

  return res.data;
};