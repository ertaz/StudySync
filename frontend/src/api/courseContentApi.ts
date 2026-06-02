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

// Lessons
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