import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCourses,
  fetchCategories,
  getThumbnailUrl,
  Course,
  Category
} from '../api/courseApi';
import { fetchMyEnrollments, enrollInCourse } from '../api/enrollmentApi';
import { useAuth } from '../context/AuthContext';

type SortOption = 'az' | 'za';

export default function CoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('az');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      fetchCategories(),
      fetchMyEnrollments()
    ]).then(([c, cats, enrollments]) => {
      setCourses(c);
      setCategories(cats);
      setEnrolledIds(new Set(enrollments.map((e) => e.course_id)));
      setLoading(false);
    });
  }, []);

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Enrollment failed.');
    }
  };

  const filtered = courses
    .filter((c) => {
      const matchesCat =
        activeCategory === null || c.category_id === activeCategory;

      const matchesSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (`${c.professor?.first_name ?? ''} ${c.professor?.last_name ?? ''}`)
          .toLowerCase().includes(search.toLowerCase());

      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return sort === 'az' ? cmp : -cmp;
    });

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Courses
        </h1>
        <p className="mt-1 text-gray-500">
          Browse all available courses
        </p>
      </div>

      {/* Search + sort + category filter */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description or professor..."
          className="flex-1 rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm text-black dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-primary"
        />

        {/* Sort toggle */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-primary sm:w-40"
        >
          <option value="az">Sort: A → Z</option>
          <option value="za">Sort: Z → A</option>
        </select>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === null
                ? 'bg-primary text-white'
                : 'border border-stroke text-gray-600 hover:border-primary hover:text-primary dark:border-strokedark dark:text-gray-300'
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'border border-stroke text-gray-600 hover:border-primary hover:text-primary dark:border-strokedark dark:text-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Loading courses...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <span className="text-5xl">📚</span>
          <span className="text-lg">No courses found</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledIds.has(course.id)}
              onEnroll={handleEnroll}
              userRole={user?.role}
              userId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  isEnrolled,
  onEnroll,
  userRole,
  userId,
}: {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (id: number) => Promise<void>;
  userRole?: string;
  userId?: number;
}) {
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const isAdmin = userRole === 'admin';
  const isProfessor = userRole === 'professor';
  const isAssignedProfessor =
    isProfessor && course.professor_id === userId;

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-red-500',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-500',
  ];

  const gradient = gradients[course.id % gradients.length];
  const thumbUrl = getThumbnailUrl(course.thumbnail?.file_path);

  const handleEnrollClick = async () => {
    setEnrolling(true);
    await onEnroll(course.id);
    setEnrolling(false);
  };

  return (
    <div className="group rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">

      {/* Thumbnail */}
      <div className={`h-40 w-full overflow-hidden ${!thumbUrl ? `bg-gradient-to-br ${gradient}` : ''} flex items-center justify-center shrink-0`}>
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl text-white/80 select-none">📖</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {course.category && (
          <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary w-fit">
            {course.category.name}
          </span>
        )}

        <h3 className="mt-1 text-base font-bold text-black dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {course.professor && (
          <p className="mt-1 text-sm font-medium text-blue-800 dark:text-blue-400">
            Professor: {course.professor.first_name} {course.professor.last_name}
          </p>
        )}

        {course.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
            {course.description}
          </p>
        )}

        {/* ACTIONS */}
        <div className="mt-4 pt-3 border-t border-stroke dark:border-strokedark flex flex-col gap-2">

          {(!(!isAdmin && !isProfessor && !isEnrolled)) && (
            <span className="text-xs text-gray-400">
              {new Date(course.created_at).toLocaleDateString()}
            </span>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate(`/courses/${course.id}`)} className="text-sm font-medium text-primary hover:underline transition">View Course</button>
              <button type="button" onClick={() => navigate(`/courses/${course.id}?tab=assignments`)} className="text-sm font-medium text-indigo-600 hover:underline transition">Assignments</button>
              <button type="button" onClick={() => navigate(`/courses/${course.id}/announcements`)} className="text-sm font-medium text-orange-500 hover:underline transition">Announcements</button>
            </div>
          )}

          {/* ASSIGNED PROFESSOR */}
          {isAssignedProfessor && (
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/courses/${course.id}`)} className="text-sm font-medium text-violet-600 hover:underline transition">My Course</button>
              <button onClick={() => navigate(`/courses/${course.id}?tab=assignments`)} className="text-sm font-medium text-indigo-600 hover:underline transition">Assignments</button>
              <button onClick={() => navigate(`/courses/${course.id}/announcements`)} className="text-sm font-medium text-orange-500 hover:underline transition">Announcements</button>
            </div>
          )}



          {/* STUDENT */}
          {!isAdmin && !isProfessor && (
            isEnrolled ? (
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(`/courses/${course.id}`)} className="text-sm font-medium text-emerald-600 hover:underline transition">Go to Course</button>
                <button onClick={() => navigate(`/courses/${course.id}?tab=assignments`)} className="text-sm font-medium text-indigo-600 hover:underline transition">Assignments</button>
                <button onClick={() => navigate(`/courses/${course.id}/announcements`)} className="text-sm font-medium text-orange-500 hover:underline transition">Announcements</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
                <button
                  disabled={enrolling}
                  onClick={handleEnrollClick}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}