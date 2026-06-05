import api from './axiosInstance';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  major: string;
  enrollment_year: number;
  date_of_birth?: string;
  phone_number?: string;
  is_active: number;
  created_at: string;
}

export interface EnrollmentItem {
  enrollment_id: number;
  student_id: number;
  student_number: string;
  student_name: string;
  student_email: string;
  course_id: number;
  course_title: string;
  category: string;
  enrollment_year: number;
  enrolled_at: string;
}

export interface ReportSummary {
  totalStudents: number;
  activeCourses: number;
  submissionRate: number;
  unsubmittedCount: number;
  totalAssignments: number;
}

export interface ReportCourse {
  id: number;
  title: string;
  professor: string;
  professorId: number | null;
  category: string;
  sectionsCount: number;
  sections: { id: number; title: string }[];
  studentCount: number;
  totalAssignments: number;
  withSubmission: number;
  withoutSubmission: number;
}

export interface CourseDetail {
  pieData: {
    totalStudents: number;
    submitted: number;
    notSubmitted: number;
  };
  tableRows: {
    studentId: string;
    studentName: string;
    section: string;
    assignment: string;
    submittedAt: string;
    grade: string | number;
    hasSubmission: boolean;
  }[];
}

export interface FilterOptions {
  professors: { id: number; name: string }[];
  years: number[];
}

// ─────────────────────────────────────────────
// REPORT API
// ─────────────────────────────────────────────

export const fetchFilterOptions = (): Promise<FilterOptions> =>
  api.get('/reports/filters').then(r => r.data.data);

export const fetchReportData = (params: {
  professorId?: number | null;
  courseId?: number | null;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ summary: ReportSummary; courses: ReportCourse[] }> => {
  const query = new URLSearchParams();
  if (params.professorId) query.set('professorId', String(params.professorId));
  if (params.courseId)    query.set('courseId',    String(params.courseId));
  if (params.dateFrom)    query.set('dateFrom',    params.dateFrom);
  if (params.dateTo)      query.set('dateTo',      params.dateTo);
  return api.get(`/reports?${query}`).then(r => r.data.data);
};

export const fetchCourseDetail = (
  courseId: number,
  params: { sectionId?: number | null; assignmentId?: number | null; dateFrom?: string; dateTo?: string }
): Promise<CourseDetail> => {
  const query = new URLSearchParams();
  if (params.sectionId)    query.set('sectionId',    String(params.sectionId));
  if (params.assignmentId) query.set('assignmentId', String(params.assignmentId));
  if (params.dateFrom)     query.set('dateFrom',     params.dateFrom);
  if (params.dateTo)       query.set('dateTo',       params.dateTo);
  return api.get(`/reports/courses/${courseId}?${query}`).then(r => r.data.data);
};

// ─────────────────────────────────────────────
// EXPORT HELPERS (trigger file download)
// ─────────────────────────────────────────────

const triggerDownload = (blob: Blob, filename: string) => {
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

type ExportFormat = 'csv' | 'excel' | 'json';

const ext = (f: ExportFormat) => f === 'excel' ? 'xlsx' : f;

// Report exports
export const exportFullReport = async (
  format: ExportFormat,
  params: { professorId?: number | null; courseId?: number | null; dateFrom?: string; dateTo?: string }
) => {
  const query = new URLSearchParams({ format });
  if (params.professorId) query.set('professorId', String(params.professorId));
  if (params.courseId)    query.set('courseId',    String(params.courseId));
  if (params.dateFrom)    query.set('dateFrom',    params.dateFrom!);
  if (params.dateTo)      query.set('dateTo',      params.dateTo!);
  const res = await api.get(`/reports/export?${query}`, { responseType: 'blob' });
  triggerDownload(res.data, `report.${ext(format)}`);
};

export const exportCourseTable = async (
  courseId: number,
  format: ExportFormat,
  params: { sectionId?: number | null; assignmentId?: number | null; dateFrom?: string; dateTo?: string }
) => {
  const query = new URLSearchParams({ format });
  if (params.sectionId)    query.set('sectionId',    String(params.sectionId));
  if (params.assignmentId) query.set('assignmentId', String(params.assignmentId));
  if (params.dateFrom)     query.set('dateFrom',     params.dateFrom!);
  if (params.dateTo)       query.set('dateTo',       params.dateTo!);
  const res = await api.get(`/reports/courses/${courseId}/export?${query}`, { responseType: 'blob' });
  triggerDownload(res.data, `course_${courseId}_submissions.${ext(format)}`);
};

// Students
export const exportStudents = async (format: ExportFormat) => {
  const res = await api.get(`/students/export?format=${format}`, { responseType: 'blob' });
  triggerDownload(res.data, `students.${ext(format)}`);
};
export const importStudents = (formData: FormData) =>
  api.post('/students/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// Courses
export const exportCoursesData = async (format: ExportFormat) => {
  const res = await api.get(`/courses/export?format=${format}`, { responseType: 'blob' });
  triggerDownload(res.data, `courses.${ext(format)}`);
};
export const importCoursesData = (formData: FormData) =>
  api.post('/courses/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// Professors
export const exportProfessorsData = async (format: ExportFormat) => {
  const res = await api.get(`/professors/export?format=${format}`, { responseType: 'blob' });
  triggerDownload(res.data, `professors.${ext(format)}`);
};
export const importProfessorsData = (formData: FormData) =>
  api.post('/professors/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// Categories
export const exportCategoriesData = async (format: ExportFormat) => {
  const res = await api.get(`/categories/export?format=${format}`, { responseType: 'blob' });
  triggerDownload(res.data, `categories.${ext(format)}`);
};
export const importCategoriesData = (formData: FormData) =>
  api.post('/categories/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// Enrollments
export const exportEnrollmentsData = async (format: ExportFormat) => {
  const res = await api.get(`/enrollments/export?format=${format}`, { responseType: 'blob' });
  triggerDownload(res.data, `enrollments.${ext(format)}`);
};
export const importEnrollmentsData = (formData: FormData) =>
  api.post('/enrollments/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// Students list (for admin page)
export const fetchStudentsList = (): Promise<Student[]> =>
  api.get('/students/export?format=json').then(r => r.data);

// Enrollments list
export const fetchEnrollmentsList = (): Promise<EnrollmentItem[]> =>
  api.get('/enrollments/export?format=json').then(r => r.data);
