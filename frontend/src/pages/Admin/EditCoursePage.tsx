// src/pages/admin/EditCoursePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  fetchCourseById, fetchCategories, updateCourse, createCategory,
  getThumbnailUrl, Category,
} from '../../api/courseApi';

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Page-level loading state (fetching existing course)
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError]     = useState('');

  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields — pre-filled from DB
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId]   = useState<number | ''>('');

  // Thumbnail state
  // existingThumbUrl  = the URL of the image already saved in DB (shown on load)
  // newThumbnail      = a new File the admin picks to replace the existing one
  // thumbPreview      = base64 preview of the newly picked file
  const [existingThumbUrl, setExistingThumbUrl] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail]         = useState<File | null>(null);
  const [thumbPreview, setThumbPreview]         = useState<string | null>(null);

  // Submit state
  const [formError, setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName]     = useState('');
  const [newCatDesc, setNewCatDesc]     = useState('');
  const [catLoading, setCatLoading]     = useState(false);
  const [catError, setCatError]         = useState('');

  // ── Load existing course data on mount ────────────────────
  useEffect(() => {
    if (!id) return;
    Promise.all([fetchCourseById(Number(id)), fetchCategories()])
      .then(([course, cats]) => {
        setTitle(course.title);
        setDescription(course.description || '');
        setCategoryId(course.category_id || '');
        setExistingThumbUrl(getThumbnailUrl(course.thumbnail?.file_path));
        setCategories(cats);
      })
      .catch(() => setPageError('Failed to load course. It may have been deleted.'))
      .finally(() => setPageLoading(false));
  }, [id]);

  // ── Dropzone for new thumbnail ────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setNewThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setThumbPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  // ── Submit (save changes) ─────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError('');
    if (!title.trim()) { setFormError('Title is required'); return; }
    setFormLoading(true);
    try {
      await updateCourse(Number(id), {
        title,
        description,
        category_id: categoryId || undefined,
        thumbnail:   newThumbnail || undefined, // only sent if admin picked a new image
      });
      navigate('/admin/courses');
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to update course');
    } finally { setFormLoading(false); }
  };

  // ── Create category inline ────────────────────────────────
  const handleCreateCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setCatError('');
    if (!newCatName.trim()) { setCatError('Name is required'); return; }
    setCatLoading(true);
    try {
      const newCat = await createCategory(newCatName, newCatDesc);
      setCategories((prev) => [...prev, newCat]);
      setCategoryId(newCat.id);
      setNewCatName(''); setNewCatDesc('');
      setShowCatModal(false);
    } catch (err: any) {
      setCatError(err?.response?.data?.message || 'Failed to create category');
    } finally { setCatLoading(false); }
  };

  // ── What thumbnail area shows ─────────────────────────────
  // Priority: new preview > existing saved image > dropzone
  const showNewPreview      = !!thumbPreview;
  const showExistingPreview = !thumbPreview && !!existingThumbUrl;
  const showDropzone        = !thumbPreview && !existingThumbUrl;

  // ── Render ────────────────────────────────────────────────
  if (pageLoading) {
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

  if (pageError) {
    return (
      <div className="mx-auto max-w-screen-md p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-600">
          ⚠️ {pageError}
        </div>
        <button onClick={() => navigate('/admin/courses')} className="mt-4 text-sm text-blue-600 hover:underline">
          ← Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-md p-4 md:p-6">

      {/* Page header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/courses')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Edit Course</h1>
          <p className="text-sm text-gray-500">Update the details of this course</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to React"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief overview of what students will learn..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Category
            </label>
            <div className="flex gap-3">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 rounded-lg border border-stroke bg-white px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white dark:bg-boxdark outline-none focus:border-blue-500 transition"
              >
                <option value="">— Select a category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                className="shrink-0 rounded-lg border border-blue-600 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition"
              >
                + New Category
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Thumbnail Image{' '}
              <span className="text-gray-400 text-xs font-normal">(JPEG, PNG, WEBP — max 5MB)</span>
            </label>

            {/* NEW image preview (just picked from disk) */}
            {showNewPreview && (
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
                <img src={thumbPreview!} alt="new preview" className="w-full h-full object-cover" />
                {/* Remove new image → fall back to existing or dropzone */}
                <button
                  type="button"
                  onClick={() => { setNewThumbnail(null); setThumbPreview(null); }}
                  className="absolute top-3 right-3 rounded-full bg-black/60 text-white w-8 h-8 flex items-center justify-center hover:bg-black/80 transition text-base"
                >
                  &times;
                </button>
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  New image — {newThumbnail?.name}
                </div>
              </div>
            )}

            {/* EXISTING saved thumbnail */}
            {showExistingPreview && (
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
                <img src={existingThumbUrl!} alt="current thumbnail" className="w-full h-full object-cover" />
                {/* Click to replace */}
                <div
                  {...getRootProps()}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition cursor-pointer group"
                >
                  <input {...getInputProps()} />
                  <span className="opacity-0 group-hover:opacity-100 transition rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-800">
                    Click to replace image
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  Current thumbnail — hover to replace
                </div>
              </div>
            )}

            {/* DROPZONE (no image at all) */}
            {showDropzone && (
              <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                <div
                  {...getRootProps()}
                  className={`rounded-xl p-10 ${
                    isDragActive ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="mb-5 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <svg className="fill-current" width="29" height="28" viewBox="0 0 29 28" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="mb-2 font-semibold text-gray-800 text-lg dark:text-white/90">
                      {isDragActive ? 'Drop image here' : 'Drag & Drop image here'}
                    </h4>
                    <span className="text-center mb-5 block text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG or WebP — max 5MB
                    </span>
                    <span className="font-medium underline text-sm text-brand-500">Browse File</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {formError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {formError}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={formLoading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

      {/* ── Create Category Modal ── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                  <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Programming"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">Description</label>
                  <input type="text" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm text-black dark:border-strokedark dark:text-white outline-none focus:border-blue-500" />
                </div>
                {catError && (
                  <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{catError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCatModal(false); setCatError(''); }}
                    className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition">
                    Cancel
                  </button>
                  <button type="submit" onClick={handleCreateCategory} disabled={catLoading}
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
