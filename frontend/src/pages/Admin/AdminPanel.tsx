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
  {
    title: 'Course Feedback',
    description: 'Review, moderate and manage student course feedback submissions.',
    route: '/admin/course-feedback',
    color: 'from-orange-500 to-red-600',
    textColor: 'text-orange-600 hover:text-orange-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h6"/>
        <path d="M17 8l2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: 'Dynamic Report',
    description: 'View assignment reports and analytics across all courses and professors.',
    route: '/dynamic-report',
    color: 'from-sky-500 to-blue-600',
    textColor: 'text-sky-600 hover:text-sky-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    title: 'Admin Settings',
    description: 'Configure global system settings and platform preferences.',
    route: '/admin/settings',
    color: 'from-teal-500 to-cyan-600',
    textColor: 'text-teal-600 hover:text-teal-800',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.11a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.11a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 12 3.11V3a2 2 0 1 1 4 0v.11a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12c0 .66.26 1.3.73 1.77z"/>
      </svg>
    ),
  },
  {
  title: 'Contact Messages',
  description: 'View and manage messages sent by students through the Contact Us page.',
  route: '/admin/messages',
  color: 'from-lime-500 to-green-600',
  textColor: 'text-lime-600 hover:text-lime-800',
  icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
},
{
  title: 'Audit Logs',
  description: 'Track all system activities and user actions.',
  route: '/admin/audit-logs',
  color: 'from-red-500 to-pink-600',
  textColor: 'text-red-600 hover:text-red-800',
  icon: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
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