import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateProfessorForm from '../../components/admin/CreateProfessorForm';
import { getAllProfessorsAPI } from '../../api/adminAPI';

interface Professor {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  ProfessorProfile?: {
    title:               string;
    department:          string;
    years_of_experience: number;
    phone_number:        string;
  };
}

export default function AdminDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [showForm, setShowForm]         = useState(false);
  const [professors, setProfessors]     = useState<Professor[]>([]);
  const [loadingList, setLoadingList]   = useState(true);

  // Redirect non-admins away immediately
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Load professors list
  const fetchProfessors = async () => {
    try {
      setLoadingList(true);
      const data = await getAllProfessorsAPI();
      setProfessors(data.professors || []);
    } catch {
      setProfessors([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchProfessors(); // Refresh list after creating
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome, {user?.first_name}. Manage professors from here.
          </p>
        </div>

        {/* Create Professor button — only shown when form is hidden */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 shadow-theme-xs transition"
          >
            <svg
              className="size-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Professor
          </button>
        )}
      </div>

      {/* Create Professor Form */}
      {showForm && (
        <CreateProfessorForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Professors List */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Professors ({professors.length})
          </h2>
        </div>

        {loadingList ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Loading professors...
          </div>
        ) : professors.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No professors yet. Click "Create Professor" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {professors.map(prof => (
                  <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">
                      {prof.first_name} {prof.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.ProfessorProfile?.title || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.ProfessorProfile?.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.ProfessorProfile?.years_of_experience ?? '—'} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}