// src/pages/professor/DynamicReport.tsx
import { useEffect, useState } from 'react';
import {
  fetchFilterOptions, fetchReportData, fetchCourseDetail,
  exportFullReport, exportCourseTable,
  FilterOptions, ReportSummary, ReportCourse, CourseDetail,
} from '../../api/reportApi';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

type Format = 'csv' | 'excel' | 'json';

// ── Small SVG Pie chart ───────────────────────────────────────
function MiniPie({ submitted, notSubmitted }: { submitted: number; notSubmitted: number }) {
  const total = submitted + notSubmitted;
  if (total === 0)
    return (
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-meta-4 flex items-center justify-center text-xs text-gray-400">
        No data
      </div>
    );
  const pct  = submitted / total;
  const r    = 42;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#EAF3DE" strokeWidth="14" />
      <circle
        cx="48" cy="48" r={r} fill="none" stroke="#1D9E75" strokeWidth="14"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        transform="rotate(-90 48 48)"
      />
      {notSubmitted > 0 && (
        <circle
          cx="48" cy="48" r={r} fill="none" stroke="#E24B4A" strokeWidth="14"
          strokeDasharray={`${(notSubmitted / total) * circ} ${circ}`}
          strokeDashoffset={circ * 0.25 - dash}
          transform="rotate(-90 48 48)"
        />
      )}
      <text x="48" y="44" textAnchor="middle" fontSize="13" fontWeight="500" fill="currentColor">{total}</text>
      <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#9CA3AF">students</text>
    </svg>
  );
}

