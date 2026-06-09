// CourseFAQs.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCategoriesAPI, getFaqsByCourseAPI,
  createFaqAPI, deleteFaqAPI,
} from '../../api/faqAPI';

interface Category { id: number; name: string; }
interface FAQ {
  id: number; course_id: number; faqcategory_id: number;
  question: string; answer: string;
  category?: { id: number; name: string };
}

const empty = { faqcategory_id: 0, question: '', answer: '' };

export default function CourseFAQs() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const cId = Number(courseId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs]             = useState<FAQ[]>([]);
  const [form, setForm]             = useState(empty);
  const [error, setError]           = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const load = async () => {
    const [cats, faqList] = await Promise.all([
      getCategoriesAPI(),
      getFaqsByCourseAPI(cId),
    ]);
    setCategories(cats);
    setFaqs(faqList);
  };

  useEffect(() => { load(); }, [cId]);

  const handleSubmit = async () => {
    if (!form.faqcategory_id || !form.question || !form.answer) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setFormLoading(true);
    try {
      await createFaqAPI({ ...form, course_id: cId });
      setForm(empty);
      load();
    } catch (err) {
      setError('Failed to save FAQ. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    setFormLoading(true);
    try {
      await deleteFaqAPI(id);
      load();
    } catch (err) {
      setError('Failed to delete FAQ.');
    } finally {
      setFormLoading(false);
    }
  };

  // Group FAQs by category
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.category?.name ?? 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  // Common input styles
  const inputBase = 'w-full rounded-lg border px-4 py-3 text-sm outline-none transition';
  const inputNormal = 'border-stroke bg-transparent text-black dark:border-strokedark dark:text-white focus:border-blue-500';

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      {/* Header with back button */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/courses`)}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Manage Course FAQs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit or remove frequently asked questions</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark mb-8">
        <div className="p-6 border-b border-stroke dark:border-strokedark">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Add New FAQ
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Category Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} ${inputNormal}`}
              value={form.faqcategory_id}
              onChange={e => setForm(f => ({ ...f, faqcategory_id: Number(e.target.value) }))}
            >
              <option value={0}>— Select a category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Question Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputBase} ${inputNormal}`}
              placeholder="e.g. How long does it take to complete this course?"
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            />
          </div>

          {/* Answer Textarea */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`${inputBase} ${inputNormal} resize-none`}
              placeholder="Provide a detailed answer to the question..."
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={formLoading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {formLoading ? 'Adding...' : 'Add FAQ'}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ List Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white">Existing FAQs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {faqs.length} {faqs.length === 1 ? 'question' : 'questions'} added
          </p>
        </div>

        {Object.entries(grouped).map(([catName, items]) => (
          <div key={catName} className="mb-8">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
              {catName}
            </h3>
            <div className="space-y-3">
              {items.map(faq => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-stroke bg-white p-5 dark:border-strokedark dark:bg-boxdark transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700"
                >
                  <p className="font-semibold text-black dark:text-white mb-2">{faq.question}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  <div className="flex gap-4 mt-4 pt-2 border-t border-stroke dark:border-strokedark">
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-500 dark:text-red-400 text-sm font-medium hover:underline transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-400 dark:text-gray-600">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No FAQs yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first FAQ using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
