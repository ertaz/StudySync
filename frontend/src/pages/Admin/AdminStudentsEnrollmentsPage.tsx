// src/pages/Admin/AdminStudentsEnrollmentsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImportExportBar from '../../components/admin/ImportExportBar';
import {
  exportStudents, importStudents,
  exportEnrollmentsData, importEnrollmentsData,
} from '../../api/reportApi';
import { fetchCourses, Course } from '../../api/courseApi';
import api from '../../api/axiosInstance';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  major: string;
  enrollment_year: number;
  phone_number?: string;
  is_active: number;
}

interface EnrollmentItem {
  enrollment_id: number;
  student_id: number;
  student_number: string;
  student_name: string;
  student_email: string;
  course_id: number;
  course_title: string;
  category: string;
  enrolled_at: string;
}

// ── Mini modal for creating enrollment ───────────────────────
interface CreateEnrollmentModalProps {
  students: Student[];
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateEnrollmentModal({ students, courses, onClose, onSuccess }: CreateEnrollmentModalProps) {
  const [userId, setUserId]     = useState<number | ''>('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !courseId) { setError('Select both student and course.'); return; }
    setLoading(true); setError('');
    try {
      await api.post(`/enrollments/${courseId}`, { user_id: userId });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to enroll.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-boxdark shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-black dark:text-white">New Enrollment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Student</label>
            <select value={userId} onChange={e => setUserId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500">
              <option value="">— Select student —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_number})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Course</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500">
              <option value="">— Select course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sort types ────────────────────────────────────────────────
type StudentSort     = 'year_asc' | 'year_desc';
type EnrollmentSort  = 'date_asc' | 'date_desc';

// ── Main page ─────────────────────────────────────────────────
export default function AdminStudentsEnrollmentsPage() {
  const navigate = useNavigate();

  const [students, setStudents]       = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loadingStudents, setLS]      = useState(true);
  const [loadingEnroll, setLE]        = useState(true);

  const [filterCourseId, setFilterCourseId]     = useState<number | ''>('');
  const [showEnrollModal, setShowEnrollModal]   = useState(false);

  // Students controls
  const [studentSearch, setStudentSearch]       = useState('');
  const [studentSort, setStudentSort]           = useState<StudentSort>('year_asc');

  // Enrollments controls
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentSort, setEnrollmentSort]     = useState<EnrollmentSort>('date_desc');

  const loadStudents = async () => {
    setLS(true);
    try {
      const res = await api.get('/students/export?format=json');
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch { setStudents([]); }
    finally { setLS(false); }
  };

  const loadEnrollments = async () => {
    setLE(true);
    try {
      const res = await api.get('/enrollments/export?format=json');
      setEnrollments(Array.isArray(res.data) ? res.data : []);
    } catch { setEnrollments([]); }
    finally { setLE(false); }
  };

  useEffect(() => {
    loadStudents();
    loadEnrollments();
    fetchCourses().then(setCourses).catch(() => {});
  }, []);

  // ── Derived: students ─────────────────────────────────────────
  const filteredStudents = students
    .filter(s =>
      !studentSearch ||
      `${s.first_name} ${s.last_name} ${s.email} ${s.student_number}`
        .toLowerCase().includes(studentSearch.toLowerCase())
    )
    .sort((a, b) =>
      studentSort === 'year_asc'
        ? a.enrollment_year - b.enrollment_year
        : b.enrollment_year - a.enrollment_year
    );

  // ── Derived: enrollments ──────────────────────────────────────
  const filteredEnrollments = enrollments
    .filter(e => {
      const matchesCourse = filterCourseId ? e.course_id === filterCourseId : true;
      const matchesSearch = !enrollmentSearch ||
        e.student_name.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
        e.student_number.toLowerCase().includes(enrollmentSearch.toLowerCase());
      return matchesCourse && matchesSearch;
    })
    .sort((a, b) => {
      const da = new Date(a.enrolled_at).getTime();
      const db = new Date(b.enrolled_at).getTime();
      return enrollmentSort === 'date_asc' ? da - db : db - da;
    });

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    if (!confirm('Remove this enrollment?')) return;
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(prev => prev.filter(e => e.enrollment_id !== enrollmentId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete enrollment.');
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Students & Enrollments</h1>
          <p className="text-sm text-gray-500">Manage student accounts and course enrollments</p>
        </div>
      </div>

      {/* ═══════════════ STUDENTS SECTION ══════════════════ */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">Students</h2>
      </div>

      <ImportExportBar
        label="Students"
        onExport={exportStudents}
        onImport={importStudents}
        onImportSuccess={loadStudents}
      />

      {/* Student search + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={studentSearch}
          onChange={e => setStudentSearch(e.target.value)}
          placeholder="Search by name, email or student number..."
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
        <select
          value={studentSort}
          onChange={e => setStudentSort(e.target.value as StudentSort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-52"
        >
          <option value="year_asc">Registration: Earliest first</option>
          <option value="year_desc">Registration: Latest first</option>
        </select>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden mb-12">
        {loadingStudents ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <span className="text-4xl">🎓</span>
            <p className="text-sm font-medium text-gray-500">No students found</p>
            <p className="text-xs text-gray-400">Import a CSV/Excel file to add students in bulk</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Student #</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Major</th>
                <th className="px-6 py-4">Reg. Year</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{s.student_number}</td>
                  <td className="px-6 py-4 font-medium text-black dark:text-white">{s.first_name} {s.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.major}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.enrollment_year}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══════════════ ENROLLMENTS SECTION ══════════════════ */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">Enrollments</h2>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + New Enrollment
        </button>
      </div>

      <ImportExportBar
        label="Enrollments"
        onExport={exportEnrollmentsData}
        onImport={importEnrollmentsData}
        onImportSuccess={loadEnrollments}
      />

      {/* Enrollment search + course filter + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={enrollmentSearch}
          onChange={e => setEnrollmentSearch(e.target.value)}
          placeholder="Search by student name or number..."
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
        <select
          value={filterCourseId}
          onChange={e => setFilterCourseId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-52"
        >
          <option value="">— All courses —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select
          value={enrollmentSort}
          onChange={e => setEnrollmentSort(e.target.value as EnrollmentSort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-52"
        >
          <option value="date_desc">Enrolled: Newest first</option>
          <option value="date_asc">Enrolled: Oldest first</option>
        </select>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {loadingEnroll ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading enrollments...
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <span className="text-4xl">📋</span>
            <p className="text-sm font-medium text-gray-500">No enrollments found</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Student #</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Enrolled</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredEnrollments.map(e => (
                <tr key={e.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-black dark:text-white">{e.student_name}</div>
                    <div className="text-xs text-gray-400">{e.student_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{e.student_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{e.course_title}</td>
                  <td className="px-6 py-4">
                    {e.category ? (
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {e.category}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.enrolled_at}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteEnrollment(e.enrollment_id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEnrollModal && (
        <CreateEnrollmentModal
          students={students}
          courses={courses}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={loadEnrollments}
        />
      )}
    </div>
  );
}