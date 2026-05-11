// src/api/courseApi.ts
import api from '../api/axiosInstance';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CourseThumbnail {
  id: number;
  file_path: string;
  filename: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  thumbnail_file_id?: number;
  category?: Category;
  thumbnail?: CourseThumbnail;
  created_at: string;
}

// ── Categories ────────────────────────────────────────────────
export const fetchCategories = (): Promise<Category[]> =>
  api.get('/categories').then((r) => r.data.data);

export const createCategory = (name: string, description?: string): Promise<Category> =>
  api.post('/categories', { name, description }).then((r) => r.data.data);

// ── Courses ───────────────────────────────────────────────────
export const fetchCourses = (): Promise<Course[]> =>
  api.get('/courses').then((r) => r.data.data);

export const fetchCourseById = (id: number): Promise<Course> =>
  api.get(`/courses/${id}`).then((r) => r.data.data);

// Create — sends multipart/form-data
export const createCourse = (payload: {
  title: string;
  description?: string;
  category_id?: number;
  thumbnail?: File;
}): Promise<Course> => {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  if (payload.category_id) form.append('category_id', String(payload.category_id));
  if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail);
  return api.post('/courses', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data);
};

// Update — sends multipart/form-data (thumbnail is optional)
export const updateCourse = (id: number, payload: {
  title: string;
  description?: string;
  category_id?: number;
  thumbnail?: File;
}): Promise<Course> => {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description !== undefined) form.append('description', payload.description);
  if (payload.category_id) form.append('category_id', String(payload.category_id));
  if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail);
  return api.put(`/courses/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.data);
};

export const deleteCourse = (id: number): Promise<void> =>
  api.delete(`/courses/${id}`).then((r) => r.data);

// Converts a relative DB path to a full URL
export const getThumbnailUrl = (filePath?: string): string | null => {
  if (!filePath) return null;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}/${filePath}`;
};
