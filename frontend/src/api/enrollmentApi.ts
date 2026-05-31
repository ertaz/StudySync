import api from './axiosInstance';

export interface Enrollment {
  id:          number;
  user_id:     number;
  course_id:   number;
  enrolled_at: string;
  course?:     import('./courseApi').Course;
}

// Enroll in a course
export const enrollInCourse = (courseId: number): Promise<Enrollment> =>
  api.post(`/enrollments/${courseId}`).then((r) => r.data.data);

// Get all my enrollments (with course info)
export const fetchMyEnrollments = (): Promise<Enrollment[]> =>
  api.get('/enrollments/me').then((r) => r.data.data);

// Check if enrolled in a specific course
export const checkEnrollment = (courseId: number): Promise<boolean> =>
  api.get(`/enrollments/check/${courseId}`).then((r) => r.data.isEnrolled);