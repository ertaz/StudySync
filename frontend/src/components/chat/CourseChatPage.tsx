import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseById, Course } from '../../api/courseApi';
import CourseChat from './CourseChat';

export default function CourseChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchCourseById(Number(id))
      .then(setCourse)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-screen-lg p-4 md:p-6 space-y-4">

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/courses/${id}`)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Course
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-black dark:text-white">
              Student Discussion Room
            </h1>
            {!loading && course && (
              <p className="text-xs text-gray-400 mt-0.5">
                {course.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat — full height */}
      <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden"
           style={{ height: 'calc(100vh - 220px)' }}>
        <CourseChat courseId={Number(id)} fullHeight />
      </div>

    </div>
  );
}