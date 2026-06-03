import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateProfessorForm from '../../components/admin/CreateProfessorForm';
import EditProfessorModal from '../../components/admin/EditProfessorModal';
import { getAllProfessorsAPI, deleteProfessorAPI } from '../../api/adminAPI';

interface Professor {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  professorProfile?: {
    title:               string;
    department:          string;
    years_of_experience: number;
    phone_number:        string;
  };
}

export default function AdminDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [showForm,         setShowForm]         = useState(false);
  const [professors,       setProfessors]       = useState<Professor[]>([]);
  const [loadingList,      setLoadingList]      = useState(true);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [deletingId,       setDeletingId]       = useState<number | null>(null);

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
    fetchProfessors();
  };

  const handleEditSuccess = () => {
    setEditingProfessor(null);
    fetchProfessors();
  };

  const handleDelete = async (prof: Professor) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${prof.first_name} ${prof.last_name}?\n\nThey will no longer be able to log in.`
    );
    if (!confirmed) return;

    setDeletingId(prof.id);
    try {
      await deleteProfessorAPI(prof.id);
      fetchProfessors();
    } catch {
      alert('Failed to deactivate professor. Please try again.');
    } finally {
      setDeletingId(null);
    }
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

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 shadow-theme-xs transition"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
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
                      {prof.professorProfile?.title || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.professorProfile?.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {prof.professorProfile?.years_of_experience ?? '—'} yrs
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        {/* Edit button */}
                        <button
                          onClick={() => setEditingProfessor(prof)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                     text-brand-600 border border-brand-200 rounded-lg
                                     hover:bg-brand-50 dark:text-brand-400 dark:border-brand-800
                                     dark:hover:bg-brand-900/20 transition"
                        >
                          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652
                                 L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685
                                 a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                          Edit
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(prof)}
                          disabled={deletingId === prof.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                     text-red-600 border border-red-200 rounded-lg
                                     hover:bg-red-50 dark:text-red-400 dark:border-red-800
                                     dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed
                                     transition"
                        >
                          {deletingId === prof.id ? (
                            <>
                              <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Removing…
                            </>
                          ) : (
                            <>
                              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21
                                     c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673
                                     a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077
                                     L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397
                                     m-12 .562c.34-.059.68-.114 1.022-.165
                                     m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916
                                     c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0
                                     c-1.18.037-2.09 1.022-2.09 2.201v.916
                                     m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Professor Modal */}
      {editingProfessor && (
        <EditProfessorModal
          professor={editingProfessor}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingProfessor(null)}
        />
      )}

    </div>
  );
}
