// src/pages/Admin/AdminCoursesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImportExportBar from '../../components/admin/ImportExportBar';
import {
  fetchCourses, fetchCategories, createCategory, deleteCourse,
  getThumbnailUrl, Course, Category,
} from '../../api/courseApi';
import {
  exportCoursesData,
  importCoursesData,
  exportCategoriesData,
  importCategoriesData,
} from '../../api/reportApi';

type CourseSort     = 'az' | 'za';
type CategorySort   = 'az' | 'za';
type CatCountFilter = '' | '0' | '1+' | '5+' | '10+';

export default function AdminCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses]       = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName]     = useState('');
  const [newCatDesc, setNewCatDesc]     = useState('');
  const [catLoading, setCatLoading]     = useState(false);
  const [catError, setCatError]         = useState('');

  // Course controls
  const [courseSearch, setCourseSearch]         = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const [courseSort, setCourseSort]             = useState<CourseSort>('az');

  // Category controls
  const [catSearch, setCatSearch]           = useState('');
  const [catSort, setCatSort]               = useState<CategorySort>('az');
  const [catCountFilter, setCatCountFilter] = useState<CatCountFilter>('');

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const [c, cats] = await Promise.all([fetchCourses(), fetchCategories()]);
      setCourses(c); setCategories(cats);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || 'Failed to load data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setCatError('');
    if (!newCatName.trim()) { setCatError('Name is required'); return; }
    setCatLoading(true);
    try {
      await createCategory(newCatName, newCatDesc);
      setNewCatName(''); setNewCatDesc('');
      setShowCatModal(false);
      await load();
    } catch (err: any) {
      setCatError(err?.response?.data?.message || 'Failed to create category');
    } finally { setCatLoading(false); }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Derived: filtered + sorted courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = !courseSearch ||
        `${course.title} ${course.description ?? ''} ${course.professor?.first_name ?? ''} ${course.professor?.last_name ?? ''}`
          .toLowerCase().includes(courseSearch.toLowerCase());
      const matchesCategory = !filterCategoryId || course.category_id === filterCategoryId;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return courseSort === 'az' ? cmp : -cmp;
    });

  // Derived: filtered + sorted categories
  const filteredCategories = categories
    .filter(cat => {
      const matchesSearch = !catSearch ||
        `${cat.name} ${cat.description ?? ''}`
          .toLowerCase().includes(catSearch.toLowerCase());
      const count = courses.filter(c => c.category_id === cat.id).length;
      const matchesCount =
        catCountFilter === ''    ? true :
        catCountFilter === '0'   ? count === 0 :
        catCountFilter === '1+'  ? count >= 1 :
        catCountFilter === '5+'  ? count >= 5 :
        catCountFilter === '10+' ? count >= 10 : true;
      return matchesSearch && matchesCount;
    })
    .sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return catSort === 'az' ? cmp : -cmp;
    });

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black dark:text-white">Course Management</h1>
          <p className="text-sm text-gray-500">Manage courses and categories</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/courses/create')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + New Course
        </button>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {loadError}
          <button onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Courses import/export */}
      <ImportExportBar
        label="Courses"
        onExport={exportCoursesData}
        onImport={importCoursesData}
        onImportSuccess={load}
      />

      {/* Course search + category filter + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={courseSearch}
          onChange={e => setCourseSearch(e.target.value)}
          placeholder="Search by title, description or professor..."
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
        <select
          value={filterCategoryId}
          onChange={e => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={courseSort}
          onChange={e => setCourseSort(e.target.value as CourseSort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-40"
        >
          <option value="az">Title: A → Z</option>
          <option value="za">Title: Z → A</option>
        </select>
      </div>

      {/* Courses table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden mb-10">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <span className="text-5xl">📚</span>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              {courseSearch || filterCategoryId ? 'No courses match your search' : 'No courses yet'}
            </p>
            {!courseSearch && !filterCategoryId && (
              <p className="text-sm">Click <strong>+ New Course</strong> to create your first one</p>
            )}
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Professor</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredCourses.map(course => {
                const thumbUrl = getThumbnailUrl(course.thumbnail?.file_path);
                return (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                    <td className="px-6 py-4">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={course.title} className="h-12 w-20 rounded-lg object-cover border border-stroke" />
                      ) : (
                        <div className="h-12 w-20 rounded-lg bg-gray-100 dark:bg-meta-4 flex items-center justify-center text-gray-400 text-lg">📖</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-black dark:text-white">{course.title}</div>
                      {course.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">{course.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {course.category ? (
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {course.category.name}
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.professor
                        ? `${course.professor.first_name} ${course.professor.last_name}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══════════ CATEGORIES SECTION ═══════════ */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white">Categories</h2>
          <p className="text-sm text-gray-500">Manage course categories</p>
        </div>
        <button
          onClick={() => setShowCatModal(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition"
        >
          + New Category
        </button>
      </div>

      {/* Categories import/export */}
      <ImportExportBar
        label="Categories"
        onExport={exportCategoriesData}
        onImport={importCategoriesData}
        onImportSuccess={load}
      />

      {/* Category search + course-count filter + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={catSearch}
          onChange={e => setCatSearch(e.target.value)}
          placeholder="Search categories by name or description..."
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
        <select
          value={catCountFilter}
          onChange={e => setCatCountFilter(e.target.value as CatCountFilter)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-48"
        >
          <option value="">All (any course count)</option>
          <option value="0">Empty (0 courses)</option>
          <option value="1+">Has courses (1+)</option>
          <option value="5+">5+ courses</option>
          <option value="10+">10+ courses</option>
        </select>
        <select
          value={catSort}
          onChange={e => setCatSort(e.target.value as CategorySort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-40"
        >
          <option value="az">Name: A → Z</option>
          <option value="za">Name: Z → A</option>
        </select>
      </div>

      {/* Categories table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <span className="text-4xl">🏷️</span>
            <p className="text-sm font-medium text-gray-500">
              {catSearch || catCountFilter ? 'No categories match your search' : 'No categories yet'}
            </p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredCategories.map(cat => {
                const courseCount = courses.filter(c => c.category_id === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{courseCount} course(s)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-boxdark shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
              <h2 className="text-lg font-bold text-black dark:text-white">New Category</h2>
              <button type="button" onClick={() => { setShowCatModal(false); setCatError(''); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto px-8 pb-8">
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Programming"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Description</label>
                  <input type="text" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-primary" />
                </div>
                {catError && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{catError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCatModal(false); setCatError(''); }}
                    className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={catLoading}
                    className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60">
                    {catLoading ? 'Saving...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}