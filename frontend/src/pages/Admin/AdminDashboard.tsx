// src/pages/Admin/AdminDashboard.tsx
// Professors management — list + create + edit + delete + import/export
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProfessorForm from '../../components/admin/CreateProfessorForm';
import EditProfessorModal  from '../../components/admin/EditProfessorModal';
import ImportExportBar     from '../../components/admin/ImportExportBar';
import {
  getAllProfessorsAPI,
  deleteProfessorAPI,
} from '../../api/adminAPI';
import {
  exportProfessorsData,
  importProfessorsData,
} from '../../api/reportApi';


interface RawProfessor {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  professorProfile?:  { title?: string; department?: string; years_of_experience?: number; phone_number?: string; };
  ProfessorProfile?:  { title?: string; department?: string; years_of_experience?: number; phone_number?: string; };
  professor_profile?: { title?: string; department?: string; years_of_experience?: number; phone_number?: string; };
}

// Flat shape used throughout the UI
interface Professor {
  id:                   number;
  first_name:           string;
  last_name:            string;
  email:                string;
  title?:               string;
  department?:          string;
  years_of_experience?: number;
  phone_number?:        string;
}

// Flatten nested Sequelize response into the flat Professor shape
const flatten = (raw: RawProfessor): Professor => {
  const profile =
    raw.professorProfile ??
    raw.ProfessorProfile ??
    raw.professor_profile ??
    {};
  return {
    id:                  raw.id,
    first_name:          raw.first_name,
    last_name:           raw.last_name,
    email:               raw.email,
    title:               profile.title,
    department:          profile.department,
    years_of_experience: profile.years_of_experience,
    phone_number:        profile.phone_number,
  };
};

type NameSort  = 'az' | 'za';
type YearsSort = 'none' | 'high' | 'low';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editProf, setEditProf]     = useState<Professor | null>(null);

  // Search + sort state
  const [professorSearch, setProfessorSearch] = useState('');
  const [nameSort, setNameSort]               = useState<NameSort>('az');
  const [yearsSort, setYearsSort]             = useState<YearsSort>('none');

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const data = await getAllProfessorsAPI();
      const raw: RawProfessor[] = data.professors || [];
      console.log('[AdminDashboard] raw professor sample:', raw[0]); // ← remove after confirming
      setProfessors(raw.map(flatten));
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || 'Failed to load professors.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this professor? This cannot be undone.')) return;
    try {
      await deleteProfessorAPI(id);
      setProfessors(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete professor.');
    }
  };

  // Derived filtered + sorted list
  const filteredProfessors = professors
    .filter(p => {
      if (!professorSearch) return true;
      return `${p.first_name} ${p.last_name} ${p.email} ${p.title ?? ''} ${p.department ?? ''}`
        .toLowerCase()
        .includes(professorSearch.toLowerCase());
    })
    .sort((a, b) => {
      // First sort by experience if selected
      if (yearsSort !== 'none') {
        const yA = a.years_of_experience ?? -1;
        const yB = b.years_of_experience ?? -1;
        const expCmp = yearsSort === 'high' ? yB - yA : yA - yB;
        if (expCmp !== 0) return expCmp;
      }
      // Then (or primarily) sort by first name A→Z / Z→A
      const nameCmp = a.first_name.toLowerCase().localeCompare(b.first_name.toLowerCase());
      return nameSort === 'az' ? nameCmp : -nameCmp;
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
          <h1 className="text-2xl font-bold text-black dark:text-white">Professor Management</h1>
          <p className="text-sm text-gray-500">Create, edit and manage professor accounts</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          {showCreate ? '✕ Cancel' : '+ New Professor'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6">
          <CreateProfessorForm
            onSuccess={() => { setShowCreate(false); load(); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      <ImportExportBar
        label="Professors"
        onExport={exportProfessorsData}
        onImport={importProfessorsData}
        onImportSuccess={load}
      />

      {/* Search + sort controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={professorSearch}
          onChange={e => setProfessorSearch(e.target.value)}
          placeholder="Search by name, email, title or department..."
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
        <select
          value={nameSort}
          onChange={e => setNameSort(e.target.value as NameSort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-40"
        >
          <option value="az">Name: A → Z</option>
          <option value="za">Name: Z → A</option>
        </select>
        <select
          value={yearsSort}
          onChange={e => setYearsSort(e.target.value as YearsSort)}
          className="rounded-lg border border-stroke bg-white px-4 py-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 sm:w-48"
        >
          <option value="none">Experience: Default</option>
          <option value="high">Experience: High → Low</option>
          <option value="low">Experience: Low → High</option>
        </select>
      </div>

      {/* Error */}
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {loadError}
          <button onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading professors...
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <span className="text-5xl">👨‍🏫</span>
            <p className="text-base font-medium text-gray-500">
              {professorSearch ? 'No professors match your search' : 'No professors yet'}
            </p>
            {!professorSearch && (
              <p className="text-sm">Click <strong>+ New Professor</strong> or import a file above</p>
            )}
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Exp.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredProfessors.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-black dark:text-white">{p.first_name} {p.last_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.department || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.years_of_experience != null ? `${p.years_of_experience} yr` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProf(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal — uses onClose to match EditProfessorModalProps */}
      {editProf && (
        <EditProfessorModal
          professor={editProf}
          onClose={() => setEditProf(null)}
          onSuccess={() => { setEditProf(null); load(); }}
        />
      )}
    </div>
  );
}