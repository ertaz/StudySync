import api from './axiosInstance';

// GET announcements by course
export const getAnnouncementsAPI = (courseId: string | number) =>
  api.get(`/announcements/course/${courseId}`);

// CREATE announcement
export const createAnnouncementAPI = (data: {
  title: string;
  content: string;
  course_id: string | number;
}) => api.post('/announcements', data);

// DELETE announcement
export const deleteAnnouncementAPI = (id: number) =>
  api.delete(`/announcements/${id}`);