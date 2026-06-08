import api from './axiosInstance';

// Sections
export const fetchSections = (courseId: number) =>
  api.get(`/course-content/sections/${courseId}`).then(r => r.data);

export const createSection = (data: any) =>
  api.post('/course-content/sections', data).then(r => r.data);

export const deleteSection = (id: number) =>
  api.delete(`/course-content/sections/${id}`);

export const updateSection = (id: number, data: any) =>
  api.put(`/course-content/sections/${id}`, data).then(r => r.data);
//Lessons
export const createLesson = (data: any) =>
  api.post("/course-content/lessons", data).then(r => r.data);

export const deleteLesson = (id: number) =>
api.delete(`/course-content/lessons/${id}`);

export const updateLesson = (id: number, data: any) =>
api.put(`/course-content/lessons/${id}`, data).then(r => r.data);

export const uploadLessonFile = (formData: FormData) =>
api.post(`/course-content/lessons`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
}).then(r => r.data);

// GET assignments by course
// ASSIGNMENTS API

export const fetchAssignments = async (sectionId: number) => {
  const res = await api.get(`/course-content/sections/${sectionId}/assignments`);
  return res.data;
};

export const createAssignment = async (data: any) => {
  const res = await api.post(`/course-content/assignments`, data);
  return res.data;
};

export const updateAssignment = async (id: number, data: any) => {
  const res = await api.put(`/course-content/assignments/${id}`, data);
  return res.data;
};

export const deleteAssignment = async (id: number) => {
  const res = await api.delete(`/course-content/assignments/${id}`);
  return res.data;
};