// src/pages/Admin/AdminSettingsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

interface Setting {
  id: number;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

const SETTING_LABELS: Record<string, string> = {
  platform_name:             'Platform Name',
  platform_description:      'Platform Description',
  allow_enrollment:          'Allow Enrollment',
  max_enrollment_per_course: 'Max Enrollment Per Course',
  max_courses_per_student:   'Max Courses Per Student',
  max_courses_per_category:  'Max Courses Per Category',
};

const BOOLEAN_KEYS = new Set(['allow_enrollment']);
const NUMBER_KEYS  = new Set(['max_enrollment_per_course', 'max_courses_per_student', 'max_courses_per_category']);

export default function AdminSettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings]   = useState<Setting[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');

  // Per-row edit state: key → current edited value
  const [editValues, setEditValues]   = useState<Record<string, string>>({});
  // Per-row saving/success/error state
  const [saving, setSaving]           = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError]     = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get('/settings');
      const data: Setting[] = res.data.data;
      setSettings(data);
      // Initialise edit values from DB
      const initial: Record<string, string> = {};
      data.forEach(s => { initial[s.key] = s.value; });
      setEditValues(initial);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (key: string) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    setSaveError(prev => ({ ...prev, [key]: '' }));
    setSaveSuccess(prev => ({ ...prev, [key]: false }));
    try {
      await api.put(`/settings/${key}`, { value: editValues[key] });
      setSaveSuccess(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSaveSuccess(prev => ({ ...prev, [key]: false })), 2000);
      await load();
    } catch (err: any) {
      setSaveError(prev => ({
        ...prev,
        [key]: err?.response?.data?.message || 'Failed to save.',
      }));
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const isDirty = (s: Setting) => editValues[s.key] !== s.value;

  const renderInput = (s: Setting) => {
    if (BOOLEAN_KEYS.has(s.key)) {
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setEditValues(prev => ({
                ...prev,
                [s.key]: prev[s.key] === 'true' ? 'false' : 'true',
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              editValues[s.key] === 'true'
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                editValues[s.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${
            editValues[s.key] === 'true'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-400'
          }`}>
            {editValues[s.key] === 'true' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    if (NUMBER_KEYS.has(s.key)) {
      return (
        <input
          type="number"
          min={1}
          value={editValues[s.key] ?? ''}
          onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))}
          className="w-32 rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
        />
      );
    }

    // text / description
    return (
      <input
        type="text"
        value={editValues[s.key] ?? ''}
        onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))}
        className="w-full max-w-sm rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm text-black outline-none focus:border-blue-500 dark:border-strokedark dark:text-white"
      />
    );
  };

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
          <h1 className="text-2xl font-bold text-black dark:text-white">System Settings</h1>
          <p className="text-sm text-gray-500">Configure global platform behaviour</p>
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {loadError}
          <button onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Settings table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Loading settings...
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="px-6 py-4">Setting</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {settings.map(s => (
                <tr key={s.key} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition">

                  {/* Setting key */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-black dark:text-white text-sm">
                      {SETTING_LABELS[s.key] ?? s.key}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{s.key}</div>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {s.description}
                  </td>

                  {/* Editable value */}
                  <td className="px-6 py-4">
                    {renderInput(s)}
                    {saveError[s.key] && (
                      <p className="mt-1 text-xs text-red-500">{saveError[s.key]}</p>
                    )}
                  </td>

                  {/* Save button */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {saveSuccess[s.key] && (
                        <span className="text-xs text-green-500 font-medium">✓ Saved</span>
                      )}
                      <button
                        onClick={() => handleSave(s.key)}
                        disabled={saving[s.key] || !isDirty(s)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition
                          ${isDirty(s)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border border-stroke bg-gray-50 text-gray-400 dark:border-strokedark dark:bg-meta-4 cursor-not-allowed'
                          } disabled:opacity-60`}
                      >
                        {saving[s.key] ? (
                          <>
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Last updated info */}
      {!loading && settings.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-right">
          Last updated: {new Date(
            Math.max(...settings.map(s => new Date(s.updated_at).getTime()))
          ).toLocaleString()}
        </p>
      )}

    </div>
  );
}
