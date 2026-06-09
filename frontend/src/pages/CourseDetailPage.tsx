// src/pages/CourseDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, Course } from '../api/courseApi';
import CourseContent from "../components/course/CourseContent";
import { useAuth } from '../context/AuthContext';
import CourseNotesSection
from "../components/course/CourseNotesSection";
import CourseFeedbackForm
from '../components/course/CourseFeedbackForm';  

export default function CourseDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);

  const [course, setCourse]   = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    fetchCourseById(Number(id))
      .then(setCourse)
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <svg className="h-6 w-6 animate-spin mr-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-screen-md p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-600">
          ⚠️ {error || 'Course not found.'}
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-lg p-4 md:p-6">

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Courses
      </button>

      {/* Course header card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">

        {/* Coloured banner instead of thumbnail */}
        <div className={`h-3 w-full ${getBannerColor(course.id)}`} />

        <div className="p-8">
          
  <div className="flex items-start justify-between gap-4">
    <div>
      {course.category && (
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
          {course.category.name}
        </span>
      )}

      <h1 className="text-3xl font-bold text-black dark:text-white leading-tight">
        {course.title}
      </h1>
    </div>

    <div className="flex gap-2">
      {(user?.role === 'admin' || user?.role === 'professor') && (
        <button
          onClick={() => navigate(`/faqs/${id}`)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Manage FAQs
        </button>
      )}

      {user?.role === 'student' && (
        <button
          onClick={() => navigate(`/faq-accordion/${id}`)}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
        >
          View FAQs
        </button>
      )}
    </div>
  </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Added {new Date(course.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Divider */}
          <hr className="my-6 border-stroke dark:border-strokedark" />

          {/* Description */}
          {course.description ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                About this course
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No description provided.</p>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="mt-6 rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="px-8 py-5 border-b border-stroke dark:border-strokedark">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Course Content</h2>
        </div>
        <div className="p-8">
          <CourseContent courseId={Number(id)} />
        </div>
      </div>

      {/* Student-only tools: Notes, Chat, Feedback */}
      {user?.role !== 'professor' && (
        <div className="mt-6 flex flex-col gap-4">

          {/* Notes */}
          <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-black dark:text-white">Student Notes</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Personal notes for this course</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotes(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
              >
                Open Notes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notes Drawer */}
          <div
            className={`fixed inset-0 z-50 flex justify-end pt-20 transition-all duration-300 ${
              showNotes ? "visible bg-black/40" : "invisible bg-black/0"
            }`}
            onClick={(e) => { if (e.target === e.currentTarget) setShowNotes(false); }}
          >
            <div
              className={`w-full max-w-lg bg-white dark:bg-boxdark h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${
                showNotes ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-stroke dark:border-strokedark">
                <h2 className="font-semibold text-lg text-black dark:text-white">Course Notes</h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <CourseNotesSection courseId={Number(id)} renderCompact />
              </div>
            </div>
          </div>

          {/* Discussion Room */}
          <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-black dark:text-white">Student Discussion Room</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Chat with other enrolled students</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/${id}/chat`)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Open Chat
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Feedback — students only */}
          {user?.role === 'student' && (
            <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden">
              <div className="px-8 py-5 border-b border-stroke dark:border-strokedark">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Leave Feedback</h2>
              </div>
              <div className="p-8">
                <CourseFeedbackForm courseId={Number(id)} />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
      );
    }

    
    
// Picks a consistent top-banner colour based on the course id
function getBannerColor(id: number): string {
  const colors = [
    'bg-gradient-to-r from-blue-500 to-indigo-600',
    'bg-gradient-to-r from-violet-500 to-purple-600',
    'bg-gradient-to-r from-emerald-400 to-teal-500',
    'bg-gradient-to-r from-orange-400 to-red-500',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-amber-400 to-orange-500',
  ];
  return colors[id % colors.length];
}