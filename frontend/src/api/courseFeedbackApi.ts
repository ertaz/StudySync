import api from './axiosInstance';

export interface FeedbackStudent {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface FeedbackCourse {
  id: number;
  title: string;
}

export interface CourseFeedback {
  id: number;
  course_id: number;
  student_id: number;

  rating: number;
  comment: string;

  status: 'pending' | 'reviewed';

  created_at: string;

  student?: FeedbackStudent;
  course?: FeedbackCourse;
}

export const submitFeedback = (
  course_id: number,
  rating: number,
  comment: string
) =>
  api.post('/course-feedback', {
    course_id,
    rating,
    comment,
  });

export const getCourseFeedback = (
  courseId: number
) =>
  api.get(`/course-feedback/course/${courseId}`);

export const getAllFeedback = () =>
  api.get('/course-feedback')
     .then((r) => r.data.data);

export const markReviewed = (
  id: number
) =>
  api.patch(`/course-feedback/${id}/reviewed`);

export const deleteFeedback = (
  id: number
) =>
  api.delete(`/course-feedback/${id}`);