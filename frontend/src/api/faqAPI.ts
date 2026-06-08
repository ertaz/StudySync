import api from './axiosInstance';

export const getCategoriesAPI = () =>
  api.get('/faqs/categories').then(r => r.data.data);

export const createCategoryAPI = (data: { name: string; description?: string }) =>
  api.post('/faqs/categories', data).then(r => r.data);

export const updateCategoryAPI = (id: number, data: { name: string; description?: string }) =>
  api.put(`/faqs/categories/${id}`, data).then(r => r.data);

export const deleteCategoryAPI = (id: number) =>
  api.delete(`/faqs/categories/${id}`).then(r => r.data);

export const getFaqsByCourseAPI = (courseId: number) =>
  api.get(`/faqs/course/${courseId}`).then(r => r.data.data);

export const createFaqAPI = (data: {
  course_id: number; faqcategory_id: number; question: string; answer: string;
}) => api.post('/faqs', data).then(r => r.data);

export const updateFaqAPI = (id: number, data: {
  faqcategory_id: number; question: string; answer: string;
}) => api.put(`/faqs/${id}`, data).then(r => r.data);

export const deleteFaqAPI = (id: number) =>
  api.delete(`/faqs/${id}`).then(r => r.data);