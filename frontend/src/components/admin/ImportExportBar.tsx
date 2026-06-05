// src/components/admin/ImportExportBar.tsx
import { useRef, useState } from 'react';

type Format = 'csv' | 'excel' | 'json';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface Props {
  label: string;
  onExport: (format: Format) => Promise<void>;
  onImport: (formData: FormData) => Promise<{ data: ImportResult }>;
  onImportSuccess?: () => void;
}

export default function ImportExportBar({ label, onExport, onImport, onImportSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting]   = useState(false);
  const [exporting, setExporting]   = useState<Format | null>(null);
  const [result, setResult]         = useState<ImportResult | null>(null);
  const [error, setError]           = useState('');

  const handleExport = async (format: Format) => {
    setExporting(format);
    try { await onExport(format); }
    catch { setError('Export failed.'); }
    finally { setExporting(null); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setResult(null); setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await onImport(fd);
      setResult(res.data);
      onImportSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Import failed.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Export buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 mr-1">
            Export {label}:
          </span>
          {(['csv', 'excel', 'json'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => handleExport(f)}
              disabled={exporting === f}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stroke bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300 transition disabled:opacity-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {exporting === f ? '...' : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Import button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Import:
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {importing ? 'Importing...' : 'CSV / Excel'}
          </button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}

      {/* Import result */}
      {result && (
        <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">
          ✓ Imported: <strong>{result.imported}</strong> &nbsp;|&nbsp; Skipped: <strong>{result.skipped}</strong>
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-orange-600 dark:text-orange-400">
                {result.errors.length} warning(s)
              </summary>
              <ul className="mt-1 space-y-0.5 text-orange-600 dark:text-orange-400">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
