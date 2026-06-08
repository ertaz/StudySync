import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFaqsByCourseAPI } from "../../api/faqAPI";

interface FAQ {
  id: number; question: string; answer: string;
  category?: { id: number; name: string };
}

export default function CourseFAQAccordion() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [faqs, setFaqs]       = useState<FAQ[]>([]);
  const [open, setOpen]       = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      getFaqsByCourseAPI(parseInt(courseId))
        .then(setFaqs)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  // Show loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-screen-lg p-4 md:p-6">
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Course
        </button>
        <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading FAQs...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "no FAQs" message
  if (faqs.length === 0) {
    return (
      <div className="mx-auto max-w-screen-lg p-4 md:p-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Course
        </button>

        {/* FAQ Header Card */}
        <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden mb-6">
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
                  Frequently Asked Questions
                </span>
                <h1 className="text-3xl font-bold text-black dark:text-white leading-tight">
                  Course FAQs
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Find answers to common questions about this course
                </p>
              </div>
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                0 Questions
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-gray-600">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              No FAQs Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              No frequently asked questions have been posted for this course yet.
              Check back later or contact the course instructor for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group by category
  const grouped = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    const key = faq.category?.name ?? 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-screen-lg p-4 md:p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/courses/${courseId}`)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Course
      </button>

      {/* FAQ Header Card */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden mb-6">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
                Frequently Asked Questions
              </span>
              <h1 className="text-3xl font-bold text-black dark:text-white leading-tight">
                Course FAQs
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Find answers to common questions about this course
              </p>
            </div>
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              {faqs.length} {faqs.length === 1 ? 'Question' : 'Questions'}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="p-6 border-b border-stroke dark:border-strokedark">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            All Questions & Answers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click on any question to reveal the answer
          </p>
        </div>

        <div className="divide-y divide-stroke dark:divide-strokedark">
          {Object.entries(grouped).map(([catName, items]) => (
            <div key={catName}>
              {/* Category header */}
              <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {catName}
                </h3>
              </div>

              {/* FAQ items in this category */}
              {items.map((faq, idx) => (
                <div key={faq.id} className="bg-white dark:bg-boxdark">
                  <button
                    className={`w-full flex justify-between items-center px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                      open === faq.id ? 'bg-gray-50 dark:bg-gray-800/30' : ''
                    }`}
                    onClick={() => setOpen(open === faq.id ? null : faq.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-500 font-mono text-sm mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-base">
                          {faq.question}
                        </span>
                      </div>
                    </div>
                    <span className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                      open === faq.id ? 'rotate-180' : ''
                    }`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  
                  {open === faq.id && (
                    <div className="px-6 pb-5 pt-0">
                      <div className="pl-8 border-l-2 border-blue-200 dark:border-blue-800 ml-5">
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}