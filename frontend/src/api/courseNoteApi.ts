import api from "./axiosInstance";

export interface CourseNote {
  id: number;
  course_id: number;
  student_id: number;
  title: string;

  student: {
    id: number;
    first_name: string;
    last_name: string;
  };

  file: {
    id: number;
    filename: string;
    file_path: string;
  };

  created_at: string;
}

export const fetchCourseNotes = async (courseId: number) => {
  const res = await api.get(`/course-notes/course/${courseId}`);
  return res.data;
};

export const uploadCourseNote = async (
  courseId: number,
  file: File,
  title: string
) => {
  const form = new FormData();

  form.append("title", title);
  form.append("course_id", String(courseId));
  form.append("file", file);

  return api.post("/course-notes", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteCourseNote = async (noteId: number) => {
  await api.delete(`/course-notes/${noteId}`);
};