// ── Export buttons strip ──────────────────────────────────────
function ExportStrip({ onExport, loading }: { onExport: (f: Format) => void; loading: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {(['csv', 'excel', 'json'] as Format[]).map(f => (
        <button
          key={f} onClick={() => onExport(f)} disabled={loading}
          className="inline-flex items-center gap-1 rounded border border-stroke bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-strokedark dark:bg-meta-4 dark:text-gray-300 transition disabled:opacity-40"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ── Course detail block ───────────────────────────────────────
function CourseBlock({ course }: { course: ReportCourse }) {
  const [detail, setDetail]             = useState<CourseDetail | null>(null);
  const [loading, setLoading]           = useState(false);
  const [sectionId, setSectionId]       = useState<number | ''>('');
  const [assignmentId, setAssignmentId] = useState<number | ''>('');
  const [assignments, setAssignments]   = useState<{ id: number; title: string; section_id: number | null }[]>([]);
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    api.get(`/assignments?course_id=${course.id}`)
      .then(r => {
        const all = r.data.data || [];
        setAssignments(all.filter((a: any) => a.section_id !== null && a.section_id !== undefined));
      })
      .catch(() => {});
  }, [course.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const d = await fetchCourseDetail(course.id, {
          sectionId:    sectionId    || null,
          assignmentId: assignmentId || null,
          dateFrom:     dateFrom     || undefined,
          dateTo:       dateTo       || undefined,
        });
        if (!cancelled) setDetail(d);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [course.id, sectionId, assignmentId, dateFrom, dateTo]);

  const handleSectionChange = (val: number | '') => {
    setSectionId(val);
    setAssignmentId('');
  };

  const visibleAssignments = sectionId
    ? assignments.filter(a => a.section_id === sectionId)
    : assignments;

  const handleExport = async (format: Format) => {
    setExportLoading(true);
    try {
      await exportCourseTable(course.id, format, {
        sectionId:    sectionId    || null,
        assignmentId: assignmentId || null,
        dateFrom:     dateFrom     || undefined,
        dateTo:       dateTo       || undefined,
      });
    } catch { /* ignore */ }
    finally { setExportLoading(false); }
  };

  return (
    <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden mb-4">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
        <div>
          <p className="font-semibold text-black dark:text-white">{course.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {course.professor}&nbsp;·&nbsp;
            <span className="text-primary">{course.sectionsCount} seksione</span>
          </p>
        </div>
        <ExportStrip onExport={handleExport} loading={exportLoading} />
      </div>

      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Studentë',          value: course.studentCount,      color: '' },
            { label: 'Total assignments',  value: course.totalAssignments,  color: '' },
            { label: 'Me dorëzim',         value: course.withSubmission,    color: 'text-green-600' },
            { label: 'Pa dorëzim',         value: course.withoutSubmission, color: 'text-red-500' },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-gray-50 dark:bg-meta-4 p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{m.label}</p>
              <p className={`text-xl font-semibold ${m.color || 'text-black dark:text-white'}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Seksioni</span>
            <select value={sectionId} onChange={e => handleSectionChange(e.target.value ? Number(e.target.value) : '')}
              className="h-9 rounded-lg border border-stroke bg-white px-3 text-xs dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500">
              <option value="">Të gjithë</option>
              {course.sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Assignment</span>
            <select value={assignmentId} onChange={e => setAssignmentId(e.target.value ? Number(e.target.value) : '')}
              className="h-9 rounded-lg border border-stroke bg-white px-3 text-xs dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 min-w-[140px]">
              <option value="">Të gjithë</option>
              {visibleAssignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Data nga</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-9 rounded-lg border border-stroke bg-white px-3 text-xs dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Data deri</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="h-9 rounded-lg border border-stroke bg-white px-3 text-xs dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Duke ngarkuar...
          </div>
        ) : detail ? (
          <div className="flex gap-5 items-start">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <MiniPie submitted={detail.pieData.submitted} notSubmitted={detail.pieData.notSubmitted} />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-500">Dorëzuan: {detail.pieData.submitted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-gray-500">Nuk dorëzuan: {detail.pieData.notSubmitted}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {detail.tableRows.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Nuk ka submission për këtë filtrim.</p>
              ) : (
                <>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-stroke dark:border-strokedark">
                        <th className="pb-2 pr-4">ID</th>
                        <th className="pb-2 pr-4">Studenti</th>
                        <th className="pb-2 pr-4">Seksioni</th>
                        <th className="pb-2 pr-4">Assignment</th>
                        <th className="pb-2 pr-4">Data</th>
                        <th className="pb-2">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.tableRows.slice(0, 50).map((row, i) => {
                        const submitted = row.hasSubmission;
                        return (
                          <tr key={i} className={`border-b border-stroke/50 dark:border-strokedark/50 ${submitted ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                            <td className="py-1.5 pr-4 font-mono text-gray-400">{row.studentId}</td>
                            <td className={`py-1.5 pr-4 font-medium ${submitted ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.studentName}</td>
                            <td className="py-1.5 pr-4 text-gray-500">{row.section}</td>
                            <td className="py-1.5 pr-4 text-gray-500">{row.assignment}</td>
                            <td className="py-1.5 pr-4 text-gray-500">
                              {submitted ? row.submittedAt : <span className="text-red-400">—</span>}
                            </td>
                            <td className="py-1.5">
                              {submitted ? (
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  row.grade === '—'
                                    ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20'
                                    : Number(row.grade) >= 85
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20'
                                      : Number(row.grade) >= 60
                                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20'
                                        : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                }`}>
                                  {row.grade === '—' ? 'Pa notë' : row.grade}
                                </span>
                              ) : (
                                <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-500 dark:bg-red-900/20">
                                  Pa dorëzim
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {detail.tableRows.length > 50 && (
                    <p className="mt-2 text-xs text-gray-400 text-center">
                      Shfaqen 50 / {detail.tableRows.length} rreshta. Eksporto për listën e plotë.
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tabela reflekton filtrat e zgjedhur</span>
                    <ExportStrip onExport={handleExport} loading={exportLoading} />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function DynamicReport() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ professors: [], years: [] });
  const [summary, setSummary]             = useState<ReportSummary | null>(null);
  const [reportCourses, setReportCourses] = useState<ReportCourse[]>([]);
  const [loading, setLoading]             = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Filters — stored as strings in select/input, converted at call time
  const [professorId, setProfessorId] = useState('');
  const [courseId, setCourseId]       = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  // Course dropdown — scoped to professor when one is selected
  // Populated from reportCourses so it always matches what backend returned
  const [coursesForDropdown, setCoursesForDropdown] = useState<{ id: number; title: string }[]>([]);

  // Load filter options once — vetëm admin i sheh listën e profesorëve
  useEffect(() => {
    if (!isAdmin) return;
    fetchFilterOptions().then(setFilterOptions).catch(() => {});
  }, [isAdmin]);

  // FIX: auto-run report whenever filters change — no button needed
  // Using string state so values are always current synchronously
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchReportData({
          professorId: professorId ? Number(professorId) : null,
          courseId:    courseId    ? Number(courseId)    : null,
          dateFrom:    dateFrom    || undefined,
          dateTo:      dateTo      || undefined,
        });
        if (!cancelled) {
          setSummary(data.summary);
          setReportCourses(data.courses);
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    };
    run();
    return () => { cancelled = true; };
  }, [professorId, courseId, dateFrom, dateTo]);

  // FIX: update courses dropdown from report results — scoped to current professor
  useEffect(() => {
    setCoursesForDropdown(reportCourses.map(c => ({ id: c.id, title: c.title })));
  }, [reportCourses]);

  // FIX: when professor changes, reset courseId so old course doesn't linger
  const handleProfessorChange = (val: string) => {
    setProfessorId(val);
    setCourseId('');
  };

  const handleExportFull = async (format: Format) => {
    setExportLoading(true);
    try {
      await exportFullReport(format, {
        professorId: professorId ? Number(professorId) : null,
        courseId:    courseId    ? Number(courseId)    : null,
        dateFrom:    dateFrom    || undefined,
        dateTo:      dateTo      || undefined,
      });
    } catch { /* ignore */ }
    finally { setExportLoading(false); }
  };

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">Dynamic Report</h1>
        <p className="text-sm text-gray-500">Gjenero raporte dinamike bazuar në kritere specifike</p>
      </div>

      {/* ── Global filter card ── */}
      <div className="rounded-xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-5 mb-6">
        <p className="text-sm font-semibold text-black dark:text-white mb-4">Filtrat e raportit</p>
        <div className="flex flex-wrap gap-3 items-end">

          {isAdmin && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Profesori</span>
            <select
              value={professorId}
              onChange={e => handleProfessorChange(e.target.value)}
              className="h-10 rounded-lg border border-stroke bg-white px-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 min-w-[160px]"
            >
              <option value="">Të gjithë</option>
              {filterOptions.professors.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
          </div>
          )}

          {/* FIX: courses scoped to current professor — populated from reportCourses */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Kursi</span>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="h-10 rounded-lg border border-stroke bg-white px-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500 min-w-[160px]"
            >
              <option value="">Të gjithë</option>
              {coursesForDropdown.map(c => (
                <option key={c.id} value={String(c.id)}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Data nga</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-10 rounded-lg border border-stroke bg-white px-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Data deri</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="h-10 rounded-lg border border-stroke bg-white px-3 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white outline-none focus:border-blue-500" />
          </div>

          {/* Loading indicator replaces button since report runs automatically */}
          {loading && (
            <div className="flex items-center gap-2 h-10 px-3 text-sm text-gray-400">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Duke gjeneruar...
            </div>
          )}
        </div>
      </div>

      {/* ── Summary metrics ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Studentë total',        value: summary.totalStudents,        color: 'text-green-600' },
            { label: 'Kurse aktive',           value: summary.activeCourses,        color: '' },
            { label: 'Shkalla e dorëzimit',    value: `${summary.submissionRate}%`, color: summary.submissionRate >= 70 ? 'text-green-600' : 'text-red-500' },
            { label: 'Assignments pa dorëzim', value: summary.unsubmittedCount,     color: summary.unsubmittedCount > 0 ? 'text-red-500' : 'text-green-600' },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color || 'text-black dark:text-white'}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Export full report bar ── */}
      {summary && (
        <div className="flex items-center justify-between rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark px-5 py-3 mb-6">
          <span className="text-sm text-gray-500">Eksporto raportin e plotë sipas filtrimit aktual</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Format:</span>
            <ExportStrip onExport={handleExportFull} loading={exportLoading} />
          </div>
        </div>
      )}

      {/* ── Course blocks ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Duke gjeneruar raportin...
        </div>
      ) : reportCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <span className="text-5xl">📊</span>
          <p className="text-sm font-medium text-gray-500">Nuk ka të dhëna për filtrat e zgjedhur</p>
        </div>
      ) : (
        reportCourses.map(course => (
          <CourseBlock key={course.id} course={course} />
        ))
      )}
    </div>
  );
}