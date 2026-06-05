// src/pages/Admin/AdminPanel.tsx
import { useNavigate } from 'react-router-dom';

interface PanelCard {
  title: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  badge?: string;
}

const panels: PanelCard[] = [
  {
    title: 'Professor Management',
    description: 'Manage professors, assign courses and monitor activity.',
    route: '/admin/professors',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-600 hover:text-green-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10l-10-5L2 10l10 5 10-5z"/>
        <path d="M6 12v5c0 1.1 3.6 3 8 3s8-1.9 8-3v-5"/>
      </svg>
    ),
  },
  {
    title: 'Course Management',
    description: 'Create, edit and delete courses. Manage categories and thumbnails.',
    route: '/admin/courses',
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600 hover:text-blue-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    title: 'Students & Enrollments',
    description: 'Manage student accounts and course enrollments. Import/export in bulk.',
    route: '/admin/students',
    color: 'from-violet-500 to-purple-600',
    textColor: 'text-violet-600 hover:text-violet-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-8">

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black dark:text-white">Admin Panel</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Select a section below to manage the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map(panel => (
          <button
            key={panel.route}
            type="button"
            onClick={() => navigate(panel.route)}
            className="group relative rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark shadow-sm hover:shadow-lg transition-all text-left overflow-hidden"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${panel.color}`} />
            <div className="p-6">
              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-black dark:text-white">
                {panel.icon}
              </div>
              {panel.badge && (
                <span className="absolute top-5 right-5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {panel.badge}
                </span>
              )}
              <h2 className="mb-1.5 text-lg font-bold text-black dark:text-white">{panel.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{panel.description}</p>
              <div className={`mt-5 flex items-center gap-1.5 text-sm font-medium ${panel.textColor} transition-colors`}>
                Go to {panel.title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
